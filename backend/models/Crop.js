const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  scientificName: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Cereal', 'Pulse', 'Cash Crop', 'Oilseed', 'Vegetable', 'Tuber', 'Fiber Crop', 'Horticulture', 'Spice', 'Spices', 'Millet', 'Plantation', 'Fruit'],
    trim: true 
  },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  idealRequirements: {
    pH: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      optimalMin: { type: Number, required: true },
      optimalMax: { type: Number, required: true }
    },
    moisture: { // percentage
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      optimalMin: { type: Number, required: true },
      optimalMax: { type: Number, required: true }
    },
    temperature: { // °C
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      optimalMin: { type: Number, required: true },
      optimalMax: { type: Number, required: true }
    },
    nitrogen: { // kg/ha equivalent or ppm
      min: { type: Number, default: 40 },
      max: { type: Number, default: 150 },
      optimalMin: { type: Number, default: 80 },
      optimalMax: { type: Number, default: 120 }
    },
    phosphorus: {
      min: { type: Number, default: 20 },
      max: { type: Number, default: 80 },
      optimalMin: { type: Number, default: 40 },
      optimalMax: { type: Number, default: 60 }
    },
    potassium: {
      min: { type: Number, default: 20 },
      max: { type: Number, default: 100 },
      optimalMin: { type: Number, default: 40 },
      optimalMax: { type: Number, default: 80 }
    },
    texture: [{ type: String }], // e.g. ["Loamy", "Clay Loam", "Sandy Loam"]
    drainage: [{ type: String }], // e.g. ["Well-drained", "Moderate"]
    organicMatter: {
      min: { type: Number, default: 0.5 },
      optimalMin: { type: Number, default: 1.0 }
    }
  },
  parameterWeights: {
    pH: { type: Number, default: 0.20 },
    moisture: { type: Number, default: 0.25 },
    temperature: { type: Number, default: 0.15 },
    nitrogen: { type: Number, default: 0.12 },
    phosphorus: { type: Number, default: 0.10 },
    potassium: { type: Number, default: 0.08 },
    texture: { type: Number, default: 0.05 },
    drainage: { type: Number, default: 0.05 }
  },
  suitableSoilTypes: [{ type: String }],
  suitableRegions: [{ type: String }], // Indian States
  growingSeasons: [{ type: String, enum: ['Kharif', 'Rabi', 'Zaid', 'Perennial'] }],
  seasonalCalendar: {
    optimalSowingMonths: [{ type: Number }], // 1-12
    optimalHarvestMonths: [{ type: Number }], // 1-12
    sowingWindowHi: { type: String, default: '' },
    sowingWindowEn: { type: String, default: '' },
    harvestWindowHi: { type: String, default: '' },
    harvestWindowEn: { type: String, default: '' },
    seasonAdvisoryHi: { type: String, default: '' },
    seasonAdvisoryEn: { type: String, default: '' }
  },
  irrigationRequirements: { type: String, default: 'Moderate' },
  fertilizerConsiderations: { type: String, default: 'Standard NPK application' },
  cultivationInfo: { type: String, default: '' },
  referenceSources: [{
    title: { type: String, required: true },
    organization: { type: String, required: true },
    year: { type: Number }
  }],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Full-text search index for Crop to Soil Explorer
cropSchema.index({
  name: 'text',
  scientificName: 'text',
  category: 'text',
  description: 'text',
  suitableRegions: 'text'
}, {
  weights: { name: 10, scientificName: 8, category: 4, suitableRegions: 3, description: 1 },
  name: 'CropTextIndex'
});

cropSchema.index({ category: 1 });
cropSchema.index({ growingSeasons: 1 });
cropSchema.index({ 'idealRequirements.pH.optimalMin': 1, 'idealRequirements.pH.optimalMax': 1 });

module.exports = mongoose.models.Crop || mongoose.model('Crop', cropSchema);
