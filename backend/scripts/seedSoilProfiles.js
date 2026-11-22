const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Plot = require('../models/Plot');
const Device = require('../models/Device');
const SoilProfile = require('../models/SoilProfile');
const SoilType = require('../models/SoilType');
const Crop = require('../models/Crop');
const SoilTest = require('../models/SoilTest');

dotenv.config();

async function seedSoilProfiles() {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?replicaSet=rs0';
    await mongoose.connect(connStr);
    console.log('[Seed] Connected to MongoDB for Soil Profiles.');

    await User.deleteMany({});
    await Plot.deleteMany({});
    await Device.deleteMany({});
    await SoilProfile.deleteMany({});
    await SoilTest.deleteMany({});

    // 1. Create Demo Users
    const user = await User.create({
      name: "Ramesh Sharma",
      email: "ramesh.farmer@soilsense.agri",
      password: "password123",
      role: "farmer",
      phone: "+91 98765 43210",
      state: "Punjab",
      district: "Ludhiana",
      village: "Jagraon"
    });

    const agronomist = await User.create({
      name: "Dr. Ananya Sen",
      email: "ananya.sen@icar.org.in",
      password: "password123",
      role: "agronomist",
      phone: "+91 91234 56789",
      state: "Delhi",
      district: "New Delhi",
      village: "Pusa Campus"
    });

    // 2. Fetch Soil Types and Crops
    const alluvialSoil = await SoilType.findOne({ name: "Alluvial Soil" });
    const blackSoil = await SoilType.findOne({ name: "Black Soil" });
    const wheat = await Crop.findOne({ name: "Wheat" });
    const cotton = await Crop.findOne({ name: "Cotton" });

    // 3. Create Demo Plots
    const plot1 = await Plot.create({
      plotId: "PLOT_001",
      name: "North Farm - Block A (Wheat Basin)",
      owner: user._id,
      areaAcres: 3.5,
      assignedDeviceId: "DEVICE_001",
      location: {
        state: "Punjab",
        district: "Ludhiana",
        locality: "Jagraon Canal Road",
        coordinates: { latitude: 30.785, longitude: 75.478 }
      },
      currentCrop: "Wheat",
      lastTestedAt: new Date(),
      status: "active"
    });

    const plot2 = await Plot.create({
      plotId: "PLOT_002",
      name: "South Farm - Block B (Cotton Sector)",
      owner: user._id,
      areaAcres: 5.0,
      assignedDeviceId: "DEVICE_002",
      location: {
        state: "Madhya Pradesh",
        district: "Indore",
        locality: "Sanwer Belt",
        coordinates: { latitude: 22.973, longitude: 75.834 }
      },
      currentCrop: "Cotton",
      lastTestedAt: new Date(Date.now() - 48 * 3600 * 1000),
      status: "active"
    });

    // 4. Create Demo Devices
    await Device.create([
      {
        deviceId: "DEVICE_001",
        name: "SoilSense Uno Probe 01",
        plotId: "PLOT_001",
        status: "active",
        hardwareModel: "Arduino Uno + Capacitive Moisture V1.2",
        calibration: { dryADC: 820, wetADC: 350 },
        lastHeartbeat: new Date(),
        source: "simulation",
        firmwareVersion: "1.0.0-ino"
      },
      {
        deviceId: "DEVICE_002",
        name: "SoilSense Uno Probe 02",
        plotId: "PLOT_002",
        status: "active",
        hardwareModel: "Arduino Uno + Capacitive Moisture V1.2",
        calibration: { dryADC: 825, wetADC: 345 },
        lastHeartbeat: new Date(),
        source: "simulation",
        firmwareVersion: "1.0.0-ino"
      }
    ]);

    // 5. Create Baseline Soil Profiles
    const profile1 = await SoilProfile.create({
      profileId: "PROF_PUNJAB_01",
      owner: user._id,
      plotId: "PLOT_001",
      soilTypeId: alluvialSoil ? alluvialSoil._id : null,
      soilTypeName: "Alluvial Soil",
      location: {
        state: "Punjab",
        district: "Ludhiana",
        village: "Jagraon",
        plotName: "North Farm - Block A"
      },
      baselineValues: {
        pH: 7.2,
        moisture: 48,
        nitrogen: 110,
        phosphorus: 55,
        potassium: 45,
        texture: "Loam",
        organicMatter: 1.1
      },
      metadata: {
        notes: "Well aerated alluvial soil with excellent tillering capacity.",
        verifiedByLab: true,
        labReportNumber: "PAU-SOIL-2026-9921"
      }
    });

    const profile2 = await SoilProfile.create({
      profileId: "PROF_MP_02",
      owner: user._id,
      plotId: "PLOT_002",
      soilTypeId: blackSoil ? blackSoil._id : null,
      soilTypeName: "Black Soil",
      location: {
        state: "Madhya Pradesh",
        district: "Indore",
        village: "Sanwer",
        plotName: "South Farm - Block B"
      },
      baselineValues: {
        pH: 7.8,
        moisture: 42,
        nitrogen: 85,
        phosphorus: 48,
        potassium: 65,
        texture: "Clay Loam",
        organicMatter: 0.8
      },
      metadata: {
        notes: "Deep black basaltic soil, high moisture buffer.",
        verifiedByLab: true,
        labReportNumber: "JNKVV-SOIL-2026-4412"
      }
    });

    // 6. Create Historical Soil Tests
    const test1 = await SoilTest.create({
      testId: "TEST_20261101_001",
      plotId: "PLOT_001",
      deviceId: "DEVICE_001",
      selectedCropId: wheat ? wheat._id : null,
      selectedCropName: "Wheat",
      testKind: "crop_specific",
      values: {
        moisture: 48.5,
        temperature: 20.4,
        pH: 7.1,
        nitrogen: 115,
        phosphorus: 52,
        potassium: 46,
        texture: "Loam",
        organicMatter: 1.1
      },
      parameterSources: {
        moisture: "simulation",
        temperature: "simulation",
        pH: "manual_lab",
        nitrogen: "manual_lab",
        phosphorus: "manual_lab",
        potassium: "manual_lab",
        texture: "user_provided"
      },
      overallSource: "simulation",
      location: {
        state: "Punjab",
        district: "Ludhiana",
        village: "Jagraon",
        plotName: "North Farm - Block A"
      },
      dataCompleteness: {
        score: 100,
        isComplete: true,
        availableCount: 7,
        totalExpected: 7,
        missingFields: []
      },
      analysisStatus: "completed",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000)
    });

    // Link test to profile
    profile1.historicalTestRefs.push(test1._id);
    await profile1.save();

    console.log('[Seed Success] Created sample Users, Plots, Devices, Profiles, and Historical Tests.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed profiles:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedSoilProfiles();
}

module.exports = seedSoilProfiles;
