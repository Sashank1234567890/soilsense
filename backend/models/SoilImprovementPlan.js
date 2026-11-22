const mongoose = require('mongoose');

const parameterIssueSchema = new mongoose.Schema({
  parameter: { type: String, required: true },
  currentValue: { type: mongoose.Schema.Types.Mixed },
  targetRange: { type: String, required: true },
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Moderate' },
  suggestedAmendments: [{ type: String }],
  managementAction: { type: String }
}, { _id: false });

const alternativeCropSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  cropName: { type: String, required: true },
  category: { type: String },
  suitabilityLevel: { type: String, required: true },
  suitabilityScore: { type: Number },
  reason: { type: String, required: true }
}, { _id: false });

const soilImprovementPlanSchema = new mongoose.Schema({
  soilTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SoilTest', required: true },
  targetCropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  targetCropName: { type: String },
  deficiencies: [parameterIssueSchema],
  excesses: [parameterIssueSchema],
  organicMatterRecommendations: [{ type: String }],
  drainageRecommendations: [{ type: String }],
  fertilizerSchedule: [{
    stage: { type: String },
    fertilizerType: { type: String },
    rate: { type: String },
    method: { type: String },
    timing: { type: String }
  }],
  isImprovementPractical: { type: Boolean, default: true },
  practicalityExplanation: { type: String, required: true },
  alternativeCrops: [alternativeCropSchema],
  retestingRequirements: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

soilImprovementPlanSchema.index({ soilTestId: 1 });
soilImprovementPlanSchema.index({ targetCropId: 1 });

module.exports = mongoose.models.SoilImprovementPlan || mongoose.model('SoilImprovementPlan', soilImprovementPlanSchema, 'soil_improvement_plans');
