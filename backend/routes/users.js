import express from 'express';
import { getUserProfile, updateUserProfile, getUserApplications } from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateUserProfile);

/**
 * @route   GET /api/users/applications
 * @desc    Get user applications
 * @access  Private
 */
router.get('/applications', getUserApplications);

export default router;
