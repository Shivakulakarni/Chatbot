import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Route imports
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agent.js';
import schemeRoutes from './routes/schemes.js';
import applicationRoutes from './routes/applications.js';
import userRoutes from './routes/users.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { logger } from './middleware/logger.js';

dotenv.config();

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', authenticate, agentRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', authenticate, applicationRoutes);
app.use('/api/users', authenticate, userRoutes);

// WebSocket for real-time voice interaction
import WelfareAgent from '../src/agent/welfareAgent.js';
import Conversation from './models/Conversation.js';

// Store active agent sessions
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  let sessionId = null;
  let userId = null;
  let agentInstance = null;

  // Initialize agent for session
  socket.on('initSession', async (data) => {
    try {
      sessionId = data.sessionId || `session-${socket.id}-${Date.now()}`;
      userId = data.userId;
      
      // Create or retrieve agent instance
      if (!activeSessions.has(sessionId)) {
        agentInstance = new WelfareAgent({
          openaiApiKey: process.env.OPENAI_API_KEY,
          useMockLLM: process.env.USE_MOCK_LLM === 'true',
          language: data.language || 'mr-IN'
        });
        await agentInstance.initialize();
        activeSessions.set(sessionId, agentInstance);
      } else {
        agentInstance = activeSessions.get(sessionId);
      }
      
      socket.emit('sessionInitialized', { sessionId });
    } catch (error) {
      console.error('Session init error:', error);
      socket.emit('error', { message: 'Failed to initialize session' });
    }
  });

  // Handle text messages
  socket.on('userMessage', async (data) => {
    try {
      const { text, language = 'mr-IN', isVoice = false } = data;
      
      if (!agentInstance) {
        socket.emit('error', { message: 'Session not initialized' });
        return;
      }
      
      // Emit thinking status
      socket.emit('agentThinking', {
        phase: 'processing',
        status: 'Understanding your query...'
      });
      
      // Process input through agent
      const result = await agentInstance.processUserInput(text);
      
      // Save to database
      if (userId && sessionId) {
        await Conversation.findOneAndUpdate(
          { sessionId, userId },
          {
            $push: {
              messages: [
                { role: 'user', content: text, timestamp: new Date() },
                { role: 'assistant', content: result.response, timestamp: new Date() }
              ]
            },
            $set: {
              lastActivity: new Date(),
              eligibleSchemes: result.eligibleSchemes,
              userProfile: agentInstance.memory?.userProfile || {}
            }
          },
          { upsert: true, new: true }
        );
      }
      
      // Send response
      socket.emit('agentMessage', {
        text: result.response,
        schemes: result.eligibleSchemes,
        memory: agentInstance.memory?.userProfile || {},
        toolsUsed: result.toolsUsed,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Message processing error:', error);
      socket.emit('error', { 
        message: 'Failed to process message',
        details: error.message 
      });
    }
  });

  // Handle voice input
  socket.on('voice-input', async (data) => {
    try {
      const { audioData, language = 'mr-IN' } = data;
      
      socket.emit('agentThinking', {
        phase: 'transcribing',
        status: 'Converting speech to text...'
      });
      
      // In production, use STT service here
      // For now, use mock response
      const mockText = 'मला कल्याण योजनांबद्दल माहिती हवी आहे';
      
      // Process as text message
      socket.emit('userMessage', { text: mockText, language, isVoice: true });
      
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Clear memory
  socket.on('clearMemory', async () => {
    try {
      if (agentInstance) {
        agentInstance.memory?.clear();
      }
      if (userId && sessionId) {
        await Conversation.findOneAndUpdate(
          { sessionId, userId },
          { $set: { messages: [], userProfile: {}, eligibleSchemes: [] } }
        );
      }
      socket.emit('memoryCleared', { success: true });
    } catch (error) {
      socket.emit('error', { message: 'Failed to clear memory' });
    }
  });
  
  // Get conversation history
  socket.on('getHistory', async () => {
    try {
      if (userId && sessionId) {
        const conversation = await Conversation.findOne({ sessionId, userId });
        socket.emit('conversationHistory', { 
          messages: conversation?.messages || [],
          userProfile: conversation?.userProfile || {},
          schemes: conversation?.eligibleSchemes || []
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to load history' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up session after 30 minutes
    if (sessionId) {
      setTimeout(() => {
        activeSessions.delete(sessionId);
      }, 30 * 60 * 1000);
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/welfare-agent');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Welfare Agent Backend Server                           ║
║  📡 Port: ${PORT}                                          ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}  ║
║  ✅ Status: Running                                        ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();

export { io };
export default app;
