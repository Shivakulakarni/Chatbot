import { OpenAI } from 'openai';
import ConversationMemory from '../memory/conversationMemory.js';
import EligibilityChecker from '../tools/eligibilityChecker.js';
import ApplicationAPI from '../tools/applicationAPI.js';
import { systemPrompts, getContextualPrompt } from '../prompts/systemPrompts.js';

/**
 * Core Welfare Agent with Planner-Executor-Evaluator Loop
 */
export class WelfareAgent {
  constructor(config = {}) {
    this.config = config;
    this.memory = new ConversationMemory(config.memoryStoragePath);
    this.eligibilityChecker = new EligibilityChecker();
    this.applicationAPI = new ApplicationAPI({ mockMode: true });
    
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
    });

    this.model = config.model || 'gpt-4-turbo-preview';
    this.language = config.language || 'mr-IN';
    this.maxTurns = config.maxTurns || 20;
    this.currentTurn = 0;
    this.state = 'waiting'; // waiting, planning, executing, evaluating, complete
  }

  async initialize() {
    await this.memory.initialize();
  }

  /**
   * Main agent loop
   */
  async processUserInput(userText) {
    this.currentTurn++;
    console.log(`\n=== Turn ${this.currentTurn} ===`);

    // Add user message to memory
    this.memory.addMessage('user', userText, {
      language: this.language,
      turnNumber: this.currentTurn
    });

    try {
      // Step 1: Planning
      const plan = await this.plannerPhase(userText);
      console.log('Plan:', JSON.stringify(plan, null, 2));

      // Step 2: Execution
      const executionResult = await this.executorPhase(userText, plan);
      console.log('Execution Result:', JSON.stringify(executionResult, null, 2));

      // Step 3: Evaluation
      const evaluation = await this.evaluatorPhase(executionResult, plan);
      console.log('Evaluation:', JSON.stringify(evaluation, null, 2));

      // Store assistant response in memory
      this.memory.addMessage('assistant', executionResult.response, {
        language: this.language,
        turnNumber: this.currentTurn,
        toolsUsed: executionResult.toolsUsed
      });

      await this.memory.save();

      return {
        response: executionResult.response,
        plan,
        toolsUsed: executionResult.toolsUsed,
        eligibleSchemes: executionResult.eligibleSchemes,
        shouldContinue: evaluation.continueConversation && this.currentTurn < this.maxTurns
      };
    } catch (error) {
      console.error('Error in agent loop:', error);
      return {
        response: `खेद है, एक त्रुटि हुई: ${error.message}`,
        error: error,
        shouldContinue: true
      };
    }
  }

  /**
   * Planner Phase: Analyze input and create a plan
   */
  async plannerPhase(userInput) {
    const context = this.memory.getContext();
    const conversationHistory = this.memory.getFormattedContext();

    const prompt = `
${systemPrompts.mainSystemPrompt}

${systemPrompts.plannerPrompt}

पिछली बातचीत:
${conversationHistory}

उपयोगकर्ता प्रोफाइल:
${JSON.stringify(context.userProfile, null, 2)}

निकाली गई जानकारी:
${JSON.stringify(context.extractedInfo, null, 2)}

वर्तमान उपयोगकर्ता इनपुट: "${userInput}"

यह एक JSON योजना का उत्पादन करें:
`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing plan:', e);
    }

    return {
      goal: 'उपयोगकर्ता की मदद करें',
      currentStep: 'जानकारी एकत्र करना',
      nextSteps: ['अधिक जानकारी प्राप्त करें', 'योग्यता जांचें'],
      infoNeeded: ['उम्र', 'आय'],
      risks: []
    };
  }

  /**
   * Executor Phase: Execute the plan
   */
  async executorPhase(userInput, plan) {
    const context = this.memory.getContext();
    const toolsUsed = [];
    let eligibleSchemes = [];

    // Extract information from user input
    const extracted = await this.extractInformation(userInput);
    if (Object.keys(extracted).length > 0) {
      const profileUpdate = this.memory.updateUserProfile(extracted);
      if (profileUpdate.contradictions.length > 0) {
        console.log('Contradictions detected:', profileUpdate.contradictions);
      }
    }

    // Check if we should run eligibility checker
    const userProfile = this.memory.userProfile;
    if (userProfile.age && userProfile.income && userProfile.categories.length > 0) {
      const eligibilityResult = this.eligibilityChecker.checkEligibility(userProfile);
      eligibleSchemes = eligibilityResult.eligible;
      toolsUsed.push('eligibility_checker');
      console.log(`Found ${eligibleSchemes.length} eligible schemes`);
    }

    // Get next questions if we need more info
    let nextQuestions = [];
    if (eligibleSchemes.length === 0) {
      nextQuestions = this.eligibilityChecker.getNextQuestions(userProfile, []);
    }

    // Generate response
    const response = await this.generateResponse(userInput, context, extracted, eligibleSchemes, nextQuestions);

    return {
      response,
      eligibleSchemes,
      extractedInfo: extracted,
      toolsUsed,
      planExecuted: true
    };
  }

  /**
   * Evaluator Phase: Evaluate the execution
   */
  async evaluatorPhase(executionResult, plan) {
    const prompt = `
${systemPrompts.evaluatorPrompt}

योजना की गई:
${JSON.stringify(plan, null, 2)}

निष्पादन परिणाम:
${JSON.stringify(executionResult, null, 2)}

मूल्यांकन JSON में दें (केवल JSON, कोई अन्य पाठ नहीं)
`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 300
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing evaluation:', e);
    }

    return {
      achieved: false,
      quality: 'संतोषजनक',
      issues: [],
      nextAction: 'अगली जानकारी एकत्र करें',
      continueConversation: true
    };
  }

  /**
   * Extract information from user input using LLM
   */
  async extractInformation(userInput) {
    const prompt = `
आप एक सूचना निकालने वाले हैं। मराठी पाठ से निम्नलिखित जानकारी निकालें:

पाठ: "${userInput}"

निकालें:
- उम्र (age): संख्या या null
- आय (income): संख्या या null
- जाति/श्रेणी (categories): ['SC', 'ST', 'OBC', 'General'] में से या []
- स्थान (location): {isRural: true/false} या null
- पेशा (occupation): स्ट्रिंग या null
- क्या यह विद्यार्थी है (isStudent): true/false

केवल JSON में प्रतिक्रिया दें, कोई अन्य पाठ नहीं:
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        // Filter out null values
        return Object.fromEntries(
          Object.entries(extracted).filter(([_, v]) => v !== null && v !== '')
        );
      }
    } catch (e) {
      console.error('Error extracting information:', e);
    }

    return {};
  }

  /**
   * Generate natural response
   */
  async generateResponse(userInput, context, extractedInfo, eligibleSchemes, nextQuestions) {
    let responsePrompt = `${systemPrompts.mainSystemPrompt}

उपयोगकर्ता प्रोफाइल:
${JSON.stringify(this.memory.userProfile, null, 2)}

निकाली गई नई जानकारी:
${JSON.stringify(extractedInfo, null, 2)}

योग्य योजनाएं:
${eligibleSchemes.length > 0 ? JSON.stringify(eligibleSchemes.slice(0, 3), null, 2) : 'कोई नहीं'}

अगले प्रश्न:
${nextQuestions.join('\n')}

उपयोगकर्ता ने कहा: "${userInput}"

नियम:
1. मराठी में जवाब दें
2. उपयोगकर्ता को उनकी जानकारी की पुष्टि करें
3. यदि योग्य योजनाएं हैं, तो उन्हें समझाएं
4. अगले प्रश्न पूछें
5. सरल, स्पष्ट भाषा का उपयोग करें

संक्षिप्त, मदद करने वाली प्रतिक्रिया दें:
`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: responsePrompt }],
      temperature: 0.7,
      max_tokens: 400
    });

    return response.choices[0].message.content;
  }

  /**
   * Handle scheme application
   */
  async applyForScheme(schemeId) {
    const userProfile = this.memory.userProfile;
    const scheme = this.eligibilityChecker.getSchemeDetails(schemeId);

    if (!scheme) {
      return {
        success: false,
        message: 'योजना नहीं मिली'
      };
    }

    // Submit application
    const result = await this.applicationAPI.submitApplication({
      schemeId,
      schemeName: scheme.name,
      userProfile,
      documents: []
    });

    // Store application in memory
    if (result.success) {
      this.memory.storeExtractedInfo(`application_${schemeId}`, {
        applicationId: result.applicationId,
        status: result.status,
        submissionTime: new Date().toISOString()
      });
    }

    return result;
  }

  /**
   * Get conversation summary
   */
  getSummary() {
    return this.memory.getSummary();
  }
}

export default WelfareAgent;
