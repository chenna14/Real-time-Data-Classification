const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const {
  createRule,
  getRules,
  updateRuleByParameter,
  deleteRuleByParameter
} = require('../controllers/classificationController');

// Routes for managing classification rules
router.post('/', authMiddleware, createRule);
router.get('/rules', authMiddleware, getRules);
router.put('/:parameter/:type', authMiddleware, updateRuleByParameter);
router.delete('/:parameter/:type', authMiddleware, deleteRuleByParameter);

module.exports = router;
