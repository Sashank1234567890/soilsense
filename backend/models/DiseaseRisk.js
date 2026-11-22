const mongoose = require('mongoose');

const DiseaseRiskSchema = new mongoose.Schema({
  plotId: { type: String, required: true, index: true },
  cropName: { type: String, required: true },
  diseaseName: { type: String, required: true },
  pathogenType: { type: String, default: 'FUNGAL' },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'],
    default: 'LOW'
  },
  triggerConditions: {
    soilMoistureExceededThreshold: Boolean,
    consecutiveHoursWet: Number
  },
  preventativeActions: [String],
  flaggedAt: { type: Date, default: Date.now, index: true }
});

DiseaseRiskSchema.index({ plotId: 1, flaggedAt: -1 });

module.exports = mongoose.model('DiseaseRisk', DiseaseRiskSchema);
