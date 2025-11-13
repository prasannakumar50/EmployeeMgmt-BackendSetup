

const express = require("express");
const router = express.Router();

// Un Auth


// Auth 
router.use('/0.1', require('./auth/teamDetails'));



// If route not exist throw error
router.use((req, res, next) => {
  res.status(404).json({ message: 'You are not authorized to access this api' });
});

module.exports = router;