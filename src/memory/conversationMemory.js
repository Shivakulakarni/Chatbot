import fs from 'fs/promises';
import path from 'path';

/**
 * Conversation Memory Management System
 * Handles context tracking, conversation history, contradiction detection
 */
export class ConversationMemory {
  constructor(storageFile = './data/conversation_history.json') {
    this.storageFile = storageFile;
    this.conversationHistory = [];
    this.userProfile = {
      age: null,
      income: null,
      categories: [],
      location: null,
      occupation: null,
      dependents: 0,
      languages: ['mr-IN']
    };
    this.extractedInformation = {};
    this.contradictions = [];
    this.clarificationNeeded = [];
  }

  async initialize() {
    try {
      const dir = path.dirname(this.storageFile);
      await fs.mkdir(dir, { recursive: true });
      if (fs.existsSync(this.storageFile)) {
        const data = await fs.readFile(this.storageFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.conversationHistory = parsed.history || [];
        this.userProfile = parsed.userProfile || this.userProfile;
        this.extractedInformation = parsed.extractedInfo || {};
      }
    } catch (error) {
      console.log('Starting with fresh conversation memory');
    }
  }

  /**
   * Add message to conversation history
   */
  addMessage(role, content, metadata = {}) {
    const message = {
      id: this.conversationHistory.length + 1,
      timestamp: new Date().toISOString(),
      role, // 'user' or 'assistant'
      content,
      language: metadata.language || 'mr-IN',
      confidence: metadata.confidence || 1.0,
      metadata
    };
    this.conversationHistory.push(message);
    return message;
  }

  /**
   * Get conversation context for LLM
   */
  getContext(maxTurns = 10) {
    const recentMessages = this.conversationHistory.slice(-maxTurns);
    return {
      messages: recentMessages,
      userProfile: this.userProfile,
      extractedInfo: this.extractedInformation,
      contradictions: this.contradictions,
      clarificationNeeded: this.clarificationNeeded
    };
  }

  /**
   * Update user profile from extracted information
   */
  updateUserProfile(extractedData) {
    const oldProfile = JSON.parse(JSON.stringify(this.userProfile));
    
    // Check for contradictions
    if (extractedData.age && this.userProfile.age && extractedData.age !== this.userProfile.age) {
      this.contradictions.push({
        field: 'age',
        previousValue: this.userProfile.age,
        newValue: extractedData.age,
        timestamp: new Date().toISOString()
      });
      this.clarificationNeeded.push(`उम्र संबंधी विरोधाभास: पहिल्या ${this.userProfile.age}, आता ${extractedData.age}`);
    }

    if (extractedData.income && this.userProfile.income && extractedData.income !== this.userProfile.income) {
      this.contradictions.push({
        field: 'income',
        previousValue: this.userProfile.income,
        newValue: extractedData.income,
        timestamp: new Date().toISOString()
      });
      this.clarificationNeeded.push(`आय संबंधी विरोधाभास: पहिल्या ${this.userProfile.income}, आता ${extractedData.income}`);
    }

    // Update profile
    Object.assign(this.userProfile, extractedData);
    return { oldProfile, newProfile: this.userProfile, contradictions: this.contradictions };
  }

  /**
   * Store extracted information
   */
  storeExtractedInfo(key, value) {
    this.extractedInformation[key] = {
      value,
      extractedAt: new Date().toISOString(),
      confidence: 0.8
    };
  }

  /**
   * Get all extracted information in summary form
   */
  getSummary() {
    return {
      turnCount: this.conversationHistory.length,
      userProfile: this.userProfile,
      extractedInfo: this.extractedInformation,
      contradictions: this.contradictions.length,
      clarificationsNeeded: this.clarificationNeeded.length
    };
  }

  /**
   * Clear contradictions after clarification
   */
  clearContradictions() {
    this.contradictions = [];
    this.clarificationNeeded = [];
  }

  /**
   * Save conversation to disk
   */
  async save() {
    try {
      const dir = path.dirname(this.storageFile);
      await fs.mkdir(dir, { recursive: true });
      const data = {
        history: this.conversationHistory,
        userProfile: this.userProfile,
        extractedInfo: this.extractedInformation,
        contradictions: this.contradictions,
        clarificationNeeded: this.clarificationNeeded,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving conversation memory:', error);
    }
  }

  /**
   * Reset conversation (but keep profile)
   */
  resetConversation() {
    this.conversationHistory = [];
    this.contradictions = [];
    this.clarificationNeeded = [];
  }

  /**
   * Get all messages as formatted context string
   */
  getFormattedContext() {
    let context = 'पिछली बातचीत:\n';
    this.conversationHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'यूजर' : 'सहायक';
      context += `\n${role}: ${msg.content}\n`;
    });
    return context;
  }
}

export default ConversationMemory;
