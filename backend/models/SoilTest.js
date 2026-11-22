const mongoose = require('mongoose');

const soilTestSchema = new mongoose.Schema({
  testId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plotId: { type: String, uppercase: true, trim: true, default: 'PLOT_001' },
  deviceId: { type: String, uppercase: true, trim: true },
  selectedCropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  selectedCropName: { type: String, trim: true },
  testKind: {
    type: String,
    enum: ['general', 'crop_specific', 'manual_lab', 'simulation', 'hardware'],
    required: true,
    default: 'general'
  },
  values: {
    moisture: { type: Number }, // in %
    temperature: { type: Number }, // in °C
    pH: { type: Number },
    nitrogen: { type: Number }, // kg/ha
    phosphorus: { type: Number },
    potassium: { type: Number },
    texture: { type: String, trim: true },
    organicMatter: { type: Number },
    electricalConductivity: { type: Number }
  },
  parameterSources: {
    moisture: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' },
    temperature: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' },
    pH: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' },
    nitrogen: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' },
    phosphorus: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' },
    potassium: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' },
    texture: { type: String, enum: ['hardware', 'simulation', 'manual_lab', 'user_provided', 'reference', 'missing'], default: 'missing' }
  },
  overallSource: {
    type: String,
    enum: ['hardware', 'simulation', 'manual_lab', 'composite'],
    required: true,
    default: 'simulation'
  },
  location: {
    state: { type: String, default: 'Delhi' },
    district: { type: String, default: 'North Delhi' },
    village: { type: String, default: 'Bakoli' },
    plotName: { type: String, default: 'Main Field Block A' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  dataCompleteness: {
    score: { type: Number, default: 0 }, // 0 to 100%
    isComplete: { type: Boolean, default: false },
    availableCount: { type: Number, default: 0 },
    totalExpected: { type: Number, default: 7 },
    missingFields: [{ type: String }]
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'completed', 'insufficient_data'],
    default: 'completed'
  },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

soilTestSchema.index({ userId: 1, timestamp: -1 });
soilTestSchema.index({ plotId: 1, timestamp: -1 });
soilTestSchema.index({ selectedCropId: 1 });
soilTestSchema.index({ overallSource: 1 });
soilTestSchema.index({ 'values.moisture': 1, 'values.pH': 1 });

module.exports = mongoose.models.SoilTest || mongoose.model('SoilTest', soilTestSchema, 'soil_tests');
