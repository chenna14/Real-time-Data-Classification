const Rule = require('../models/Rule');

// Create a new rule
exports.createRule = async (req, res) => {
  const { type, parameter, value } = req.body;

  try {
    // Check if the user already has a rule with the same parameter and type
    const existingRule = await Rule.findOne({ user: req.user.id, parameter, type });

    if (existingRule) {
      return res.status(400).json({ message: 'Rule with this parameter and type already exists. Please update the existing rule.' });
    }

    // Ensure max rules constraint
    // const existingRules = await Rule.find({ user: req.user.id });
    // if (existingRules.length >= 10) {
    //   return res.status(400).json({ message: 'Maximum number of rules reached' });
    // }

    const rule = new Rule({
      type,
      parameter,
      value,
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
exports.updateRuleByParameter = async (req, res) => {
  const { parameter } = req.params;
  const { type, value } = req.body;

  try {
    const rule = await Rule.findOne({ user: req.user.id, parameter, type });

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    rule.value = value;

    await rule.save();
    res.json({ message: 'Rule updated successfully', rule });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a rule by parameter
exports.deleteRuleByParameter = async (req, res) => {
  const { parameter } = req.params;
  const { type } = req.body;

  try {
    const rule = await Rule.findOne({ user: req.user.id, parameter, type });

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

// Check if a sentence satisfies all user-defined rules
// Check if a sentence satisfies all user-defined rules
exports.checkSentence = async (req, res) => {
    const { sentence } = req.body;
  
    try {
      // Convert sentence to capital case (all uppercase)
      const formattedSentence = sentence.toUpperCase();
  
      // Fetch all rules for the authenticated user
      const rules = await Rule.find({ user: req.user.id });
  
      // Array to store details of failing rules
      const failedRules = [];
  
      // Check each rule against the formatted sentence
      const ruleChecks = rules.map(rule => {
        const isRuleSatisfied = checkRule(rule, formattedSentence);
        if (!isRuleSatisfied) {
          failedRules.push({ type: rule.type, parameter: rule.parameter, value: rule.value });
        }
        return isRuleSatisfied;
      });
  
      // Determine if all rules are satisfied
      const allRulesSatisfied = ruleChecks.every(check => check);
  
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

// Helper function to check if a rule is satisfied by a sentence
function checkRule(rule, sentence) {
  // Implement your logic to check if the sentence satisfies the rule
  // Example logic (modify as per your DSL):
  if (rule.type === 'min') {
    const regex = new RegExp(`${rule.parameter}`, 'gi');
    const matches = sentence.match(regex) || [];
    return matches.length >= rule.value;
  } else if (rule.type === 'max') {
    const regex = new RegExp(`${rule.parameter}`, 'gi');
    const matches = sentence.match(regex) || [];
    return matches.length <= rule.value;
  }
  return true; // Default to true if rule type is not recognized
}

