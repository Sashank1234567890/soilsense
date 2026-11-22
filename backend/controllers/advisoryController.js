const { evaluateIrrigation } = require('../services/smartIrrigationService');
const { calculateFertilizerPrescription } = require('../services/icarFertilizerService');
const { assessDiseaseRisk } = require('../services/diseaseRiskService');
const { calculateMarketROI } = require('../services/mandiRoiService');
const { generateSoilHealthCard } = require('../services/soilHealthCardService');
const WeatherSnapshot = require('../models/WeatherSnapshot');
const SensorReading = require('../models/SensorReading');

exports.getIrrigationAdvisory = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', cropName = 'Wheat', cropStage = 'VEGETATIVE', currentMoisture = 36.5, acreage = 1.0 } = req.query;
    const advisory = await evaluateIrrigation({
      plotId,
      cropName,
      cropStage,
      currentMoisture: +currentMoisture,
      acreage: +acreage
    });
    res.json({ success: true, data: advisory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFertilizerPrescription = (req, res) => {
  try {
    const { plotId = 'PLOT_001', cropName = 'Wheat', cropStage = 'VEGETATIVE', n = 240, p = 18, k = 180, ph = 7.2 } = req.query;
    const prescription = calculateFertilizerPrescription({
      plotId,
      cropName,
      cropStage,
      soilNPK: { nitrogen: +n, phosphorus: +p, potassium: +k, pH: +ph }
    });
    res.json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDiseaseRisk = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', cropName = 'Wheat' } = req.query;
    const recent = await SensorReading.find({ plotId }).sort({ timestamp: -1 }).limit(10).lean();
    const risk = await assessDiseaseRisk({ plotId, cropName, recentReadings: recent });
    res.json({ success: true, data: risk });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMarketROI = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', cropName = 'Wheat' } = req.query;
    const roiData = await calculateMarketROI({ plotId, cropName });
    res.json({ success: true, data: roiData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createSoilHealthCard = async (req, res) => {
  try {
    const card = await generateSoilHealthCard(req.body);
    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const {
  evaluateCropAlerts,
  getOrInitCropSchedule,
  markCropAsHarvested,
  getAllFarmsSummary,
  createNewFarm,
  updateFarmNotifications,
  deleteFarm,
  checkCropSeasonSuitability,
  CROP_METADATA,
  AVAILABLE_DEVICES
} = require('../services/cropScheduleService');

exports.getAvailableDevices = (req, res) => {
  res.json({ success: true, data: AVAILABLE_DEVICES });
};

exports.checkSeasonSuitability = async (req, res) => {
  try {
    const { cropName = 'Wheat', sowingDate } = req.query;
    const date = sowingDate ? new Date(sowingDate) : new Date();
    const result = checkCropSeasonSuitability(cropName, date);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCropScheduleAndAlerts = async (req, res) => {
  try {
    let targetPlotId = req.query.plotId;
    const Plot = require('../models/Plot');

    if (req.user) {
      if (targetPlotId) {
        const owned = await Plot.findOne({ plotId: targetPlotId, owner: req.user._id, status: { $ne: 'deleted' } });
        if (!owned) {
          // If the requested plot does not belong to this user, try finding their first plot
          const firstPlot = await Plot.findOne({ owner: req.user._id, status: { $ne: 'deleted' } }).sort({ plotId: 1 });
          if (!firstPlot) {
            return res.json({ success: true, hasFarm: false, data: null });
          }
          targetPlotId = firstPlot.plotId;
        }
      } else {
        const firstPlot = await Plot.findOne({ owner: req.user._id, status: { $ne: 'deleted' } }).sort({ plotId: 1 });
        if (!firstPlot) {
          return res.json({ success: true, hasFarm: false, data: null });
        }
        targetPlotId = firstPlot.plotId;
      }
    }

    if (!targetPlotId) {
      if (req.user) {
        return res.json({ success: true, hasFarm: false, data: null });
      }
      targetPlotId = 'PLOT_001';
    }

    const currentMoisture = req.query.currentMoisture !== undefined ? +req.query.currentMoisture : 34;
    const result = await evaluateCropAlerts({
      plotId: targetPlotId,
      currentMoisture
    });
    res.json({ success: true, hasFarm: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllFarms = async (req, res) => {
  try {
    const userId = req.user?._id;
    const farms = await getAllFarmsSummary(userId);
    res.json({ success: true, data: farms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addFarm = async (req, res) => {
  try {
    const { name, district, state, acreage, cropName, variety, sowingDate, soilType, notifications, assignedDeviceId } = req.body;
    const result = await createNewFarm({
      name,
      district,
      state,
      acreage,
      cropName,
      variety,
      sowingDate,
      soilType,
      notifications,
      assignedDeviceId,
      owner: req.user?._id
    });
    res.status(201).json({ success: true, data: result, message: 'New farm created and initialized successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', notifications, assignedDeviceId } = req.body;
    const updated = await updateFarmNotifications(plotId, notifications, assignedDeviceId);
    res.json({ success: true, data: updated, message: 'Crop notification preferences updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.removeFarm = async (req, res) => {
  try {
    const { plotId } = req.params;
    await deleteFarm(plotId);
    res.json({ success: true, message: `Farm ${plotId} deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateCropSchedule = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', cropName, variety, sowingDate, acreage, moistureThresholds, location, assignedDeviceId } = req.body;
    const schedule = await getOrInitCropSchedule(plotId);
    if (assignedDeviceId !== undefined) {
      schedule.assignedDeviceId = assignedDeviceId;
      const Plot = require('../models/Plot');
      await Plot.findOneAndUpdate({ plotId }, { assignedDeviceId });
    }
    if (cropName) {
      schedule.cropName = cropName;
      const meta = CROP_METADATA[cropName] || CROP_METADATA.Wheat;
      schedule.growthStages = meta.stages;
      schedule.totalDurationDays = meta.durationDays;
    }
    if (variety) schedule.variety = variety;
    if (sowingDate) {
      schedule.sowingDate = new Date(sowingDate);
      const meta = CROP_METADATA[schedule.cropName] || CROP_METADATA.Wheat;
      schedule.expectedHarvestDate = new Date(schedule.sowingDate.getTime() + (schedule.totalDurationDays || meta.durationDays) * 86400000);
    }
    if (acreage) schedule.acreage = +acreage;
    if (moistureThresholds) schedule.moistureThresholds = { ...schedule.moistureThresholds, ...moistureThresholds };
    if (location) schedule.location = { ...schedule.location, ...location };
    await schedule.save();

    const evaluated = await evaluateCropAlerts({
      plotId,
      currentMoisture: req.body.currentMoisture ? +req.body.currentMoisture : 34
    });

    res.json({ success: true, data: evaluated, message: 'Crop schedule updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.harvestCrop = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', actualYieldQuintals = 22, harvestNotes = '' } = req.body;
    await markCropAsHarvested({ plotId, actualYieldQuintals: +actualYieldQuintals, harvestNotes });
    const evaluated = await evaluateCropAlerts({
      plotId,
      currentMoisture: req.body.currentMoisture ? +req.body.currentMoisture : 34
    });
    res.json({ success: true, data: evaluated, message: 'Crop harvested and season archived in database successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', district, state, lat, lon, autoDetected = false } = req.body;
    const schedule = await getOrInitCropSchedule(plotId);

    const parsedLat = lat !== undefined ? +lat : (schedule.location?.lat || 30.9010);
    const parsedLon = lon !== undefined ? +lon : (schedule.location?.lon || 75.8573);

    schedule.location = {
      district: district || schedule.location.district,
      state: state || schedule.location.state,
      lat: parsedLat,
      lon: parsedLon,
      autoDetected: !!autoDetected
    };
    await schedule.save();

    // Also update Plot document if it exists in DB
    const Plot = require('../models/Plot');
    await Plot.updateOne(
      { plotId },
      {
        $set: {
          'location.district': schedule.location.district,
          'location.state': schedule.location.state,
          'location.coordinates': { latitude: parsedLat, longitude: parsedLon }
        }
      }
    );

    // Call unified live Open-Meteo Weather API for the new location to fetch real-time rain & temperature
    const newSnapshot = await fetchLiveWeather({
      lat: parsedLat,
      lon: parsedLon,
      district: schedule.location.district,
      state: schedule.location.state,
      plotId
    });

    // Re-evaluate crop alerts for this plot with the new live weather snapshot
    const updatedEval = await evaluateCropAlerts({ plotId });

    res.json({
      success: true,
      data: {
        location: schedule.location,
        weather: newSnapshot,
        evaluation: updatedEval
      },
      message: 'Location updated and live rain forecast fetched successfully from Weather API'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const { fetchLiveWeather } = require('../services/weatherService');

exports.getWeatherForecast = async (req, res) => {
  try {
    const { plotId = 'PLOT_001' } = req.query;
    let lat = req.query.lat ? +req.query.lat : null;
    let lon = req.query.lon ? +req.query.lon : null;
    let district = 'Farm Coordinates';
    let state = 'India';

    if (!lat || !lon) {
      const CropSchedule = require('../models/CropSchedule');
      const Plot = require('../models/Plot');
      const schedule = await CropSchedule.findOne({ plotId, status: 'ACTIVE' }).lean();
      const plot = await Plot.findOne({ plotId }).lean();
      lat = schedule?.location?.lat || plot?.location?.coordinates?.latitude || (plotId === 'PLOT_STU_001' ? 28.77 : 30.9010);
      lon = schedule?.location?.lon || plot?.location?.coordinates?.longitude || (plotId === 'PLOT_STU_001' ? 77.19 : 75.8573);
      district = schedule?.location?.district || plot?.location?.district || 'Delhi';
      state = schedule?.location?.state || plot?.location?.state || 'Delhi';
    }

    const weather = await fetchLiveWeather({ lat, lon, district, state, plotId });
    res.json({ success: true, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
