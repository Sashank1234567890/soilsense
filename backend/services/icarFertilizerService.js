const FertilizerPrescription = require('../models/FertilizerPrescription');

function calculateFertilizerPrescription({ plotId, cropName = 'Wheat', cropStage = 'VEGETATIVE', soilNPK = {} }) {
  const stage = (cropStage || 'VEGETATIVE').toUpperCase();

  let chemicalDosage = [];
  let organicAlternatives = [];

  const lowerCrop = (cropName || 'Wheat').toLowerCase();

  if (lowerCrop.includes('wheat')) {
    if (stage === 'GERMINATION' || stage === 'BASAL') {
      chemicalDosage = [
        { fertilizerName: 'DAP (Di-Ammonium Phosphate)', quantityKgPerAcre: 55, applicationMethod: 'Basal Placement at drilling', timing: 'At Sowing' },
        { fertilizerName: 'Urea (46% N)', quantityKgPerAcre: 25, applicationMethod: 'Broadcasting', timing: 'At Sowing' },
        { fertilizerName: 'MOP (Muriate of Potash)', quantityKgPerAcre: 20, applicationMethod: 'Basal Placement', timing: 'At Sowing' }
      ];
      organicAlternatives = [
        { amendmentName: 'Well-decomposed Farmyard Manure (FYM)', quantityKgPerAcre: 2000, soilHealthBenefit: 'Improves soil water-holding capacity and structure' },
        { amendmentName: 'Azotobacter & PSB Bio-fertilizer', quantityKgPerAcre: 2, soilHealthBenefit: 'Fixes atmospheric nitrogen & solubilizes fixed soil phosphorus' }
      ];
    } else if (stage === 'VEGETATIVE') {
      chemicalDosage = [
        { fertilizerName: 'Urea (46% N)', quantityKgPerAcre: 35, applicationMethod: 'Top Dressing after 1st Irrigation', timing: '21-25 Days After Sowing (Crown Root Initiation)' }
      ];
      organicAlternatives = [
        { amendmentName: 'Vermicompost', quantityKgPerAcre: 500, soilHealthBenefit: 'Provides humic acid and steady organic nitrogen release' },
        { amendmentName: 'Neem Cake (Coated / Crushed)', quantityKgPerAcre: 100, soilHealthBenefit: 'Acts as nitrification inhibitor, reducing N-leaching by 25%' }
      ];
    } else if (stage === 'FLOWERING' || stage === 'GRAIN_FORMATION') {
      chemicalDosage = [
        { fertilizerName: 'Water Soluble NPK (0:52:34 / MOP foliar)', quantityKgPerAcre: 2.5, applicationMethod: 'Foliar Spray in 150L water', timing: 'Flag Leaf / Heading stage' }
      ];
      organicAlternatives = [
        { amendmentName: 'Panchagavya (3% Foliar Solution)', quantityKgPerAcre: 5, soilHealthBenefit: 'Boosts plant immunity and grain weight' }
      ];
    } else {
      chemicalDosage = [
        { fertilizerName: 'No Chemical Top Dressing Required', quantityKgPerAcre: 0, applicationMethod: 'None', timing: 'Maturation / Dough stage' }
      ];
      organicAlternatives = [];
    }
  } else if (lowerCrop.includes('mustard')) {
    chemicalDosage = [
      { fertilizerName: 'Single Super Phosphate (SSP - 16% P2O5, 11% Sulphur)', quantityKgPerAcre: 75, applicationMethod: 'Basal', timing: 'Sowing' },
      { fertilizerName: 'Urea (46% N)', quantityKgPerAcre: 30, applicationMethod: 'Split top dressing', timing: '30 Days After Sowing' }
    ];
    organicAlternatives = [
      { amendmentName: 'Gypsum / Elemental Sulphur (Agricultural Grade)', quantityKgPerAcre: 50, soilHealthBenefit: 'Enhances mustard oil percentage' }
    ];
  } else {
    chemicalDosage = [
      { fertilizerName: 'Urea (46% N)', quantityKgPerAcre: 35, applicationMethod: 'Broadcast', timing: 'Active Vegetative Growth' },
      { fertilizerName: 'DAP', quantityKgPerAcre: 40, applicationMethod: 'Basal Placement', timing: 'Sowing' }
    ];
    organicAlternatives = [
      { amendmentName: 'Vermicompost', quantityKgPerAcre: 400, soilHealthBenefit: 'Organic humus conditioning' }
    ];
  }

  return {
    plotId,
    cropName,
    cropStage: stage,
    soilNPK: {
      nitrogen_kg_ha: soilNPK.nitrogen || 240,
      phosphorus_kg_ha: soilNPK.phosphorus || 18,
      potassium_kg_ha: soilNPK.potassium || 180,
      pH: soilNPK.pH || 7.2,
      organicCarbonPercent: soilNPK.organicCarbon || 0.55
    },
    chemicalDosage,
    organicAlternatives
  };
}

module.exports = { calculateFertilizerPrescription };
