const SoilType = require('../models/SoilType');
const Crop = require('../models/Crop');
const User = require('../models/User');
const Plot = require('../models/Plot');
const Device = require('../models/Device');
const SoilTest = require('../models/SoilTest');
const { indianSoilTypes } = require('../scripts/seedSoilTypes');
const { indianCrops } = require('../scripts/seedCrops');

async function autoSeedDatabase() {
  try {
    // 1. Verify and auto-load 16 Indian Soil Series
    const soilCount = await SoilType.countDocuments();
    if (soilCount < 16) {
      console.log(`[AutoSeed] Current soil types count is ${soilCount}. Seeding full 16 Indian soil types...`);
      for (const soil of indianSoilTypes) {
        await SoilType.updateOne(
          { name: soil.name },
          { $set: soil },
          { upsert: true }
        );
      }
      console.log('[AutoSeed Success] All 16 Indian Soil Series verified & loaded.');
    }

    // 2. Verify and auto-load 30 Indian Crops
    const cropCount = await Crop.countDocuments();
    if (cropCount < 30) {
      console.log(`[AutoSeed] Current crops count is ${cropCount}. Seeding full 30 Indian crops...`);
      for (const crop of indianCrops) {
        await Crop.updateOne(
          { name: crop.name },
          { $set: crop },
          { upsert: true }
        );
      }
      console.log('[AutoSeed Success] All 30 Indian Crops verified & loaded.');
    }

    // 3. Verify and auto-load Official Demo Users
    const demoConfigs = [
      {
        name: 'Ramesh Kumar',
        email: 'farmer@soilsense.in',
        password: 'farmerpassword123',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Jagraon',
        plotName: 'North Basin Plot 1',
        phone: '+91 98765 43210'
      },
      {
        name: 'Dr. Preeti Sharma',
        email: 'agronomist@soilsense.in',
        password: 'agronomistpassword123',
        role: 'agronomist',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'PAU Campus',
        plotName: 'Experimental Block 4',
        phone: '+91 98111 22334'
      },
      {
        name: 'Rahul Verma',
        email: 'student@nitdelhi.ac.in',
        password: 'studentpassword123',
        role: 'student',
        state: 'Delhi',
        district: 'North Delhi',
        village: 'NIT Delhi Campus',
        plotName: 'IoT Soil Lab Bench',
        phone: '+91 99999 88888'
      }
    ];

    let farmerUser = null;
    let agronomistUser = null;
    let studentUser = null;
    for (const d of demoConfigs) {
      let u = await User.findOne({ email: d.email });
      if (!u) {
        u = await User.create(d);
        console.log(`[AutoSeed] Created demo user: ${d.email}`);
      }
      if (d.role === 'farmer') farmerUser = u;
      if (d.role === 'agronomist') agronomistUser = u;
      if (d.role === 'student') studentUser = u;
    }

    // 4. Ensure Device 001 exists
    const existingDevice = await Device.findOne({ deviceId: 'DEVICE_001' });
    if (!existingDevice) {
      await Device.create({
        deviceId: 'DEVICE_001',
        name: 'Field Probe Node Alpha',
        hardwareProfile: 'Arduino Uno CH340 + Capacitive Soil Moisture v1.2',
        pinMapping: {
          analogMoisturePin: 'A0',
          analogTempPin: 'A1',
          baudRate: 9600
        },
        location: {
          plotId: 'PLOT_001',
          coordinates: { lat: 30.9010, lng: 75.8573 }
        },
        status: 'active',
        isSimulated: true
      });
      console.log('[AutoSeed] Created default DEVICE_001');
    }

    // 5. Ensure Distinct Dedicated Plots for Each Demo Role
    const CropSchedule = require('../models/CropSchedule');
    const { CROP_METADATA, checkCropSeasonSuitability } = require('../services/cropScheduleService');

    // 5a. Farmer Plot (PLOT_001 - Wheat)
    if (farmerUser) {
      let plot001 = await Plot.findOne({ plotId: 'PLOT_001' });
      if (!plot001) {
        plot001 = await Plot.create({
          plotId: 'PLOT_001',
          name: 'Ludhiana Basin - Block A (Wheat)',
          owner: farmerUser._id,
          areaAcres: 4.2,
          assignedDeviceId: 'DEVICE_001',
          location: {
            state: 'Punjab',
            district: 'Ludhiana',
            locality: 'Samrala Block',
            coordinates: { latitude: 30.9010, longitude: 75.8573 }
          },
          currentCrop: 'Wheat',
          status: 'active'
        });
        console.log('[AutoSeed] Created PLOT_001 for Farmer (Wheat)');
      } else if (!plot001.owner) {
        plot001.owner = farmerUser._id;
        await plot001.save();
      }

      const sched001 = await CropSchedule.findOne({ plotId: 'PLOT_001' });
      if (!sched001) {
        const meta = CROP_METADATA.Wheat;
        const sow = new Date('2026-10-28');
        await CropSchedule.create({
          plotId: 'PLOT_001',
          assignedDeviceId: 'DEVICE_001',
          cropName: 'Wheat',
          variety: 'PBW 725 (High Yielding)',
          sowingDate: sow,
          totalDurationDays: meta.durationDays,
          expectedHarvestDate: new Date(sow.getTime() + meta.durationDays * 86400000),
          acreage: 4.2,
          location: { district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, autoDetected: false },
          moistureThresholds: { optimal: 55, soonerNotice: 40, criticalWilting: 25 },
          notifications: { enabled: true, criticalMoisture: true, soonerMoisture: true, rainDelay: true, voiceAlert: true, smsAlert: true, phoneNumber: '+91 98765 43210' },
          growthStages: meta.stages,
          status: 'ACTIVE'
        });
      }
    }

    // 5b. Agronomist Plot (PLOT_AGRO_001 - Mustard)
    if (agronomistUser) {
      let plotAgro = await Plot.findOne({ plotId: 'PLOT_AGRO_001' });
      if (!plotAgro) {
        plotAgro = await Plot.create({
          plotId: 'PLOT_AGRO_001',
          name: 'PAU Agronomy Research Field 4 (Mustard)',
          owner: agronomistUser._id,
          areaAcres: 2.5,
          assignedDeviceId: 'DEVICE_001',
          location: {
            state: 'Punjab',
            district: 'Ludhiana',
            locality: 'PAU Campus',
            coordinates: { latitude: 30.9010, longitude: 75.8573 }
          },
          currentCrop: 'Mustard',
          status: 'active'
        });
        console.log('[AutoSeed] Created PLOT_AGRO_001 for Agronomist (Mustard)');
      }

      const schedAgro = await CropSchedule.findOne({ plotId: 'PLOT_AGRO_001' });
      if (!schedAgro) {
        const meta = CROP_METADATA.Mustard || CROP_METADATA.Wheat;
        const sow = new Date('2026-10-15');
        await CropSchedule.create({
          plotId: 'PLOT_AGRO_001',
          assignedDeviceId: 'DEVICE_001',
          cropName: 'Mustard',
          variety: 'Giriraj (RGN-73 High Oil)',
          sowingDate: sow,
          totalDurationDays: meta.durationDays || 125,
          expectedHarvestDate: new Date(sow.getTime() + (meta.durationDays || 125) * 86400000),
          acreage: 2.5,
          location: { district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, autoDetected: false },
          moistureThresholds: { optimal: 50, soonerNotice: 35, criticalWilting: 20 },
          notifications: { enabled: true, criticalMoisture: true, soonerMoisture: true, rainDelay: true, voiceAlert: true, smsAlert: true, phoneNumber: '+91 98111 22334' },
          growthStages: meta.stages,
          status: 'ACTIVE'
        });
      }
    }

    // 5c. Student Plot (PLOT_STU_001 - Maize)
    if (studentUser) {
      let plotStu = await Plot.findOne({ plotId: 'PLOT_STU_001' });
      if (!plotStu) {
        plotStu = await Plot.create({
          plotId: 'PLOT_STU_001',
          name: 'NIT Delhi IoT Smart Agri Farm (Maize)',
          owner: studentUser._id,
          areaAcres: 1.5,
          assignedDeviceId: 'DEVICE_001',
          location: {
            state: 'Delhi',
            district: 'North Delhi',
            locality: 'NIT Delhi Campus',
            coordinates: { latitude: 28.77, longitude: 77.19 }
          },
          currentCrop: 'Maize',
          status: 'active'
        });
        console.log('[AutoSeed] Created PLOT_STU_001 for Student (Maize)');
      }

      const schedStu = await CropSchedule.findOne({ plotId: 'PLOT_STU_001' });
      if (!schedStu) {
        const meta = CROP_METADATA.Maize || CROP_METADATA.Wheat;
        const sow = new Date('2026-10-20');
        await CropSchedule.create({
          plotId: 'PLOT_STU_001',
          assignedDeviceId: 'DEVICE_001',
          cropName: 'Maize',
          variety: 'HQPM-1 (Quality Protein Maize)',
          sowingDate: sow,
          totalDurationDays: meta.durationDays || 110,
          expectedHarvestDate: new Date(sow.getTime() + (meta.durationDays || 110) * 86400000),
          acreage: 1.5,
          location: { district: 'North Delhi', state: 'Delhi', lat: 28.77, lon: 77.19, autoDetected: false },
          moistureThresholds: { optimal: 60, soonerNotice: 45, criticalWilting: 28 },
          notifications: { enabled: true, criticalMoisture: true, soonerMoisture: true, rainDelay: true, voiceAlert: true, smsAlert: true, phoneNumber: '+91 99999 88888' },
          growthStages: meta.stages,
          status: 'ACTIVE'
        });
      }
    }

    // 6. Ensure baseline demo test exists for demo farmer
    if (farmerUser) {
      const existingDemoTest = await SoilTest.findOne({ testId: 'TEST_INIT_DEMO_001' });
      if (!existingDemoTest) {
        const alluvial = await SoilType.findOne({ name: 'Alluvial Soil' });
        const wheat = await Crop.findOne({ name: 'Wheat' });
        await SoilTest.create({
          testId: 'TEST_INIT_DEMO_001',
          user: farmerUser._id,
          plotId: 'PLOT_001',
          testKind: 'crop_specific',
          selectedCrop: wheat?._id,
          selectedCropName: 'Wheat',
          identifiedSoilType: alluvial?._id,
          identifiedSoilName: 'Alluvial Soil',
          overallSource: 'simulation',
          hardwareMetadata: {
            source: 'simulation',
            deviceId: 'DEVICE_001',
            analogPin: 'A0',
            baudRate: 9600
          },
          values: {
            moisture: 48.5,
            pH: 7.2,
            temperature: 21.4,
            nitrogen: 110,
            phosphorus: 55,
            potassium: 48,
            organicMatter: 0.95
          },
          readings: [
            {
              parameter: 'moisture',
              source: 'simulation',
              value: 48.5,
              rawSensorValue: 520,
              calibratedPercentage: 48.5,
              status: 'valid'
            },
            {
              parameter: 'temperature',
              source: 'simulation',
              value: 21.4,
              rawSensorValue: 430,
              calibratedPercentage: 21.4,
              status: 'valid'
            }
          ],
          timestamp: new Date()
        });
        console.log('[AutoSeed] Created baseline demo test for farmer@soilsense.in');
      }
    }

    console.log('[AutoSeed] Database auto-seed check complete.');
  } catch (err) {
    console.error('[AutoSeed Error]:', err.message);
  }
}

module.exports = autoSeedDatabase;
