const mongoose = require('mongoose');

const CropScheduleSchema = new mongoose.Schema({
  plotId: { type: String, required: true, default: 'PLOT_001', index: true },
  assignedDeviceId: { type: String, default: 'DEVICE_001' },
  cropName: { type: String, required: true, default: 'Wheat' },
  variety: { type: String, default: 'PBW 725' },
  sowingDate: { type: Date, required: true, default: Date.now },
  totalDurationDays: { type: Number, default: 135 },
  expectedHarvestDate: { type: Date },
  harvestedAt: { type: Date },
  actualYieldQuintals: { type: Number },
  harvestNotes: { type: String },
  acreage: { type: Number, default: 2.5 },
  location: {
    district: { type: String, default: 'Ludhiana' },
    state: { type: String, default: 'Punjab' },
    lat: { type: Number, default: 30.9010 },
    lon: { type: Number, default: 75.8573 },
    autoDetected: { type: Boolean, default: false }
  },
  moistureThresholds: {
    optimal: { type: Number, default: 55 },
    soonerNotice: { type: Number, default: 40 },
    criticalWilting: { type: Number, default: 24 }
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    criticalMoisture: { type: Boolean, default: true },
    criticalThreshold: { type: Number, default: 24 },
    soonerMoisture: { type: Boolean, default: true },
    soonerThreshold: { type: Number, default: 40 },
    rainDelay: { type: Boolean, default: true },
    hypoxiaWarning: { type: Boolean, default: true },
    stageTransition: { type: Boolean, default: true },
    voiceAlert: { type: Boolean, default: true },
    smsAlert: { type: Boolean, default: true },
    phoneNumber: { type: String, default: '+91 98765 43210' }
  },
  growthStages: [{
    stageName: String,
    startDay: Number,
    endDay: Number,
    description: String,
    waterNeed: String
  }],
  seasonalCalendar: {
    optimalSowingMonths: [{ type: Number }],
    optimalHarvestMonths: [{ type: Number }],
    sowingWindowHi: String,
    sowingWindowEn: String,
    harvestWindowHi: String,
    harvestWindowEn: String,
    seasonAdvisoryHi: String,
    seasonAdvisoryEn: String,
    isOptimalSeason: Boolean
  },
  status: { type: String, enum: ['ACTIVE', 'HARVESTED', 'PLANNED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('CropSchedule', CropScheduleSchema);
