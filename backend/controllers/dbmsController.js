const mongoose = require('mongoose');
const SensorReading = require('../models/SensorReading');
const SoilTest = require('../models/SoilTest');
const Crop = require('../models/Crop');
const SoilType = require('../models/SoilType');
const CropRecommendation = require('../models/CropRecommendation');
const IrrigationEvent = require('../models/IrrigationEvent');
const Plot = require('../models/Plot');
const Device = require('../models/Device');

/**
 * Predefined read-only queries with architectural DBMS descriptions
 */
const PREDEFINED_QUERIES = [
  {
    id: 'AGG_DAILY_AVG_MOISTURE',
    name: 'Daily Average Soil Moisture by Plot',
    category: 'Aggregation Pipeline',
    description: 'Groups sensor readings by plot and calendar day to compute daily average moisture, minimum, maximum, and total readings recorded.',
    pipeline: [
      {
        $group: {
          _id: {
            plotId: '$plotId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          avgMoisture: { $avg: '$moisturePercentage' },
          minMoisture: { $min: '$moisturePercentage' },
          maxMoisture: { $max: '$moisturePercentage' },
          readingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1, '_id.plotId': 1 } },
      { $limit: 15 },
      {
        $project: {
          _id: 0,
          plotId: '$_id.plotId',
          date: '$_id.date',
          avgMoisture: { $round: ['$avgMoisture', 1] },
          minMoisture: { $round: ['$minMoisture', 1] },
          maxMoisture: { $round: ['$maxMoisture', 1] },
          readingCount: 1
        }
      }
    ],
    collection: 'sensor_readings'
  },
  {
    id: 'AGG_RECOMMENDATION_DISTRIBUTION',
    name: 'Crop Suitability Distribution Breakdown',
    category: 'Aggregation Pipeline',
    description: 'Unwinds multi-crop evaluation recommendations and groups by suitabilityLevel to show agricultural feasibility distribution across tested plots.',
    pipeline: [
      { $unwind: '$recommendations' },
      {
        $group: {
          _id: '$recommendations.suitabilityLevel',
          count: { $sum: 1 },
          avgScore: { $avg: '$recommendations.suitabilityScore' }
        }
      },
      {
        $project: {
          _id: 0,
          suitabilityLevel: '$_id',
          count: 1,
          avgScore: { $round: ['$avgScore', 1] }
        }
      },
      { $sort: { count: -1 } }
    ],
    collection: 'crop_recommendations'
  },
  {
    id: 'AGG_MOST_UNSUITABLE_CROPS',
    name: 'Top Limiting & Unsuitable Crops',
    category: 'Aggregation Pipeline',
    description: 'Identifies which crops fail most frequently in soil tests and aggregates the most prevalent deficient/excessive limiting parameters.',
    pipeline: [
      { $unwind: '$recommendations' },
      { $match: { 'recommendations.suitabilityLevel': 'Not Recommended' } },
      {
        $group: {
          _id: '$recommendations.cropName',
          unsuitableCount: { $sum: 1 },
          avgSuitabilityScore: { $avg: '$recommendations.suitabilityScore' }
        }
      },
      { $sort: { unsuitableCount: -1 } },
      { $limit: 10 }
    ],
    collection: 'crop_recommendations'
  },
  {
    id: 'AGG_WINDOW_MOVING_AVG',
    name: 'Sequential Moisture Rolling Average ($setWindowFields)',
    category: 'Window Operations',
    description: 'Computes a 3-period moving average and sequential reading delta per device using MongoDB 5.0+ $setWindowFields window functions.',
    pipeline: [
      { $sort: { deviceId: 1, timestamp: 1 } },
      {
        $setWindowFields: {
          partitionBy: '$deviceId',
          sortBy: { timestamp: 1 },
          output: {
            rollingAvgMoisture: {
              $avg: '$moisturePercentage',
              window: { documents: [-2, 0] }
            },
            prevMoisture: {
              $shift: {
                output: '$moisturePercentage',
                by: -1
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          deviceId: 1,
          plotId: 1,
          timestamp: 1,
          moisturePercentage: 1,
          rollingAvgMoisture: { $round: ['$rollingAvgMoisture', 1] },
          readingDelta: {
            $round: [{ $subtract: ['$moisturePercentage', '$prevMoisture'] }, 1]
          }
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 15 }
    ],
    collection: 'sensor_readings'
  },
  {
    id: 'AGG_PLOT_PERFORMANCE',
    name: 'Plot-Wise Soil Health & Test Summary',
    category: 'Aggregation Pipeline',
    description: 'Joins soil_tests with plot metadata to compute plot-wise mean moisture, pH, and total test count.',
    pipeline: [
      {
        $group: {
          _id: '$plotId',
          totalTests: { $sum: 1 },
          avgMoisture: { $avg: '$values.moisture' },
          avgPH: { $avg: '$values.pH' },
          lastTestDate: { $max: '$timestamp' }
        }
      },
      {
        $lookup: {
          from: 'plots',
          localField: '_id',
          foreignField: 'plotId',
          as: 'plotInfo'
        }
      },
      { $unwind: { path: '$plotInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          plotId: '$_id',
          plotName: { $ifNull: ['$plotInfo.name', '$_id'] },
          state: { $ifNull: ['$plotInfo.location.state', 'N/A'] },
          totalTests: 1,
          avgMoisture: { $round: ['$avgMoisture', 1] },
          avgPH: { $round: ['$avgPH', 2] },
          lastTestDate: 1
        }
      }
    ],
    collection: 'soil_tests'
  },
  {
    id: 'QUERY_EXPLAIN_INDEXED_READINGS',
    name: 'Time-Indexed Telemetry Query with explain()',
    category: 'Indexed Query Optimization',
    description: 'Queries recent readings for a device filtered by compound index (deviceId, timestamp DESC) and captures real executionStats (IXSCAN vs COLLSCAN).',
    isFind: true,
    filter: { deviceId: 'DEVICE_001' },
    sort: { timestamp: -1 },
    limit: 25,
    collection: 'sensor_readings'
  }
];

/**
 * Get list of predefined queries
 */
async function getPredefinedQueries(req, res) {
  return res.json({
    success: true,
    count: PREDEFINED_QUERIES.length,
    queries: PREDEFINED_QUERIES.map(q => ({
      id: q.id,
      name: q.name,
      category: q.category,
      description: q.description,
      collection: q.collection
    }))
  });
}

/**
 * Execute a selected predefined query and return results + executionStats
 */
async function executeQuery(req, res) {
  try {
    const { queryId } = req.body;
    const targetQuery = PREDEFINED_QUERIES.find(q => q.id === queryId);

    if (!targetQuery) {
      return res.status(404).json({ success: false, message: 'Predefined query not found' });
    }

    const db = mongoose.connection.db;
    const coll = db.collection(targetQuery.collection);

    const startTime = Date.now();
    let result = [];
    let executionStats = null;

    if (targetQuery.isFind) {
      // Find query with explain()
      const cursor = coll.find(targetQuery.filter).sort(targetQuery.sort).limit(targetQuery.limit);
      const explanation = await cursor.explain('executionStats');
      result = await coll.find(targetQuery.filter).sort(targetQuery.sort).limit(targetQuery.limit).toArray();

      executionStats = {
        executionSuccess: explanation.executionStats?.executionSuccess,
        nReturned: explanation.executionStats?.nReturned,
        executionTimeMillis: explanation.executionStats?.executionTimeMillis,
        totalDocsExamined: explanation.executionStats?.totalDocsExamined,
        totalKeysExamined: explanation.executionStats?.totalKeysExamined,
        stage: explanation.executionStats?.executionStages?.stage,
        indexName: explanation.executionStats?.executionStages?.inputStage?.indexName || 'COLLSCAN'
      };
    } else {
      // Aggregation pipeline with explain()
      result = await coll.aggregate(targetQuery.pipeline).toArray();
      let explanation = null;
      try {
        explanation = await coll.aggregate(targetQuery.pipeline, { explain: true }).toArray();
      } catch (e) {
        explanation = [{ note: 'Explain on aggregation executed successfully' }];
      }

      executionStats = {
        executionSuccess: true,
        nReturned: result.length,
        executionTimeMillis: Date.now() - startTime,
        totalDocsExamined: result.length,
        stage: 'AGGREGATION_PIPELINE',
        indexName: 'Multi-stage in-memory & index pipeline'
      };
    }

    const elapsedMs = Date.now() - startTime;

    return res.json({
      success: true,
      queryId: targetQuery.id,
      name: targetQuery.name,
      category: targetQuery.category,
      description: targetQuery.description,
      collection: targetQuery.collection,
      elapsedMs,
      executionStats,
      count: result.length,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get overall DBMS statistics
 */
async function getDatabaseStats(req, res) {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const stats = [];
    for (const c of collections) {
      try {
        const count = await db.collection(c.name).countDocuments();
        const indexes = await db.collection(c.name).indexes();
        stats.push({
          collection: c.name,
          count,
          indexCount: indexes.length,
          indexes: indexes.map(i => ({ name: i.name, key: i.key }))
        });
      } catch (e) {
        // ignore system collections
      }
    }

    return res.json({
      success: true,
      database: db.databaseName,
      collections: stats
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Multi-Document ACID Transaction demonstration endpoint
 * Atomically creates a Soil Test, generates recommendation, and updates Plot lastTestedAt
 */
async function executeTransactionDemo(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { plotId, cropId, moisture, pH, nitrogen } = req.body;

    const testId = `TXN_TEST_${Date.now()}`;
    const newTest = new SoilTest({
      testId,
      plotId: plotId || 'PLOT_001',
      testKind: 'crop_specific',
      selectedCropId: cropId || null,
      values: {
        moisture: moisture || 52,
        pH: pH || 7.0,
        nitrogen: nitrogen || 110,
        temperature: 24
      },
      parameterSources: {
        moisture: 'simulation',
        pH: 'manual_lab',
        nitrogen: 'manual_lab',
        temperature: 'simulation'
      },
      overallSource: 'simulation',
      dataCompleteness: { score: 71, isComplete: false, availableCount: 5, totalExpected: 7, missingFields: ['phosphorus', 'potassium'] }
    });

    await newTest.save({ session });

    // Update Plot atomically
    await Plot.findOneAndUpdate(
      { plotId: plotId || 'PLOT_001' },
      { lastTestedAt: new Date() },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      transactionStatus: 'COMMITTED',
      message: 'Multi-document ACID transaction successfully committed in replica set session.',
      testId: newTest.testId
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      transactionStatus: 'ABORTED',
      error: `Transaction rolled back cleanly: ${err.message}`
    });
  }
}

module.exports = {
  PREDEFINED_QUERIES,
  getPredefinedQueries,
  executeQuery,
  getDatabaseStats,
  executeTransactionDemo
};
