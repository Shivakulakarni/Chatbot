import Application from '../models/Application.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * @desc    Create application
 * @route   POST /api/applications
 * @access  Private
 */
export const createApplication = asyncHandler(async (req, res) => {
  const { schemeId, schemeName, applicantInfo } = req.body;
  const userId = req.user.id;

  const application = await Application.create({
    userId,
    schemeId,
    schemeName,
    applicantInfo,
    status: 'draft'
  });

  // Add to user's applications
  await User.findByIdAndUpdate(userId, {
    $push: { applications: application._id }
  });

  res.status(201).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Get all applications
 * @route   GET /api/applications
 * @access  Private
 */
export const getApplications = asyncHandler(async (req, res) => {
  const { status, schemeId } = req.query;
  const userId = req.user.id;

  const query = { userId };
  if (status) query.status = status;
  if (schemeId) query.schemeId = schemeId;

  const applications = await Application.find(query).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

/**
 * @desc    Get single application
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }

  // Make sure user owns the application
  if (application.userId.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this application'
    });
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Update application
 * @route   PUT /api/applications/:id
 * @access  Private
 */
export const updateApplication = asyncHandler(async (req, res) => {
  let application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }

  // Make sure user owns the application
  if (application.userId.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to update this application'
    });
  }

  application = await Application.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Upload document
 * @route   POST /api/applications/:id/documents
 * @access  Private
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }

  // Make sure user owns the application
  if (application.userId.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to update this application'
    });
  }

  const { type, name, url } = req.body;

  application.documents.push({
    type,
    name,
    url,
    uploadedAt: new Date()
  });

  await application.save();

  res.status(200).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Check application status
 * @route   GET /api/applications/:id/status
 * @access  Private
 */
export const checkStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }

  // Make sure user owns the application
  if (application.userId.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this application'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      applicationId: application.applicationId,
      status: application.status,
      timeline: application.timeline,
      lastUpdate: application.updatedAt
    }
  });
});
