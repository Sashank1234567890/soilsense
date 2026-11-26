const mongoose = require('mongoose');

const soilTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  classification: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  shortDescription: { type: String, required: true },
  characteristics: [{ type: String }],
  texture: [{ type: String }],
  typicalPH: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    median: { type: Number }
  },
  moistureCharacteristics: {
    waterHoldingCapacity: { type: String, default: 'Moderate' },
    drainageRate: { type: String, default: 'Moderate' },
    retention: { type: String, default: 'Medium' }
  },
  waterRetention: { type: String, default: 'Moderate' },
  drainage: { type: String, default: 'Well-drained' },
  nutrientCharacteristics: {
    nitrogenStatus: { type: String, default: 'Low' },
    phosphorusStatus: { type: String, default: 'Medium' },
    potassiumStatus: { type: String, default: 'High' },
    organicCarbon: { type: String, default: 'Medium' }
  },
  geographicDistribution: [{ type: String }],
  agriculturalApplications: [{ type: String }],
  suitableCropsSummary: [{
    cropName: { type: String, required: true },
    scientificName: { type: String },
    category: { type: String },
    suitabilityLevel: {
      type: String,
      enum: ['Highly Suitable', 'Suitable', 'Suitable with Improvements', 'Not Recommended'],
      required: true
    },
    explanation: { type: String, required: true }
  }],
  referenceSources: [{
    title: { type: String, required: true },
    organization: { type: String, required: true },
    year: { type: Number }
  }],
  isReferenceModel: { type: Boolean, default: true }
}, {
  timestamps: true
});

soilTypeSchema.index({
  name: 'text',
  classification: 'text',
  characteristics: 'text',
  geographicDistribution: 'text'
}, {
  weights: { name: 10, classification: 5, characteristics: 3, geographicDistribution: 2 },
  name: 'SoilTypeTextIndex'
});

soilTypeSchema.index({ 'typicalPH.min': 1, 'typicalPH.max': 1 });

module.exports = mongoose.models.SoilType || mongoose.model('SoilType', soilTypeSchema, 'soil_types');
