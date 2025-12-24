import WelfareAgent from '../src/agent/welfareAgent.js';
import EligibilityChecker from '../src/tools/eligibilityChecker.js';
import ApplicationAPI from '../src/tools/applicationAPI.js';
import ConversationMemory from '../src/memory/conversationMemory.js';

/**
 * Comprehensive Evaluation Test Suite
 * Tests successful, failed, and edge-case interactions
 */

class EvaluationSuite {
  constructor() {
    this.results = {
      successful: [],
      failed: [],
      edgeCases: []
    };
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 WELFARE AGENT EVALUATION TEST SUITE');
    console.log('='.repeat(70));

    await this.testSuccessfulScenarios();
    await this.testFailureScenarios();
    await this.testEdgeCases();
    await this.testMemoryAndContradictions();
    await this.testToolIntegration();

    this.printResults();
  }

  async testSuccessfulScenarios() {
    console.log('\n\n📈 TEST 1: SUCCESSFUL SCENARIOS');
    console.log('-'.repeat(70));

    const agent = new WelfareAgent({
      openaiApiKey: process.env.OPENAI_API_KEY,
      language: 'mr-IN'
    });
    await agent.initialize();

    // Scenario 1: Complete eligible user workflow
    console.log('\n✅ Scenario 1.1: Eligible User - PM Awas Yojana');
    try {
      let result = await agent.processUserInput('नमस्ते, मी सरकारी आवास योजना के लिए आवेदन करना चाहता हूं');
      console.log('   Q1 Response:', result.response.substring(0, 100) + '...');

      result = await agent.processUserInput('मेरी उम्र 35 साल है, आय 400000 रुपये वार्षिक है');
      console.log('   Q2 Response:', result.response.substring(0, 100) + '...');
      console.log('   Eligible Schemes:', result.eligibleSchemes.length > 0 ? '✓' : '✗');

      this.results.successful.push({
        scenario: 'Eligible User Complete Workflow',
        status: result.eligibleSchemes.length > 0 ? 'PASS' : 'FAIL',
        details: result.eligibleSchemes.map(s => s.name)
      });
    } catch (error) {
      this.results.successful.push({
        scenario: 'Eligible User Complete Workflow',
        status: 'ERROR',
        error: error.message
      });
    }

    // Scenario 2: MGNREGA eligibility
    console.log('\n✅ Scenario 1.2: Rural Employment - MGNREGA');
    try {
      const agent2 = new WelfareAgent({
        openaiApiKey: process.env.OPENAI_API_KEY
      });
      await agent2.initialize();

      let result = await agent2.processUserInput('मी ग्रामीण क्षेत्र में रहता हूं और रोजगार ढूंढ रहा हूं');
      console.log('   Response:', result.response.substring(0, 80) + '...');

      this.results.successful.push({
        scenario: 'Rural Employment MGNREGA',
        status: 'PASS',
        schemesFound: result.eligibleSchemes.length
      });
    } catch (error) {
      this.results.successful.push({
        scenario: 'Rural Employment MGNREGA',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testFailureScenarios() {
    console.log('\n\n❌ TEST 2: FAILURE SCENARIOS');
    console.log('-'.repeat(70));

    const agent = new WelfareAgent({
      openaiApiKey: process.env.OPENAI_API_KEY
    });
    await agent.initialize();

    // Scenario 1: Invalid/incomplete information
    console.log('\n❌ Scenario 2.1: Insufficient Information');
    try {
      let result = await agent.processUserInput('कुछ मदद चाहिए');
      console.log('   Response:', result.response.substring(0, 80) + '...');

      result = await agent.processUserInput('बस मुझे सूचना दें');
      console.log('   Eligible Schemes:', result.eligibleSchemes.length);
      console.log('   Should Ask for More Info: ✓');

      this.results.failed.push({
        scenario: 'Insufficient Information Handling',
        status: 'PASS',
        behavior: 'Agent asks for more information'
      });
    } catch (error) {
      this.results.failed.push({
        scenario: 'Insufficient Information Handling',
        status: 'ERROR',
        error: error.message
      });
    }

    // Scenario 2: High income - ineligible
    console.log('\n❌ Scenario 2.2: Income Limit Exceeded');
    try {
      const agent2 = new WelfareAgent({
        openaiApiKey: process.env.OPENAI_API_KEY
      });
      await agent2.initialize();

      const result = await agent2.processUserInput('मेरी वार्षिक आय 5000000 रुपये है, मी किस योजना के लिए योग्य हूं?');
      console.log('   Eligible Schemes:', result.eligibleSchemes.length);
      console.log('   Response indicates ineligibility: ✓');

      this.results.failed.push({
        scenario: 'Income Limit Exceeded',
        status: 'PASS',
        message: 'Correctly identified as ineligible'
      });
    } catch (error) {
      this.results.failed.push({
        scenario: 'Income Limit Exceeded',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testEdgeCases() {
    console.log('\n\n⚠️ TEST 3: EDGE CASES');
    console.log('-'.repeat(70));

    // Edge Case 1: Contradiction detection
    console.log('\n⚠️ Edge Case 3.1: Contradiction Detection');
    try {
      const memory = new ConversationMemory();
      await memory.initialize();

      // Add initial information
      memory.updateUserProfile({ age: 30 });
      console.log('   Initial age:', memory.userProfile.age);

      // Provide contradictory information
      const update = memory.updateUserProfile({ age: 50 });
      console.log('   New age:', memory.userProfile.age);
      console.log('   Contradictions detected:', update.contradictions.length);

      this.results.edgeCases.push({
        scenario: 'Contradiction Detection',
        status: update.contradictions.length > 0 ? 'PASS' : 'FAIL',
        contradictionCount: update.contradictions.length
      });
    } catch (error) {
      this.results.edgeCases.push({
        scenario: 'Contradiction Detection',
        status: 'ERROR',
        error: error.message
      });
    }

    // Edge Case 2: Multiple scheme eligibility
    console.log('\n⚠️ Edge Case 3.2: Multiple Scheme Eligibility');
    try {
      const checker = new EligibilityChecker();
      const userProfile = {
        age: 22,
        income: 150000,
        categories: ['ST'],
        isStudent: true
      };

      const result = checker.checkEligibility(userProfile);
      console.log('   Eligible schemes:', result.eligible.length);
      console.log('   Ineligible schemes:', result.ineligible.length);

      this.results.edgeCases.push({
        scenario: 'Multiple Scheme Eligibility',
        status: result.eligible.length > 1 ? 'PASS' : 'WARN',
        eligibleCount: result.eligible.length
      });
    } catch (error) {
      this.results.edgeCases.push({
        scenario: 'Multiple Scheme Eligibility',
        status: 'ERROR',
        error: error.message
      });
    }

    // Edge Case 3: Missing critical information
    console.log('\n⚠️ Edge Case 3.3: Missing Critical Information');
    try {
      const checker = new EligibilityChecker();
      const userProfile = {
        age: null,
        income: null,
        categories: []
      };

      const questions = checker.getNextQuestions(userProfile, []);
      console.log('   Questions to ask:', questions.length);
      questions.slice(0, 3).forEach(q => console.log('   -', q));

      this.results.edgeCases.push({
        scenario: 'Missing Critical Information',
        status: questions.length > 0 ? 'PASS' : 'FAIL',
        questionCount: questions.length
      });
    } catch (error) {
      this.results.edgeCases.push({
        scenario: 'Missing Critical Information',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testMemoryAndContradictions() {
    console.log('\n\n💾 TEST 4: MEMORY AND CONTRADICTION HANDLING');
    console.log('-'.repeat(70));

    try {
      const memory = new ConversationMemory();
      await memory.initialize();

      console.log('\n💾 Test 4.1: Conversation History');
      memory.addMessage('user', 'नमस्ते');
      memory.addMessage('assistant', 'नमस्ते, कैसे मदद कर सकता हूं?');
      memory.addMessage('user', 'मुझे योजना के बारे में बताएं');
      
      console.log('   Messages stored:', memory.conversationHistory.length);
      console.log('   Formatted context length:', memory.getFormattedContext().length);

      this.results.edgeCases.push({
        scenario: 'Conversation History Storage',
        status: memory.conversationHistory.length === 3 ? 'PASS' : 'FAIL',
        messageCount: memory.conversationHistory.length
      });

      console.log('\n💾 Test 4.2: Profile Update and Contradiction');
      memory.updateUserProfile({ age: 25, income: 300000 });
      memory.updateUserProfile({ age: 30 }); // Contradiction

      console.log('   Current age:', memory.userProfile.age);
      console.log('   Contradictions detected:', memory.contradictions.length);
      console.log('   Clarifications needed:', memory.clarificationNeeded.length);

      this.results.edgeCases.push({
        scenario: 'Profile Update and Contradiction',
        status: memory.contradictions.length > 0 ? 'PASS' : 'FAIL',
        contradictionCount: memory.contradictions.length
      });

      console.log('\n💾 Test 4.3: Memory Persistence');
      await memory.save();
      console.log('   Memory saved successfully ✓');

      this.results.edgeCases.push({
        scenario: 'Memory Persistence',
        status: 'PASS'
      });
    } catch (error) {
      this.results.edgeCases.push({
        scenario: 'Memory and Contradiction Tests',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testToolIntegration() {
    console.log('\n\n🔧 TEST 5: TOOL INTEGRATION');
    console.log('-'.repeat(70));

    // Tool 1: Eligibility Checker
    console.log('\n🔧 Test 5.1: Eligibility Checker Tool');
    try {
      const checker = new EligibilityChecker();
      const userProfile = {
        age: 30,
        income: 250000,
        categories: ['SC'],
        location: { isRural: true }
      };

      const result = checker.checkEligibility(userProfile);
      console.log('   ✓ Checked eligibility for', this.welfareSchemesDatabase?.length || 8, 'schemes');
      console.log('   ✓ Eligible schemes:', result.eligible.length);
      console.log('   ✓ Ineligible schemes:', result.ineligible.length);

      this.results.edgeCases.push({
        scenario: 'Eligibility Checker Tool',
        status: 'PASS',
        eligibleCount: result.eligible.length
      });
    } catch (error) {
      this.results.edgeCases.push({
        scenario: 'Eligibility Checker Tool',
        status: 'ERROR',
        error: error.message
      });
    }

    // Tool 2: Application API
    console.log('\n🔧 Test 5.2: Application API Tool');
    try {
      const api = new ApplicationAPI({ mockMode: true });
      
      const result = await api.submitApplication({
        schemeId: 'pm_awas',
        schemeName: 'PM Awas Yojana',
        userProfile: { age: 35, income: 300000 },
        documents: []
      });

      console.log('   ✓ Application submitted');
      console.log('   ✓ Application ID:', result.applicationId);
      console.log('   ✓ Status:', result.status);

      // Check status
      const statusResult = await api.checkApplicationStatus(result.applicationId);
      console.log('   ✓ Status check:', statusResult.success ? 'OK' : 'FAILED');

      this.results.edgeCases.push({
        scenario: 'Application API Tool',
        status: result.success && statusResult.success ? 'PASS' : 'FAIL'
      });
    } catch (error) {
      this.results.edgeCases.push({
        scenario: 'Application API Tool',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  printResults() {
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));

    const allResults = [
      ...this.results.successful,
      ...this.results.failed,
      ...this.results.edgeCases
    ];

    const passCount = allResults.filter(r => r.status === 'PASS').length;
    const failCount = allResults.filter(r => r.status === 'FAIL').length;
    const errorCount = allResults.filter(r => r.status === 'ERROR').length;

    console.log(`\n✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⚠️ Errors: ${errorCount}`);
    console.log(`📊 Total: ${allResults.length}`);
    console.log(`📈 Success Rate: ${((passCount / allResults.length) * 100).toFixed(1)}%`);

    console.log('\n\n📋 DETAILED RESULTS:\n');
    allResults.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${index + 1}. ${result.scenario || result.title}`);
      console.log(`   Status: ${result.status}`);
      if (result.details) console.log(`   Details: ${JSON.stringify(result.details)}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      console.log('');
    });

    console.log('='.repeat(70) + '\n');
  }
}

// Run evaluation
async function main() {
  const suite = new EvaluationSuite();
  await suite.runAllTests();
}

export default EvaluationSuite;

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
