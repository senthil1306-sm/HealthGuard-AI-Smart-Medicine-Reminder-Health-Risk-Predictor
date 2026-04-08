const mongoose = require('mongoose');

const symptomReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: { type: String, required: true },
    predictedRisk: { type: String, required: true },
    notes: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SymptomReport', symptomReportSchema);
