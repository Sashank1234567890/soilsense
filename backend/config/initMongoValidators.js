async function applyMongoSchemaValidators(db) {
  try {
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map(c => c.name);

    if (!existingNames.includes('sensor_readings')) {
      await db.createCollection('sensor_readings');
    }
    await db.command({
      collMod: 'sensor_readings',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['deviceId', 'plotId', 'rawValue', 'moisturePercentage', 'source', 'ingestionId'],
          properties: {
            deviceId: { bsonType: 'string', description: 'Unique device identifier string' },
            plotId: { bsonType: 'string', description: 'Target plot identifier string' },
            rawValue: { bsonType: 'number', minimum: 0, maximum: 1023, description: 'ADC reading (0-1023)' },
            moisturePercentage: { bsonType: 'number', minimum: 0, maximum: 100, description: 'Calibrated moisture %' },
            source: { enum: ['hardware', 'simulation'], description: 'Origin of reading' },
            ingestionId: { bsonType: 'string', description: 'Unique ingestion UUID for idempotency' }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    });

    if (!existingNames.includes('soil_tests')) {
      await db.createCollection('soil_tests');
    }
    await db.command({
      collMod: 'soil_tests',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['testId', 'testKind', 'overallSource'],
          properties: {
            testId: { bsonType: 'string', description: 'Unique test ID' },
            testKind: { enum: ['general', 'crop_specific', 'manual_lab', 'simulation', 'hardware'] },
            overallSource: { enum: ['hardware', 'simulation', 'manual_lab', 'composite'] }
          }
        }
      },
      validationLevel: 'moderate'
    });

    console.log('[SoilSense DBMS] MongoDB Native JSON Schema validators successfully applied.');
  } catch (err) {
    console.warn('[SoilSense DBMS Warning] Could not apply collMod validators:', err.message);
  }
}

module.exports = applyMongoSchemaValidators;
