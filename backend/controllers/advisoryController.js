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
    if (!targetPlotId && req.user) {
      const Plot = require('../models/Plot');
      const userPlot = await Plot.findOne({ owner: req.user._id, status: { $ne: 'deleted' } }).sort({ plotId: 1 });
      if (userPlot) {
        targetPlotId = userPlot.plotId;
      }
    }
    if (!targetPlotId) {
      targetPlotId = 'PLOT_001';
    }
    const currentMoisture = req.query.currentMoisture !== undefined ? +req.query.currentMoisture : 34;
    const result = await evaluateCropAlerts({
      plotId: targetPlotId,
      currentMoisture
    });
    res.json({ success: true, data: result });
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
    schedule.location = {
      district: district || schedule.location.district,
      state: state || schedule.location.state,
      lat: lat !== undefined ? +lat : schedule.location.lat,
      lon: lon !== undefined ? +lon : schedule.location.lon,
      autoDetected: !!autoDetected
    };
    await schedule.save();

    // Also update WeatherSnapshot record for this plot
    await WeatherSnapshot.create({
      plotId,
      location: { district: schedule.location.district, state: schedule.location.state },
      temperatureCelsius: +(25 + Math.random() * 5).toFixed(1),
      humidityPercent: Math.round(50 + Math.random() * 25),
      forecastRainNext24hMm: Math.random() > 0.5 ? 6.5 : 0,
      referenceEvapotranspirationET0: 4.1
    });

    res.json({ success: true, data: schedule.location, message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const https = require('https');

function fetchLiveWeatherFromOpenMeteo(lat = 30.9010, lon = 75.8573) {
  return new Promise((resolve) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,et0_fao_evapotranspiration,temperature_2m_max&current=temperature_2m,relative_humidity_2m&timezone=auto`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            temperatureCelsius: +(json.current?.temperature_2m ?? 24.5).toFixed(1),
            humidityPercent: Math.round(json.current?.relative_humidity_2m ?? 60),
            forecastRainNext24hMm: +(json.daily?.precipitation_sum?.[0] ?? 0).toFixed(1),
            referenceEvapotranspirationET0: +(json.daily?.et0_fao_evapotranspiration?.[0] ?? 3.8).toFixed(1),
            source: 'LIVE_OPEN_METEO_API'
          });
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

exports.getWeatherForecast = async (req, res) => {
  try {
    const { plotId = 'PLOT_001', lat = 30.9010, lon = 75.8573 } = req.query;

    // 1. Try real live weather API first
    const liveApiData = await fetchLiveWeatherFromOpenMeteo(+lat, +lon);

    if (liveApiData) {
      return res.json({
        success: true,
        data: {
          ...liveApiData,
          location: { district: 'Farm Coordinates', state: 'India' },
          recordedAt: new Date()
        }
      });
    }

    // 2. Fallback to cached DB snapshot
    const weather = await WeatherSnapshot.findOne({ plotId }).sort({ recordedAt: -1 }).lean() || {
      temperatureCelsius: 24.5,
      humidityPercent: 62,
      forecastRainNext24hMm: 0,
      referenceEvapotranspirationET0: 3.5,
      recordedAt: new Date()
    };
    res.json({ success: true, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
