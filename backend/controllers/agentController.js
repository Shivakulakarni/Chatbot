import WelfareAgent from '../../src/agent/welfareAgent.js';
import Conversation from '../models/Conversation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Agent instances cache
const agentInstances = new Map();

/**
 * Get or create agent instance for session
 */
const getAgentInstance = async (sessionId, userId) => {
  if (!agentInstances.has(sessionId)) {
    const agent = new WelfareAgent({
      openaiApiKey: process.env.OPENAI_API_KEY,
      language: 'mr-IN',
      model: 'gpt-4-turbo-preview',
      maxTurns: 20
    });
    await agent.initialize();
    agentInstances.set(sessionId, agent);
    
    // Auto-cleanup after 1 hour of inactivity
    setTimeout(() => {
      agentInstances.delete(sessionId);
    }, 60 * 60 * 1000);
  }
  return agentInstances.get(sessionId);
};

/**
 * @desc    Process user input
 * @route   POST /api/agent/process
 * @access  Private
 */
export const processUserInput = asyncHandler(async (req, res) => {
  const { userInput, sessionId, language = 'mr-IN' } = req.body;
  const userId = req.user.id;

  if (!userInput || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'User input and session ID are required'
    });
  }

  try {
    // Get agent instance
    const agent = await getAgentInstance(sessionId, userId);

    // Process input
    const result = await agent.processUserInput(userInput);

    // Save conversation to database
    await Conversation.findOneAndUpdate(
      { sessionId, userId },
      {
        $push: {
          messages: [
            { role: 'user', content: userInput, timestamp: new Date() },
            { role: 'assistant', content: result.response, timestamp: new Date() }
          ]
        },
        $set: {
          lastActivity: new Date(),
          eligibleSchemes: result.eligibleSchemes,
          userProfile: agent.memory.userProfile
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        response: result.response,
        eligibleSchemes: result.eligibleSchemes,
        shouldContinue: result.shouldContinue,
        plan: result.plan,
        toolsUsed: result.toolsUsed,
        sessionId
      }
    });
  } catch (error) {
    console.error('Agent processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process input',
      message: error.message
    });
  }
});

/**
 * @desc    Get conversation history
 * @route   GET /api/agent/conversation/:sessionId
 * @access  Private
 */
export const getConversationHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const conversation = await Conversation.findOne({ sessionId, userId });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found'
    });
  }

  res.status(200).json({
    success: true,
    data: conversation
  });
});

/**
 * @desc    Check eligibility
 * @route   POST /api/agent/eligibility
 * @access  Private
 */
export const checkEligibility = asyncHandler(async (req, res) => {
  const { userProfile } = req.body;
  const userId = req.user.id;

  const agent = new WelfareAgent({
    openaiApiKey: process.env.OPENAI_API_KEY
  });
  await agent.initialize();

  const eligibility = agent.eligibilityChecker.checkEligibility(userProfile);

  res.status(200).json({
    success: true,
    data: eligibility
  });
});

/**
 * @desc    Clear conversation
 * @route   DELETE /api/agent/conversation/:sessionId
 * @access  Private
 */
export const clearConversation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  await Conversation.deleteOne({ sessionId, userId });
  agentInstances.delete(sessionId);

  res.status(200).json({
    success: true,
    message: 'Conversation cleared successfully'
  });
});
