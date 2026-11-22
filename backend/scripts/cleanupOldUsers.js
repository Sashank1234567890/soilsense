const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Plot = require('../models/Plot');
const SoilTest = require('../models/SoilTest');
const AnalysisReport = require('../models/AnalysisReport');
const CropRecommendation = require('../models/CropRecommendation');
const SoilImprovementPlan = require('../models/SoilImprovementPlan');

dotenv.config();

const OFFICIAL_DEMO_EMAILS = [
  'farmer@soilsense.in',
  'agronomist@soilsense.in',
  'student@nitdelhi.ac.in'
];

async function cleanupOldUsers() {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?replicaSet=rs0';
    await mongoose.connect(connStr);
    console.log('[Cleanup] Connected to MongoDB.');

    // Find all users created by the user / tests (not the official 3 demo accounts)
    const oldUsers = await User.find({ email: { $nin: OFFICIAL_DEMO_EMAILS } });
    console.log(`Found ${oldUsers.length} user-created accounts to delete:`);

    const userIdsToDelete = oldUsers.map(u => u._id);

    for (const u of oldUsers) {
      console.log(` - Deleting: ${u.name} (${u.email}) [ID: ${u._id}]`);
    }

    if (userIdsToDelete.length > 0) {
      // Find soil tests for these users
      const userTests = await SoilTest.find({ userId: { $in: userIdsToDelete } });
      const testIds = userTests.map(t => t._id);

      // Clean up child collections
      const delReports = await AnalysisReport.deleteMany({ soilTestId: { $in: testIds } });
      const delRecs = await CropRecommendation.deleteMany({ soilTestId: { $in: testIds } });
      const delPlans = await SoilImprovementPlan.deleteMany({ soilTestId: { $in: testIds } });
      const delTests = await SoilTest.deleteMany({ _id: { $in: testIds } });
      const delPlots = await Plot.deleteMany({ owner: { $in: userIdsToDelete } });
      const delUsers = await User.deleteMany({ _id: { $in: userIdsToDelete } });

      console.log('\n[Cleanup Summary]:');
      console.log(` - Deleted Users: ${delUsers.deletedCount}`);
      console.log(` - Deleted Soil Tests: ${delTests.deletedCount}`);
      console.log(` - Deleted Reports: ${delReports.deletedCount}`);
      console.log(` - Deleted Crop Recommendations: ${delRecs.deletedCount}`);
      console.log(` - Deleted Improvement Plans: ${delPlans.deletedCount}`);
      console.log(` - Deleted Plots: ${delPlots.deletedCount}`);
    } else {
      console.log('No old user-created accounts found to delete.');
    }

    // List remaining official accounts
    const remainingUsers = await User.find({});
    console.log('\n[Remaining Active Accounts]:');
    remainingUsers.forEach(u => {
      console.log(` ✓ ${u.role.toUpperCase()}: ${u.name} (${u.email})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('[Cleanup Error]:', err);
    process.exit(1);
  }
}

cleanupOldUsers();
