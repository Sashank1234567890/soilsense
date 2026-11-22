const mongoose = require('mongoose');

const irrigationEventSchema = new mongoose.Schema({
  plotId: { type: String, required: true, uppercase: true, trim: true, index: true },
  deviceId: { type: String, uppercase: true, trim: true },
  eventType: { type: String, enum: ['scheduled', 'automated', 'manual', 'rainfall'], default: 'manual' },
  volumeLiters: { type: Number, default: 0 },
  moistureBefore: { type: Number, required: true }, // %
  moistureAfter: { type: Number, required: true },  // %
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) },
  notes: { type: String }
}, {
  timestamps: true
});

irrigationEventSchema.index({ plotId: 1, startedAt: -1 });

module.exports = mongoose.models.IrrigationEvent || mongoose.model('IrrigationEvent', irrigationEventSchema, 'irrigation_events');
