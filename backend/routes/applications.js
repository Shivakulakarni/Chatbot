import express from 'express';
import { 
  createApplication, 
  getApplications,
  getApplication,
  updateApplication,
  uploadDocument,
  checkStatus
} from '../controllers/applicationController.js';

const router = express.Router();

/**
 * @route   POST /api/applications
 * @desc    Create new application
 * @access  Private
 */
router.post('/', createApplication);

/**
 * @route   GET /api/applications
 * @desc    Get all user applications
 * @access  Private
 */
router.get('/', getApplications);

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application
 * @access  Private
 */
router.get('/:id', getApplication);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application
 * @access  Private
 */
router.put('/:id', updateApplication);

/**
 * @route   POST /api/applications/:id/documents
 * @desc    Upload document
 * @access  Private
 */
router.post('/:id/documents', uploadDocument);

/**
 * @route   GET /api/applications/:id/status
 * @desc    Check application status
 * @access  Private
 */
router.get('/:id/status', checkStatus);

export default router;
