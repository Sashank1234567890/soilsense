const mongoose = require('mongoose');

const IrrigationAdvisorySchema = new mongoose.Schema({
  plotId: { type: String, required: true, index: true },
  cropName: { type: String, default: 'Wheat' },
  cropStage: {
    type: String,
    enum: ['GERMINATION', 'VEGETATIVE', 'FLOWERING', 'GRAIN_FORMATION', 'MATURITY'],
    default: 'VEGETATIVE'
  },
  currentMoisture: { type: Number, required: true },
  targetMoisture: { type: Number, default: 55 },
  urgency: {
    type: String,
    enum: ['OPTIMAL', 'LOW', 'MODERATE', 'URGENT', 'CRITICAL', 'RAIN_SUPPRESSED'],
    default: 'OPTIMAL'
  },
  recommendedWaterDepthMm: { type: Number, default: 0 },
  recommendedWaterVolumeLiters: { type: Number, default: 0 },
  optimalWindow: {
    startTime: { type: String, default: '05:30 AM' },
    endTime: { type: String, default: '07:30 AM' }
  },
  rainSkipTriggered: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'APPLIED', 'SKIPPED'], default: 'PENDING' },
  generatedAt: { type: Date, default: Date.now, index: true }
});

IrrigationAdvisorySchema.index({ plotId: 1, generatedAt: -1 });

module.exports = mongoose.model('IrrigationAdvisory', IrrigationAdvisorySchema);
