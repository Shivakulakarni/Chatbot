import express from 'express';
import { 
  processUserInput, 
  getConversationHistory, 
  checkEligibility,
  clearConversation 
} from '../controllers/agentController.js';
import { validateInput } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/agent/process
 * @desc    Process user input through the agent
 * @access  Private
 */
router.post('/process', validateInput, processUserInput);

/**
 * @route   GET /api/agent/conversation/:sessionId
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/conversation/:sessionId', getConversationHistory);

/**
 * @route   POST /api/agent/eligibility
 * @desc    Check scheme eligibility
 * @access  Private
 */
router.post('/eligibility', checkEligibility);

/**
 * @route   DELETE /api/agent/conversation/:sessionId
 * @desc    Clear conversation history
 * @access  Private
 */
router.delete('/conversation/:sessionId', clearConversation);

export default router;
