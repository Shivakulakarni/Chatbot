import dotenv from 'dotenv';
import WelfareAgent from './agent/welfareAgent.js';
import VoicePipeline from './voice/voicePipeline.js';
import MultiLanguageVoice from './voice/multiLanguageVoice.js';
import config from '../config/config.js';

dotenv.config();

/**
 * Main Application Entry Point
 */
export class WelfareAgentApplication {
  constructor() {
    this.agent = new WelfareAgent({
      openaiApiKey: process.env.OPENAI_API_KEY,
      language: 'mr-IN',
      model: 'gpt-4-turbo-preview',
      maxTurns: 20
    });

    this.voicePipeline = new VoicePipeline({
      language: 'mr-IN',
      provider: 'mock'
    });

    this.multiLanguageVoice = new MultiLanguageVoice();
  }

  async initialize() {
    console.log('🚀 Initializing Welfare Agent Application...');
    await this.agent.initialize();
    console.log('✅ Agent initialized');
    console.log('🗣️ Language: Marathi (मराठी)');
    console.log('🤖 Model: GPT-4 Turbo');
    console.log('');
  }

  async processVoiceInput(userText) {
    console.log('\n📝 Processing:', userText);
    
    const result = await this.agent.processUserInput(userText);
    
    console.log('\n🎤 Agent Response:');
    console.log(result.response);

    if (result.eligibleSchemes && result.eligibleSchemes.length > 0) {
      console.log('\n📋 Eligible Schemes:');
      result.eligibleSchemes.slice(0, 3).forEach((scheme, index) => {
        console.log(`  ${index + 1}. ${scheme.name} (${scheme.scheme})`);
        console.log(`     मिलान स्कोर: ${scheme.matchScore.toFixed(1)}%`);
      });
    }

    return result;
  }

  async interactiveSession() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Welcome to Voice-First Welfare Scheme Agent');
    console.log('='.repeat(60));
    console.log('\nयही एक मराठी भाषा आधारित सहायक है जो आपको');
    console.log('सरकारी कल्याणकारी योजनाओं के लिए आवेदन करने में मदद करेगा।\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (prompt) => {
      return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
          resolve(answer);
        });
      });
    };

    let continueSession = true;
    let turnCount = 0;

    while (continueSession && turnCount < 20) {
      const userInput = await askQuestion('\n👤 आप: ');

      if (userInput.toLowerCase() === 'बाहर निकलें' || userInput.toLowerCase() === 'quit' || userInput.toLowerCase() === 'exit') {
        console.log('\n👋 धन्यवाद! आपकी मदद करने के लिए खुशी हुई।');
        break;
      }

      const result = await this.processVoiceInput(userInput);
      
      turnCount++;
      continueSession = result.shouldContinue;

      console.log('\n' + '-'.repeat(60));
    }

    rl.close();
    console.log('\n📊 Session Summary:');
    console.log(JSON.stringify(this.agent.getSummary(), null, 2));
  }

  async demoSession() {
    console.log('\n' + '='.repeat(60));
    console.log('🎬 Demo: Voice-First Welfare Scheme Agent');
    console.log('='.repeat(60));

    const demoQuestions = [
      'नमस्ते, मी सरकारी योजना के लिए आवेदन करना चाहता हूं',
      'मेरी उम्र 35 साल है और मी शहरी इलाके में रहता हूं',
      'मेरी वार्षिक आय 300000 रुपये है। मी सामान्य श्रेणी से हूं',
      'मुझे PM आवास योजना के बारे में अधिक जानना चाहता हूं',
      'हां, मी इसके लिए आवेदन करना चाहता हूं'
    ];

    for (let i = 0; i < demoQuestions.length; i++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📞 Turn ${i + 1}`);
      console.log(`${'='.repeat(60)}`);

      const userInput = demoQuestions[i];
      console.log(`\n👤 User: ${userInput}`);

      const result = await this.processVoiceInput(userInput);

      if (!result.shouldContinue) {
        console.log('\n✅ Conversation completed');
        break;
      }

      // Small delay between turns for readability
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n\n📊 Demo Summary:');
    const summary = this.agent.getSummary();
    console.log(`Total Turns: ${summary.turnCount}`);
    console.log(`User Profile: ${JSON.stringify(summary.userProfile, null, 2)}`);
    console.log(`Extracted Info: ${JSON.stringify(summary.extractedInfo, null, 2)}`);
  }
}

// Main execution
async function main() {
  const app = new WelfareAgentApplication();
  await app.initialize();

  const args = process.argv.slice(2);
  
  if (args.includes('--demo')) {
    await app.demoSession();
  } else if (args.includes('--interactive')) {
    await app.interactiveSession();
  } else {
    // Default: run demo
    await app.demoSession();
  }
}

export default WelfareAgentApplication;

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
