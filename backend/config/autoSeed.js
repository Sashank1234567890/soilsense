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
    for (const d of demoConfigs) {
      let u = await User.findOne({ email: d.email });
      if (!u) {
        u = await User.create(d);
        console.log(`[AutoSeed] Created demo user: ${d.email}`);
      }
      if (d.role === 'farmer') {
        farmerUser = u;
      }
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

    // 5. Ensure Plot 001 exists
    const existingPlot = await Plot.findOne({ plotId: 'PLOT_001' });
    if (!existingPlot && farmerUser) {
      await Plot.create({
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
      console.log('[AutoSeed] Created default PLOT_001');
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
