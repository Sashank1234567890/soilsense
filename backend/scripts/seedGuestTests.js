const mongoose = require('mongoose');
const SoilTest = require('../models/SoilTest');
const CropRecommendation = require('../models/CropRecommendation');
const AnalysisReport = require('../models/AnalysisReport');
const Crop = require('../models/Crop');

async function seedGuestTests() {
  await mongoose.connect('mongodb://127.0.0.1:27017/soilsense?directConnection=true');
  console.log('[SeedGuestTests] Connected to MongoDB');

  // Find demo users
  const users = await mongoose.connection.collection('users').find({
    email: { $in: ['farmer@soilsense.in', 'agronomist@soilsense.in', 'student@nitdelhi.ac.in'] }
  }).toArray();

  const userMap = {};
  users.forEach(u => { userMap[u.email] = u._id; });

  if (!userMap['farmer@soilsense.in'] || !userMap['agronomist@soilsense.in'] || !userMap['student@nitdelhi.ac.in']) {
    console.error('Demo users not found. Please ensure demo profiles exist.');
    await mongoose.disconnect();
    return;
  }

  // Clear existing tests for these users
  const demoIds = Object.values(userMap);
  await SoilTest.deleteMany({ userId: { $in: demoIds } });
  await CropRecommendation.deleteMany({});
  await AnalysisReport.deleteMany({});

  const wheat = await Crop.findOne({ name: /Wheat/i });
  const mustard = await Crop.findOne({ name: /Mustard/i });
  const rice = await Crop.findOne({ name: /Rice|Paddy/i });
  const maize = await Crop.findOne({ name: /Maize/i });

  const guestData = [
    // 1. Farmer Guest Tests
    {
      testId: 'TEST_DEMO_FARMER_01',
      userId: userMap['farmer@soilsense.in'],
      plotId: 'Field Block A',
      selectedCropId: wheat?._id,
      selectedCropName: wheat?.name || 'Wheat',
      testKind: 'crop_specific',
      values: {
        moisture: 26,
        temperature: 23.5,
        pH: 6.8,
        nitrogen: 280,
        phosphorus: 42,
        potassium: 210,
        organicCarbon: 0.65,
        electricalConductivity: 0.42,
        texture: 'Loam'
      },
      parameterSources: {
        moisture: 'simulation',
        temperature: 'simulation',
        pH: 'simulation',
        nitrogen: 'simulation',
        phosphorus: 'simulation',
        potassium: 'simulation',
        organicCarbon: 'simulation',
        electricalConductivity: 'simulation'
      },
      overallSource: 'simulation',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Jagraon',
        plotName: 'Field Block A'
      },
      dataCompleteness: 100,
      analysisStatus: 'completed',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2)
    },
    {
      testId: 'TEST_DEMO_FARMER_02',
      userId: userMap['farmer@soilsense.in'],
      plotId: 'Mustard Plot B',
      selectedCropId: mustard?._id,
      selectedCropName: mustard?.name || 'Mustard',
      testKind: 'crop_specific',
      values: {
        moisture: 21,
        temperature: 22.0,
        pH: 7.1,
        nitrogen: 240,
        phosphorus: 36,
        potassium: 195,
        organicCarbon: 0.58,
        electricalConductivity: 0.38,
        texture: 'Sandy Loam'
      },
      parameterSources: {
        moisture: 'simulation',
        temperature: 'simulation',
        pH: 'simulation',
        nitrogen: 'simulation',
        phosphorus: 'simulation',
        potassium: 'simulation'
      },
      overallSource: 'simulation',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Jagraon',
        plotName: 'Mustard Plot B'
      },
      dataCompleteness: 100,
      analysisStatus: 'completed',
      timestamp: new Date(Date.now() - 3600000 * 12)
    },

    // 2. Agronomist Guest Tests
    {
      testId: 'TEST_DEMO_AGRONOMIST_01',
      userId: userMap['agronomist@soilsense.in'],
      plotId: 'Research Sector North',
      selectedCropId: rice?._id,
      selectedCropName: rice?.name || 'Rice (Paddy)',
      testKind: 'crop_specific',
      values: {
        moisture: 34,
        temperature: 25.0,
        pH: 7.8,
        nitrogen: 310,
        phosphorus: 48,
        potassium: 250,
        organicCarbon: 0.72,
        electricalConductivity: 0.55,
        texture: 'Clay Loam'
      },
      parameterSources: {
        moisture: 'simulation',
        temperature: 'simulation',
        pH: 'simulation',
        nitrogen: 'simulation',
        phosphorus: 'simulation',
        potassium: 'simulation'
      },
      overallSource: 'simulation',
      location: {
        state: 'Haryana',
        district: 'Karnal',
        village: 'Nilokheri',
        plotName: 'Research Sector North'
      },
      dataCompleteness: 100,
      analysisStatus: 'completed',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3)
    },

    // 3. Student Guest Tests (NIT Delhi)
    {
      testId: 'TEST_DEMO_STUDENT_01',
      userId: userMap['student@nitdelhi.ac.in'],
      plotId: 'Campus Agri-Lab Zone',
      selectedCropId: maize?._id,
      selectedCropName: maize?.name || 'Maize',
      testKind: 'crop_specific',
      values: {
        moisture: 28,
        temperature: 24.1,
        pH: 6.9,
        nitrogen: 275,
        phosphorus: 39,
        potassium: 220,
        organicCarbon: 0.62,
        electricalConductivity: 0.40,
        texture: 'Loam'
      },
      parameterSources: {
        moisture: 'simulation',
        temperature: 'simulation',
        pH: 'simulation',
        nitrogen: 'simulation',
        phosphorus: 'simulation',
        potassium: 'simulation'
      },
      overallSource: 'simulation',
      location: {
        state: 'Delhi',
        district: 'North Delhi',
        village: 'Bakoli',
        plotName: 'Campus Agri-Lab Zone'
      },
      dataCompleteness: 100,
      analysisStatus: 'completed',
      timestamp: new Date(Date.now() - 3600000 * 6)
    }
  ];

  for (const item of guestData) {
    const createdTest = await SoilTest.create(item);
    
    // Create CropRecommendation matching singleCropRecommendationSchema
    await CropRecommendation.create({
      soilTestId: createdTest._id,
      selectedCropId: item.selectedCropId,
      evaluationType: 'crop_specific',
      dataCompletenessPercent: 100,
      isDataSufficient: true,
      overallSuitability: 'Suitable',
      suitabilityScore: 88,
      recommendations: [
        {
          cropId: item.selectedCropId,
          cropName: item.selectedCropName,
          suitabilityLevel: 'Highly Suitable',
          suitabilityScore: 88,
          parameterComparisons: [
            {
              parameter: 'pH',
              measuredValue: item.values.pH,
              requiredRange: '6.0 - 7.5',
              optimalRange: '6.5 - 7.2',
              status: 'Optimal',
              source: 'measured'
            },
            {
              parameter: 'Moisture',
              measuredValue: item.values.moisture,
              requiredRange: '20% - 35%',
              optimalRange: '25% - 30%',
              status: 'Optimal',
              source: 'measured'
            }
          ],
          matchingParameters: ['pH', 'Moisture', 'Nitrogen', 'Potassium'],
          deficientParameters: [],
          excessiveParameters: [],
          missingParameters: [],
          explanation: `Optimal pH (${item.values.pH}) and balanced NPK fertility profile support peak vegetative growth.`,
          improvementSuggestions: ['Maintain regular moisture monitoring via Pin A0 probe']
        }
      ],
      createdAt: item.timestamp
    });

    // Create AnalysisReport
    await AnalysisReport.create({
      reportId: `REP_${createdTest.testId}`,
      soilTestId: createdTest._id,
      plotId: item.plotId,
      summary: `Automated analytical evaluation for ${item.plotId} indicating healthy soil structure and high crop yield potential.`,
      sections: {
        soilCondition: {
          moisture: { value: item.values.moisture, source: 'simulation', status: 'Optimal' },
          temperature: { value: item.values.temperature, source: 'simulation', status: 'Optimal' },
          pH: { value: item.values.pH, source: 'simulation', status: 'Optimal' },
          nitrogen: { value: item.values.nitrogen, source: 'simulation', status: 'Optimal' },
          phosphorus: { value: item.values.phosphorus, source: 'simulation', status: 'Optimal' },
          potassium: { value: item.values.potassium, source: 'simulation', status: 'Optimal' }
        },
        geographicContext: {
          state: item.location.state,
          district: item.location.district,
          village: item.location.village,
          plotName: item.location.plotName
        }
      },
      generatedAt: item.timestamp
    });
  }

  console.log(`[SeedGuestTests] Successfully seeded ${guestData.length} demo tests across 3 guest profiles.`);
  await mongoose.disconnect();
}

seedGuestTests().catch(err => {
  console.error('[SeedGuestTests] Error:', err);
  process.exit(1);
});
