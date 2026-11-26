const SoilType = require('../models/SoilType');

async function classifySoil(testValues, paramSources) {

  const hasTexture = Boolean(testValues.texture && testValues.texture.trim() !== '');
  const hasPH = Boolean(testValues.pH !== undefined && testValues.pH !== null);

  if (!hasTexture && !hasPH) {
    return {
      classifiedType: 'Unclassified / Physical Measurement Only',
      isReliable: false,
      scientificHonestyNote: 'Additional soil testing required for reliable classification. In-situ capacitive sensors measure volumetric moisture content and soil temperature only; geological soil classification requires texture or laboratory wet chemistry analysis.',
      matchingTypes: [],
      fertilityCategory: 'Pending Laboratory Analysis'
    };
  }

  const query = {};
  if (hasPH) {
    query['typicalPH.min'] = { $lte: testValues.pH };
    query['typicalPH.max'] = { $gte: testValues.pH };
  }
  if (hasTexture) {
    query.texture = { $regex: new RegExp(testValues.texture, 'i') };
  }

  let candidates = await SoilType.find(query);

  if (candidates.length === 0) {

    candidates = await SoilType.find({
      'typicalPH.min': { $lte: testValues.pH || 7.0 },
      'typicalPH.max': { $gte: testValues.pH || 7.0 }
    });
  }

  const primary = candidates[0] || null;

  return {
    classifiedType: primary ? primary.name : 'Atypical Soil Specimen',
    classification: primary ? primary.classification : 'Undetermined',
    texture: testValues.texture || primary?.texture[0] || 'Unknown',
    fertilityCategory: primary?.nutrientCharacteristics?.organicCarbon ? `Organic Carbon: ${primary.nutrientCharacteristics.organicCarbon}` : 'Moderate',
    drainage: primary ? primary.drainage : 'Moderate',
    characteristics: primary ? primary.characteristics : ['Classification tentative based on partial laboratory inputs.'],
    isReliable: Boolean(hasTexture && hasPH),
    scientificHonestyNote: hasTexture
      ? 'Classification correlates user/laboratory-provided texture and pH with ICAR benchmark soil series.'
      : 'Tentative classification based on pH only. Mechanical laboratory texture analysis (sand/silt/clay hydrometer test) is recommended for definitive classification.',
    matchingTypes: candidates.map(c => c.name)
  };
}

module.exports = {
  classifySoil
};
