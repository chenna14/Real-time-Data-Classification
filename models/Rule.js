const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['min', 'max'] },
  parameter: { type: String, required: true },
  value: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Rule', RuleSchema);
