#!/usr/bin/env node

/**
 * Demo Script - Quick demonstration of the Welfare Agent
 * Run: npm run demo
 */

import WelfareAgentApplication from './index.js';

async function runDemo() {
  console.clear();
  console.log('🎙️  VOICE-FIRST WELFARE SCHEME AGENT - DEMO');
  console.log('━'.repeat(70));
  console.log('');
  console.log('Language: Marathi (मराठी)');
  console.log('System: Agentic AI with Planner-Executor-Evaluator Loop');
  console.log('Demo Duration: ~2 minutes');
  console.log('');
  console.log('━'.repeat(70));

  const app = new WelfareAgentApplication();
  
  try {
    await app.initialize();
    
    // Run demo
    await app.demoSession();
    
  } catch (error) {
    console.error('❌ Demo error:', error);
    process.exit(1);
  }
}

// Run demo
runDemo().catch(console.error);
