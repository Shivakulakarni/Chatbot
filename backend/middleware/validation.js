/**
 * Input validation middleware
 */
export const validateInput = (req, res, next) => {
  const { userInput, sessionId } = req.body;

  const errors = [];

  if (!userInput || typeof userInput !== 'string') {
    errors.push('User input must be a non-empty string');
  }

  if (userInput && userInput.length > 5000) {
    errors.push('User input must not exceed 5000 characters');
  }

  if (!sessionId || typeof sessionId !== 'string') {
    errors.push('Session ID must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};
