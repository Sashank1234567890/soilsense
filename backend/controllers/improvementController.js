const SoilImprovementPlan = require('../models/SoilImprovementPlan');
const { generateSoilImprovementPlan } = require('../services/soilImprovementService');
const { soilImprovementSchema } = require('../validators');

async function createImprovementPlan(req, res) {
  try {
    const { error, value } = soilImprovementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const plan = await generateSoilImprovementPlan(value.soilTestId, value.targetCropId);
    return res.status(201).json({
      success: true,
      message: 'Soil improvement plan generated.',
      data: plan
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getImprovementPlanById(req, res) {
  try {
    const plan = await SoilImprovementPlan.findById(req.params.id)
      .populate('soilTestId')
      .populate('targetCropId');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    return res.json({ success: true, data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getImprovementPlanBySoilTestId(req, res) {
  try {
    const plan = await SoilImprovementPlan.findOne({ soilTestId: req.params.soilTestId })
      .sort({ createdAt: -1 })
      .populate('targetCropId');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No improvement plan found for this test' });
    }
    return res.json({ success: true, data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createImprovementPlan,
  getImprovementPlanById,
  getImprovementPlanBySoilTestId
};
