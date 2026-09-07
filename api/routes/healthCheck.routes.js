const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is running', endpoints: ['/health-check', '/users', '/users/:id'] });
});

module.exports = router;