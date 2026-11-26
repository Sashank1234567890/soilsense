const SoilType = require('../models/SoilType');
const SoilProfile = require('../models/SoilProfile');
const SoilTest = require('../models/SoilTest');
const Crop = require('../models/Crop');
const SensorReading = require('../models/SensorReading');
const { soilTestSchema } = require('../validators');
const { analyzeSoilCondition } = require('../services/soilAnalysisService');
const { classifySoil } = require('../services/soilClassificationService');
const { evaluateCropAgainstSoil } = require('../services/cropRecommendationService');

async function searchSoilTypes(req, res) {
  try {
    const q = req.query.q ? req.query.q.trim() : '';

    if (!q) {
      const soils = await SoilType.find({}).sort({ name: 1 });
      return res.json({ success: true, count: soils.length, data: soils });
    }

    const searchRegex = new RegExp(q, 'i');
    const filter = {
      $or: [
        { name: searchRegex },
        { classification: searchRegex },
        { shortDescription: searchRegex },
        { characteristics: searchRegex },
        { geographicDistribution: searchRegex },
        { texture: searchRegex }
      ]
    };

    const soils = await SoilType.find(filter).sort({ name: 1 });
    return res.json({
      success: true,
      query: q,
      count: soils.length,
      data: soils
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getAllSoilTypes(req, res) {
  try {
    const soils = await SoilType.find({}).sort({ name: 1 });
    return res.json({ success: true, count: soils.length, data: soils });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getSoilTypeById(req, res) {
  try {
    const soil = await SoilType.findById(req.params.id);
    if (!soil) {
      return res.status(404).json({ success: false, message: 'Soil type not found' });
    }

    const highlySuitable = [];
    const suitable = [];
    const suitableWithImprovements = [];
    const notRecommended = [];

    (soil.suitableCropsSummary || []).forEach(cropItem => {
      if (cropItem.suitabilityLevel === 'Highly Suitable') highlySuitable.push(cropItem);
      else if (cropItem.suitabilityLevel === 'Suitable') suitable.push(cropItem);
      else if (cropItem.suitabilityLevel === 'Suitable with Improvements') suitableWithImprovements.push(cropItem);
      else notRecommended.push(cropItem);
    });

    return res.json({
      success: true,
      data: soil,
      groupedCrops: {
        highlySuitable,
        suitable,
        suitableWithImprovements,
        notRecommended
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getAllSoilProfiles(req, res) {
  try {
    const profiles = await SoilProfile.find({}).populate('soilTypeId').sort({ createdAt: -1 });
    return res.json({ success: true, count: profiles.length, data: profiles });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function createSoilTest(req, res) {
  try {
    const { error, value } = soilTestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    if (value.overallSource === 'hardware') {
      const sixtySecondsAgo = new Date(Date.now() - 60000);
      const recentHardwareReading = await SensorReading.findOne({
        source: 'hardware',
        timestamp: { $gte: sixtySecondsAgo }
      });
      if (!recentHardwareReading) {
        value.overallSource = 'simulation';
      }
    }

    const testId = `TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const { condition, dataCompleteness } = analyzeSoilCondition(value.values, value.parameterSources);

    let selectedCropName = '';
    if (value.selectedCropId) {
      const crop = await Crop.findById(value.selectedCropId);
      if (crop) selectedCropName = crop.name;
    }

    const newTest = await SoilTest.create({
      testId,
      userId: req.user ? req.user._id : (value.userId || null),
      plotId: value.plotId || 'PLOT_001',
      deviceId: value.deviceId || null,
      selectedCropId: value.selectedCropId || null,
      selectedCropName,
      testKind: value.testKind || 'general',
      values: value.values,
      parameterSources: value.parameterSources || {},
      overallSource: value.overallSource || 'simulation',
      location: value.location || {
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Jagraon',
        plotName: 'Plot 01'
      },
      dataCompleteness,
      analysisStatus: 'completed',
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Soil test recorded successfully.',
      data: newTest
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getSoilTestById(req, res) {
  try {
    const test = await SoilTest.findById(req.params.id).populate('selectedCropId');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Soil test not found' });
    }
    return res.json({ success: true, data: test });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

const CropRecommendation = require('../models/CropRecommendation');
const AnalysisReport = require('../models/AnalysisReport');

async function getAllSoilTests(req, res) {
  try {
    const { plotId, source, cropId, userId, limit = 50 } = req.query;
    const filter = {};
    if (plotId) filter.plotId = plotId;
    if (source) filter.overallSource = source;
    if (cropId) filter.selectedCropId = cropId;

    if (req.user) {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    } else {
      return res.json({ success: true, count: 0, data: [] });
    }

    const tests = await SoilTest.find(filter)
      .populate('selectedCropId')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    const testIds = tests.map(t => t._id);
    const [recommendations, reports] = await Promise.all([
      CropRecommendation.find({ soilTestId: { $in: testIds } }).lean(),
      AnalysisReport.find({ soilTestId: { $in: testIds } }).lean()
    ]);

    const recMap = {};
    recommendations.forEach(r => { recMap[r.soilTestId.toString()] = r; });

    const repMap = {};
    reports.forEach(rp => { repMap[rp.soilTestId.toString()] = rp; });

    const enrichedTests = tests.map(t => ({
      ...t,
      recommendation: recMap[t._id.toString()] || null,
      report: repMap[t._id.toString()] || null
    }));

    return res.json({ success: true, count: enrichedTests.length, data: enrichedTests });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function analyseSoil(req, res) {
  try {
    const { values, parameterSources } = req.body;
    const analysis = analyzeSoilCondition(values, parameterSources);
    return res.json({ success: true, data: analysis });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function classifySoilEndpoint(req, res) {
  try {
    const { values, parameterSources } = req.body;
    const classification = await classifySoil(values, parameterSources);
    return res.json({ success: true, data: classification });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function compareSoilProfiles(req, res) {
  try {
    const { testIds, profileIds } = req.body;
    let profiles = [];

    if (testIds && testIds.length > 0) {
      profiles = await SoilTest.find({ _id: { $in: testIds } }).populate('selectedCropId').lean();
    } else if (profileIds && profileIds.length > 0) {
      profiles = await SoilProfile.find({ _id: { $in: profileIds } }).populate('soilTypeId').lean();
    } else {

      const defaultFilter = req.user ? { userId: req.user._id } : {};
      profiles = await SoilTest.find(defaultFilter).sort({ timestamp: -1 }).limit(2).populate('selectedCropId').lean();
    }

    if (profiles.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 soil tests or profiles are required for comparison.'
      });
    }

    const ids = profiles.map(p => p._id);
    const recs = await CropRecommendation.find({ soilTestId: { $in: ids } }).lean();
    const recMap = {};
    recs.forEach(r => { recMap[r.soilTestId.toString()] = r; });

    profiles = profiles.map(p => ({
      ...p,
      recommendations: recMap[p._id.toString()]?.recommendations || []
    }));

    const parameters = [
      { key: 'moisture', label: 'Moisture (%)', unit: '%' },
      { key: 'pH', label: 'Soil pH', unit: 'pH' },
      { key: 'temperature', label: 'Temperature (°C)', unit: '°C' },
      { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'kg/ha' },
      { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'kg/ha' },
      { key: 'potassium', label: 'Potassium (K)', unit: 'kg/ha' },
      { key: 'texture', label: 'Texture', unit: '' },
      { key: 'organicMatter', label: 'Organic Matter', unit: '%' }
    ];

    const comparisonMatrix = parameters.map(p => {
      const row = { parameter: p.label, unit: p.unit, values: [] };
      profiles.forEach(item => {
        const valObj = item.values || item.baselineValues || {};
        row.values.push(valObj[p.key] !== undefined ? valObj[p.key] : 'N/A');
      });
      return row;
    });

    return res.json({
      success: true,
      profiles,
      comparisonMatrix
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  searchSoilTypes,
  getAllSoilTypes,
  getSoilTypeById,
  getAllSoilProfiles,
  createSoilTest,
  getSoilTestById,
  getAllSoilTests,
  analyseSoil,
  classifySoilEndpoint,
  compareSoilProfiles
};
