const SensorReading = require('../models/SensorReading');
const Device = require('../models/Device');
const Plot = require('../models/Plot');
const Alert = require('../models/Alert');

function calibrateMoisture(rawValue, dryADC = 820, wetADC = 350) {
  if (rawValue >= dryADC) return 0;
  if (rawValue <= wetADC) return 100;
  const pct = ((dryADC - rawValue) / (dryADC - wetADC)) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)) * 10) / 10;
}

async function checkSensorAlerts(reading) {
  const { deviceId, plotId, moisturePercentage, timestamp } = reading;
  const todayKey = new Date(timestamp).toISOString().slice(0, 10);

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

    if (moisturePercentage < 20) {
      const dedupKey = `${targetPlotId}_CRITICAL_MOISTURE_LOW_${todayKey}`;
      const existing = await Alert.findOne({ deduplicationKey: dedupKey, resolved: false });
      if (!existing) {
        await Alert.create({
          alertId: `ALT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          user: p.owner || null,
          userId: p.owner || null,
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

    if (moisturePercentage > 80) {
      const dedupKey = `${targetPlotId}_CRITICAL_MOISTURE_HIGH_${todayKey}`;
      const existing = await Alert.findOne({ deduplicationKey: dedupKey, resolved: false });
      if (!existing) {
        await Alert.create({
          alertId: `ALT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          user: p.owner || null,
          userId: p.owner || null,
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

    try {
      const { evaluateCropAlerts } = require('./cropScheduleService');
      await evaluateCropAlerts({ plotId: targetPlotId, currentMoisture: moisturePercentage });
    } catch (e) {

    }
  }
}

async function ingestSensorReading(payload) {
  const { deviceId, plotId, rawValue, moisturePercentage, temperature, timestamp, source, ingestionId, metadata, ledStatus } = payload;

  const existing = await SensorReading.findOne({ ingestionId });
  if (existing) {
    return {
      status: 'idempotent_duplicate',
      message: 'Reading already ingested with this ingestion ID. Skipped duplicate storage.',
      reading: existing
    };
  }

  let calDry = 820;
  let calWet = 350;
  const device = await Device.findOne({ deviceId });
  if (device && device.calibration) {
    calDry = device.calibration.dryADC;
    calWet = device.calibration.wetADC;
  }

  const finalMoisture = moisturePercentage !== undefined && moisturePercentage !== null
    ? moisturePercentage
    : calibrateMoisture(rawValue, calDry, calWet);

  const newReading = await SensorReading.create({
    deviceId,
    plotId,
    rawValue,
    moisturePercentage: finalMoisture,
    temperature: temperature !== undefined ? temperature : null,
    ledStatus: ledStatus || (finalMoisture >= 65 ? 'RED_ALERT' : 'GREEN_OPTIMAL'),
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    source: source || 'simulation',
    ingestionId,
    metadata: {
      ...metadata,
      dryADC: calDry,
      wetADC: calWet
    }
  });

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
