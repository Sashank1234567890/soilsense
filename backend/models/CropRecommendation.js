const mongoose = require('mongoose');

const parameterComparisonSchema = new mongoose.Schema({
  parameter: { type: String, required: true },
  measuredValue: { type: mongoose.Schema.Types.Mixed },
  requiredRange: { type: String, required: true },
  optimalRange: { type: String },
  status: { 
    type: String, 
    enum: ['Optimal', 'Acceptable', 'Deficient', 'Excessive', 'Missing'],
    required: true 
  },
  deviationPercentage: { type: Number, default: 0 },
  parameterWeight: { type: Number, default: 0.1 },
  source: { type: String, default: 'measured' }
}, { _id: false });

const singleCropRecommendationSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  cropName: { type: String, required: true },
  scientificName: { type: String },
  category: { type: String },
  image: { type: String },
  suitabilityLevel: {
    type: String,
    enum: ['Highly Suitable', 'Suitable', 'Suitable with Improvements', 'Not Recommended', 'Insufficient Data'],
    required: true
  },
  suitabilityScore: { type: Number, default: null }, // 0 to 100, null if data is insufficient
  parameterComparisons: [parameterComparisonSchema],
  matchingParameters: [{ type: String }],
  deficientParameters: [{ type: String }],
  excessiveParameters: [{ type: String }],
  missingParameters: [{ type: String }],
  explanation: { type: String, required: true },
  improvementSuggestions: [{ type: String }],
  growingSeason: [{ type: String }],
  verifiedRegions: [{ type: String }]
}, { _id: false });

const cropRecommendationSchema = new mongoose.Schema({
  soilTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SoilTest', required: true },
  selectedCropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }, // For crop-specific evaluation
  evaluationType: {
    type: String,
    enum: ['crop_specific', 'all_crops'],
    required: true,
    default: 'all_crops'
  },
  dataCompletenessPercent: { type: Number, required: true },
  isDataSufficient: { type: Boolean, required: true },
  overallSuitability: {
    type: String,
    enum: ['Suitable', 'Moderately Suitable', 'Not Suitable', 'Insufficient Data'],
    default: 'Moderately Suitable'
  },
  suitabilityScore: { type: Number, default: null }, // for crop-specific single crop
  recommendations: [singleCropRecommendationSchema],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

cropRecommendationSchema.index({ soilTestId: 1 });
cropRecommendationSchema.index({ selectedCropId: 1 });
cropRecommendationSchema.index({ createdAt: -1 });

module.exports = mongoose.models.CropRecommendation || mongoose.model('CropRecommendation', cropRecommendationSchema, 'crop_recommendations');
