const Rule = require('../models/Rule');
const { evaluate, min, max, sum } = require('mathjs');


// Create a new rule
exports.createRule = async (req, res) => {
    const { condition } = req.body;
  
    try {
      const existingRule = await Rule.findOne({ user: req.user.id, condition });
  
      if (existingRule) {
        return res.status(400).json({ message: 'Rule with this condition already exists. Please update the existing rule.' });
      }
  
      const rule = new Rule({
        condition,
        user: req.user.id
      });
  
      await rule.save();
      res.json({ message: 'Rule created successfully', rule });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  

// Update a rule by parameter
exports.updateRuleByCondition = async (req, res) => {
    const { condition } = req.params;
    const { newCondition } = req.body;
  
    try {
      const rule = await Rule.findOne({ user: req.user.id, condition });
  
      if (!rule) {
        return res.status(404).json({ message: 'Rule not found' });
      }
  
      rule.condition = newCondition;
  
      await rule.save();
      res.json({ message: 'Rule updated successfully', rule });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  

// Delete a rule by parameter
exports.deleteRuleByCondition = async (req, res) => {
    const { condition } = req.params;
  
    try {
      const rule = await Rule.findOne({ user: req.user.id, condition });
  
      if (!rule) {
        return res.status(404).json({ message: 'Rule not found' });
      }
  
      await rule.remove();
      res.json({ message: 'Rule deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  

// Get all rules for the user
exports.getRules = async (req, res) => {
    try {
      const rules = await Rule.find({ user: req.user.id });
      res.json(rules);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  

  exports.checkSentence = async (req, res) => {
    const { sentence } = req.body;
  
    if (!sentence || typeof sentence !== 'string') {
      return res.status(400).json({ error: 'Invalid input: sentence is required and must be a string' });
    }
  
    try {
      // Convert sentence to uppercase
      const formattedSentence = sentence.toUpperCase();
  
      // Fetch all rules for the authenticated user
      const rules = await Rule.find({ user: req.user.id });
  
      // Initialize letterCounts with A-Z set to 0
      const letterCounts = {};
      for (let i = 65; i <= 90; i++) { // ASCII codes for A-Z
        letterCounts[String.fromCharCode(i)] = 0;
      }
  
      // Count occurrences of each letter
      for (let char of formattedSentence) {
        if (/[A-Z]/.test(char)) {
          letterCounts[char] = (letterCounts[char] || 0) + 1;
        }
      }
  
      // Check each rule against the formatted sentence
      const failedRules = [];
      for (const rule of rules) {
        const isRuleSatisfied = evaluateCondition(rule.condition, letterCounts);
        if (!isRuleSatisfied) {
          failedRules.push({ condition: rule.condition });
        }
      }
  
      const allRulesSatisfied = failedRules.length === 0;
  
      if (allRulesSatisfied) {
        res.json({ sentence, allRulesSatisfied });
      } else {
        res.status(400).json({ sentence, allRulesSatisfied, failedRules });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Helper function to evaluate a condition
  function evaluateCondition(condition, letterCounts) {
    const vars = {};
  
    // Populate vars with letter counts
    for (const [key, value] of Object.entries(letterCounts)) {
      vars[key] = Number(value); // Ensure all values are numbers
    }
  
    // Attach math.js functions to the context
    const context = {
      ...vars,
      min,
      max,
      sum
    };
  
    try {
      return evaluate(condition, context);
    } catch (err) {
      console.error(`Error evaluating condition: ${condition}`, err);
      return false;
    }
  }


