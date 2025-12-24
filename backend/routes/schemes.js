import express from 'express';
import { welfareSchemesDatabase } from '../../src/data/schemes.js';

const router = express.Router();

/**
 * @route   GET /api/schemes
 * @desc    Get all schemes
 * @access  Public
 */
router.get('/', (req, res) => {
  const { category, state } = req.query;
  
  let filteredSchemes = welfareSchemesDatabase;
  
  if (category) {
    filteredSchemes = filteredSchemes.filter(s => 
      s.category === category
    );
  }
  
  if (state) {
    filteredSchemes = filteredSchemes.filter(s => 
      !s.eligibility.state || s.eligibility.state.includes(state)
    );
  }

  res.status(200).json({
    success: true,
    count: filteredSchemes.length,
    data: filteredSchemes
  });
});

/**
 * @route   GET /api/schemes/:id
 * @desc    Get single scheme
 * @access  Public
 */
router.get('/:id', (req, res) => {
  const scheme = welfareSchemesDatabase.find(s => s.id === req.params.id);
  
  if (!scheme) {
    return res.status(404).json({
      success: false,
      error: 'Scheme not found'
    });
  }

  res.status(200).json({
    success: true,
    data: scheme
  });
});

export default router;
