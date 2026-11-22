const SensorReading = require('../models/SensorReading');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { sensorReadingSchema, deviceSchema } = require('../validators');
const { ingestSensorReading } = require('../services/sensorService');

/**
 * Unified Ingestion Endpoint (used by both Hardware Serial Bridge and Simulator)
 */
async function ingestReading(req, res) {
  try {
    const { error, value } = sensorReadingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await ingestSensorReading(value);

    if (result.status === 'idempotent_duplicate') {
      return res.status(200).json({
        success: true,
        idempotent: true,
        message: result.message,
        data: result.reading
      });
    }

    return res.status(201).json({
      success: true,
      idempotent: false,
      message: 'Sensor reading ingested successfully.',
      data: result.reading
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get latest reading for a device
 */
async function getLatestReadingByDevice(req, res) {
  try {
    const { deviceId } = req.params;
    const reading = await SensorReading.findOne({ deviceId: deviceId.toUpperCase() })
      .sort({ timestamp: -1 });

    if (!reading) {
      return res.status(404).json({ success: false, message: `No readings found for device ${deviceId}` });
    }

    const readingObj = reading.toObject ? reading.toObject() : { ...reading };
    readingObj.moisture = readingObj.moisturePercentage !== undefined ? readingObj.moisturePercentage : readingObj.moisture;
    readingObj.rawADC = readingObj.rawValue !== undefined ? readingObj.rawValue : readingObj.rawADC;

    return res.json({ success: true, data: readingObj });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get recent readings for a device (for live graph)
 */
async function getDeviceReadings(req, res) {
  try {
    const deviceId = req.params.id.toUpperCase();
    const limit = parseInt(req.query.limit) || 30;

    const readings = await SensorReading.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return res.json({
      success: true,
      deviceId,
      count: readings.length,
      data: readings.reverse() // chronological order for charts
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get all devices
 */
async function getAllDevices(req, res) {
  try {
    const devices = await Device.find({}).sort({ deviceId: 1 });
    return res.json({ success: true, count: devices.length, data: devices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Register or update device
 */
async function createDevice(req, res) {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId: value.deviceId },
      value,
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({ success: true, data: device });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get device by ID
 */
async function getDeviceById(req, res) {
  try {
    const device = await Device.findOne({ deviceId: req.params.id.toUpperCase() });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    return res.json({ success: true, data: device });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get dynamic real-time IoT hardware connection status
 */
async function getIoTSystemStatus(req, res) {
  try {
    const fifteenSecondsAgo = new Date(Date.now() - 15000);
    const recentHardwareReading = await SensorReading.findOne({
      source: 'hardware',
      timestamp: { $gte: fifteenSecondsAgo }
    }).sort({ timestamp: -1 });

    const latestAnyReading = await SensorReading.findOne({}).sort({ timestamp: -1 });

    if (recentHardwareReading) {
      return res.json({
        success: true,
        connected: true,
        mode: 'hardware',
        status: 'Online (Streaming USB Telemetry)',
        deviceId: recentHardwareReading.deviceId,
        lastReadingTime: recentHardwareReading.timestamp,
        moisture: recentHardwareReading.moisturePercentage,
        temperature: recentHardwareReading.temperature
      });
    }

    return res.json({
      success: true,
      connected: false,
      mode: 'standby',
      status: 'Disconnected (Standby)',
      deviceId: 'DEVICE_001',
      lastReadingTime: latestAnyReading ? latestAnyReading.timestamp : null,
      message: 'No physical hardware detected. Connect Arduino via USB and run bridge.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get recent IoT alerts
 */
async function getAlerts(req, res) {
  try {
    const alerts = await Alert.find({}).sort({ timestamp: -1 }).limit(20);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  ingestReading,
  getLatestReadingByDevice,
  getDeviceReadings,
  getAllDevices,
  createDevice,
  getDeviceById,
  getAlerts,
  getIoTSystemStatus
};
