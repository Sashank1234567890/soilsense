const SoilTest = require('../models/SoilTest');
const SensorReading = require('../models/SensorReading');
const Plot = require('../models/Plot');

/**
 * Get historical soil tests for a specific plot
 */
async function getPlotSoilHistory(req, res) {
  try {
    const { plotId } = req.params;
    const tests = await SoilTest.find({ plotId: plotId.toUpperCase() })
      .populate('selectedCropId')
      .sort({ timestamp: -1 })
      .limit(50);

    const plot = await Plot.findOne({ plotId: plotId.toUpperCase() });

    return res.json({
      success: true,
      plotId,
      plotName: plot?.name || plotId,
      count: tests.length,
      data: tests
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get moisture time series trend for a device
 */
async function getDeviceMoistureHistory(req, res) {
  try {
    const { deviceId } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    const sinceTime = new Date(Date.now() - hours * 3600 * 1000);

    const readings = await SensorReading.find({
      deviceId: deviceId.toUpperCase(),
      timestamp: { $gte: sinceTime }
    })
      .sort({ timestamp: 1 })
      .limit(100);

    return res.json({
      success: true,
      deviceId: deviceId.toUpperCase(),
      timeWindowHours: hours,
      count: readings.length,
      data: readings
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getPlotSoilHistory,
  getDeviceMoistureHistory
};
