const CropRecommendation = require('../models/CropRecommendation');
const { evaluateCropSpecific, evaluateAllCrops } = require('../services/cropRecommendationService');
const { cropSpecificRecommendationSchema, generalRecommendationSchema } = require('../validators');

async function getRecommendationsAllCrops(req, res) {
  try {
    const { error, value } = generalRecommendationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const recommendation = await evaluateAllCrops(value.soilTestId);
    return res.status(201).json({
      success: true,
      message: 'Evaluated soil test against all reference crops.',
      data: recommendation
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getRecommendationCropSpecific(req, res) {
  try {
    const { error, value } = cropSpecificRecommendationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const recommendation = await evaluateCropSpecific(value.soilTestId, value.cropId);
    return res.status(201).json({
      success: true,
      message: 'Crop-specific suitability evaluation completed.',
      data: recommendation
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getRecommendationById(req, res) {
  try {
    const rec = await CropRecommendation.findById(req.params.id)
      .populate('soilTestId')
      .populate('selectedCropId');
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation record not found' });
    }
    return res.json({ success: true, data: rec });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getRecommendationBySoilTestId(req, res) {
  try {
    const rec = await CropRecommendation.findOne({ soilTestId: req.params.soilTestId })
      .sort({ createdAt: -1 })
      .populate('selectedCropId');
    if (!rec) {
      return res.status(404).json({ success: false, message: 'No recommendation found for this soil test' });
    }
    return res.json({ success: true, data: rec });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getRecommendationsAllCrops,
  getRecommendationCropSpecific,
  getRecommendationById,
  getRecommendationBySoilTestId
};
