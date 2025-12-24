import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  userProfile: {
    name: String,
    age: Number,
    income: Number,
    category: String,
    state: String,
    district: String,
    occupation: String,
    disability: Boolean,
    familyMembers: Number,
    hasRation: Boolean,
    hasLand: Boolean
  },
  eligibleSchemes: [{
    schemeId: String,
    schemeName: String,
    score: Number,
    reasons: [String]
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
conversationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

// Auto-delete abandoned conversations after 30 days
conversationSchema.index({ lastActivity: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 
});

export default mongoose.model('Conversation', conversationSchema);
