const SensorReading = require('../models/SensorReading');
const Device = require('../models/Device');
const Plot = require('../models/Plot');
const Alert = require('../models/Alert');

/**
 * Calibrates raw ADC reading to estimated moisture percentage
 * @param {number} rawValue - ADC reading (0-1023)
 * @param {number} dryADC - ADC in air (0% moisture, e.g. 820)
 * @param {number} wetADC - ADC in water (100% moisture, e.g. 350)
 * Note: Capacitive soil moisture sensor V1.2 outputs higher voltage/ADC in dry soil, lower in wet soil.
 */
function calibrateMoisture(rawValue, dryADC = 820, wetADC = 350) {
  if (rawValue >= dryADC) return 0;
  if (rawValue <= wetADC) return 100;
  const pct = ((dryADC - rawValue) / (dryADC - wetADC)) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)) * 10) / 10;
}

/**
 * Checks for anomalies and triggers alerts with deduplication across all farms assigned to this device
 */
async function checkSensorAlerts(reading) {
  const { deviceId, plotId, moisturePercentage, timestamp } = reading;
  const todayKey = new Date(timestamp).toISOString().slice(0, 10);

  // Find all plots assigned to this hardware device
  let assignedPlots = await Plot.find({
    $or: [
      { assignedDeviceId: deviceId },
      { plotId: plotId || 'PLOT_001' }
    ]
  }).lean();

  if (!assignedPlots || assignedPlots.length === 0) {
    assignedPlots = [{ plotId: plotId || 'PLOT_001' }];
  }

  for (const p of assignedPlots) {
    const targetPlotId = p.plotId;

    // 1. Critical Low Moisture Alert (< 20%)
    if (moisturePercentage < 20) {
      const dedupKey = `${targetPlotId}_CRITICAL_MOISTURE_LOW_${todayKey}`;
      const existing = await Alert.findOne({ deduplicationKey: dedupKey, resolved: false });
      if (!existing) {
        await Alert.create({
          alertId: `ALT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          deviceId,
          plotId: targetPlotId,
          type: 'CRITICAL_MOISTURE_LOW',
          severity: 'high',
          message: `Soil moisture in farm ${targetPlotId} dropped to critical deficit (${moisturePercentage}%). Immediate irrigation required.`,
          value: moisturePercentage,
          threshold: 20,
          deduplicationKey: dedupKey,
          timestamp: new Date()
        });
      }
    }

    // 2. Critical High Moisture / Waterlogging Alert (> 80%)
    if (moisturePercentage > 80) {
      const dedupKey = `${targetPlotId}_CRITICAL_MOISTURE_HIGH_${todayKey}`;
      const existing = await Alert.findOne({ deduplicationKey: dedupKey, resolved: false });
      if (!existing) {
        await Alert.create({
          alertId: `ALT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          deviceId,
          plotId: targetPlotId,
          type: 'CRITICAL_MOISTURE_HIGH',
          severity: 'high',
          message: `Soil moisture in farm ${targetPlotId} reached saturation (${moisturePercentage}%). Inspect for waterlogging or root hypoxia.`,
          value: moisturePercentage,
          threshold: 80,
          deduplicationKey: dedupKey,
          timestamp: new Date()
        });
      }
    }

    // 3. Evaluate specific crop growth stage alert rules for this farm
    try {
      const { evaluateCropAlerts } = require('./cropScheduleService');
      await evaluateCropAlerts({ plotId: targetPlotId, currentMoisture: moisturePercentage });
    } catch (e) {
      // Non-fatal
    }
  }
}

/**
 * Validated Ingestion Pipeline (same for hardware and simulator)
 */
async function ingestSensorReading(payload) {
  const { deviceId, plotId, rawValue, moisturePercentage, temperature, timestamp, source, ingestionId, metadata } = payload;

  // 1. Idempotency Check: check if ingestionId already exists
  const existing = await SensorReading.findOne({ ingestionId });
  if (existing) {
    return {
      status: 'idempotent_duplicate',
      message: 'Reading already ingested with this ingestion ID. Skipped duplicate storage.',
      reading: existing
    };
  }

  // 2. Fetch device calibration if available
  let calDry = 820;
  let calWet = 350;
  const device = await Device.findOne({ deviceId });
  if (device && device.calibration) {
    calDry = device.calibration.dryADC;
    calWet = device.calibration.wetADC;
  }

  // Calculate calibrated moisture if not explicitly provided or re-verify
  const finalMoisture = moisturePercentage !== undefined && moisturePercentage !== null 
    ? moisturePercentage 
    : calibrateMoisture(rawValue, calDry, calWet);

  // 3. Save to MongoDB
  const newReading = await SensorReading.create({
    deviceId,
    plotId,
    rawValue,
    moisturePercentage: finalMoisture,
    temperature: temperature !== undefined ? temperature : null,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    source: source || 'simulation',
    ingestionId,
    metadata: {
      ...metadata,
      dryADC: calDry,
      wetADC: calWet
    }
  });

  // 4. Update Device Heartbeat and Plot lastTestedAt
  if (device) {
    device.lastHeartbeat = newReading.timestamp;
    device.status = 'active';
    await device.save();
  }

  await Plot.findOneAndUpdate(
    { plotId },
    { lastTestedAt: newReading.timestamp },
    { new: true }
  );

  // 5. Evaluate threshold alerts
  await checkSensorAlerts(newReading);

  return {
    status: 'success',
    reading: newReading
  };
}

module.exports = {
  calibrateMoisture,
  ingestSensorReading,
  checkSensorAlerts
};
