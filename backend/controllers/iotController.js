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
    const isCritical = (readingObj.moisture >= 65 || readingObj.moisture <= 25);
    readingObj.ledStatus = readingObj.ledStatus || (isCritical ? 'RED_ALERT' : 'GREEN_OPTIMAL');
    readingObj.ledColor = (readingObj.ledStatus === 'RED_ALERT' || isCritical) ? 'red' : 'green';

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
      const isMoistureCritical = (recentHardwareReading.moisturePercentage >= 65 || recentHardwareReading.moisturePercentage <= 25);
      return res.json({
        success: true,
        connected: true,
        mode: 'hardware',
        status: 'Online (Streaming USB Telemetry)',
        deviceId: recentHardwareReading.deviceId,
        lastReadingTime: recentHardwareReading.timestamp,
        moisture: recentHardwareReading.moisturePercentage,
        temperature: recentHardwareReading.temperature,
        ledStatus: isMoistureCritical ? 'RED_ALERT' : 'GREEN_OPTIMAL',
        ledColor: isMoistureCritical ? 'red' : 'green'
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
 * Get recent IoT alerts scoped strictly to the authenticated user
 */
async function getAlerts(req, res) {
  try {
    if (!req.user) {
      // Unauthenticated guests see 0 alerts (no dummy data)
      return res.json({ success: true, count: 0, data: [] });
    }

    const Plot = require('../models/Plot');
    const userPlots = await Plot.find({ owner: req.user._id }).select('plotId').lean();
    const userPlotIds = userPlots.map(p => p.plotId);

    const filter = {
      $or: [
        { user: req.user._id },
        { userId: req.user._id },
        { plotId: { $in: userPlotIds } }
      ]
    };

    const alerts = await Alert.find(filter).sort({ timestamp: -1 }).limit(30);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Delete / Dismiss an alert for the authenticated user
 */
async function deleteAlert(req, res) {
  try {
    const { id } = req.params;
    let filter = { _id: id };

    if (req.user) {
      const Plot = require('../models/Plot');
      const userPlots = await Plot.find({ owner: req.user._id }).select('plotId').lean();
      const userPlotIds = userPlots.map(p => p.plotId);
      filter = {
        _id: id,
        $or: [
          { user: req.user._id },
          { userId: req.user._id },
          { plotId: { $in: userPlotIds } }
        ]
      };
    }

    const deleted = await Alert.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Alert not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Alert deleted successfully', data: deleted });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Manually create a user alert
 */
async function createAlert(req, res) {
  try {
    const { plotId, type, severity, message, messageEn, messageHi, value, threshold } = req.body;
    const userId = req.user?._id || null;
    const newAlert = await Alert.create({
      alertId: `ALT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user: userId,
      userId: userId,
      plotId: plotId || 'PLOT_001',
      deviceId: req.body.deviceId || 'DEVICE_001',
      type: type || 'CUSTOM_FARM_ALERT',
      severity: severity || 'medium',
      message: message || messageEn || 'Custom farm advisory alert',
      messageEn: messageEn || message || 'Custom farm advisory alert',
      messageHi: messageHi || message || 'खेत सलाहकार अलर्ट',
      value,
      threshold,
      deduplicationKey: `USER_${userId || 'GUEST'}_${Date.now()}`,
      timestamp: new Date()
    });
    return res.status(201).json({ success: true, data: newAlert });
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
  deleteAlert,
  createAlert,
  getIoTSystemStatus
};
