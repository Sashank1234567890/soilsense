const Joi = require('joi');

const sensorReadingSchema = Joi.object({
  deviceId: Joi.string().trim().required(),
  plotId: Joi.string().trim().required(),
  rawValue: Joi.number().min(0).max(1023).required(),
  moisturePercentage: Joi.number().min(0).max(100).required(),
  temperature: Joi.number().min(-20).max(70).allow(null).optional(),
  timestamp: Joi.date().iso().optional().default(() => new Date()),
  source: Joi.string().valid('hardware', 'simulation').required(),
  ingestionId: Joi.string().trim().required(),
  metadata: Joi.object().optional()
});

const soilTestSchema = Joi.object({
  plotId: Joi.string().trim().default('PLOT_001'),
  deviceId: Joi.string().trim().allow('', null).optional(),
  selectedCropId: Joi.string().hex().length(24).allow('', null).optional(),
  testKind: Joi.string().valid('general', 'crop_specific', 'manual_lab', 'simulation', 'hardware').default('general'),
  overallSource: Joi.string().valid('hardware', 'simulation', 'manual_lab', 'composite').default('simulation'),
  values: Joi.object({
    moisture: Joi.number().min(0).max(100).allow(null).optional(),
    temperature: Joi.number().min(-10).max(60).allow(null).optional(),
    pH: Joi.number().min(1).max(14).allow(null).optional(),
    nitrogen: Joi.number().min(0).max(1000).allow(null).optional(),
    phosphorus: Joi.number().min(0).max(500).allow(null).optional(),
    potassium: Joi.number().min(0).max(1000).allow(null).optional(),
    texture: Joi.string().trim().allow('', null).optional(),
    organicMatter: Joi.number().min(0).max(20).allow(null).optional(),
    electricalConductivity: Joi.number().allow(null).optional(),
    plotId: Joi.string().trim().allow('', null).optional()
  }).unknown(true).required(),
  parameterSources: Joi.object().optional(),
  location: Joi.object({
    state: Joi.string().trim().allow('', null).optional(),
    district: Joi.string().trim().allow('', null).optional(),
    village: Joi.string().trim().allow('', null).optional(),
    plotName: Joi.string().trim().allow('', null).optional()
  }).optional()
});

const cropSpecificRecommendationSchema = Joi.object({
  soilTestId: Joi.string().hex().length(24).required(),
  cropId: Joi.string().hex().length(24).required()
});

const generalRecommendationSchema = Joi.object({
  soilTestId: Joi.string().hex().length(24).required()
});

const soilImprovementSchema = Joi.object({
  soilTestId: Joi.string().hex().length(24).required(),
  targetCropId: Joi.string().hex().length(24).allow('', null).optional()
});

const deviceSchema = Joi.object({
  deviceId: Joi.string().trim().uppercase().required(),
  name: Joi.string().trim().required(),
  plotId: Joi.string().trim().uppercase().required(),
  hardwareModel: Joi.string().default('Arduino Uno + Capacitive Moisture V1.2'),
  calibration: Joi.object({
    dryADC: Joi.number().default(820),
    wetADC: Joi.number().default(350)
  }).optional(),
  source: Joi.string().valid('hardware', 'simulation').default('simulation')
});

module.exports = {
  sensorReadingSchema,
  soilTestSchema,
  cropSpecificRecommendationSchema,
  generalRecommendationSchema,
  soilImprovementSchema,
  deviceSchema
};
