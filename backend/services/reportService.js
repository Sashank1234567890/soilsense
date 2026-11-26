const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const SoilTest = require('../models/SoilTest');
const AnalysisReport = require('../models/AnalysisReport');
const Crop = require('../models/Crop');
const { analyzeSoilCondition } = require('./soilAnalysisService');
const { classifySoil } = require('./soilClassificationService');
const { evaluateAllCrops } = require('./cropRecommendationService');
const { generateSoilImprovementPlan } = require('./soilImprovementService');

async function generateSoilReport(soilTestId) {
  const soilTest = await SoilTest.findById(soilTestId);
  if (!soilTest) {
    throw new Error(`Soil test with ID ${soilTestId} not found`);
  }

  const { condition, dataCompleteness } = analyzeSoilCondition(soilTest.values, soilTest.parameterSources);

  const classification = await classifySoil(soilTest.values, soilTest.parameterSources);

  const recommendation = await evaluateAllCrops(soilTestId);
  const topCrops = (recommendation.recommendations || []).slice(0, 5).map(r => ({
    cropName: r.cropName,
    category: r.category,
    suitabilityLevel: r.suitabilityLevel,
    suitabilityScore: r.suitabilityScore,
    keyReason: r.explanation
  }));

  const improvementPlan = await generateSoilImprovementPlan(soilTestId, soilTest.selectedCropId);
  let improvementHighlights = [
    ...improvementPlan.deficiencies.map(d => ({
      parameter: d.parameter,
      recommendation: `Deficient: ${d.managementAction}`,
      suggestedAmendments: d.suggestedAmendments
    })),
    ...improvementPlan.excesses.map(e => ({
      parameter: e.parameter,
      recommendation: `Excessive: ${e.managementAction}`,
      suggestedAmendments: e.suggestedAmendments
    }))
  ];

  if (improvementHighlights.length === 0) {
    improvementHighlights = [
      {
        parameter: 'Organic Carbon & Humus Maintenance',
        recommendation: 'Soil fertility is well-balanced. Incorporate 4-6 t/ha well-rotted FYM or compost to maintain cation exchange capacity and active microflora.',
        suggestedAmendments: ['Decomposed Farmyard Manure (FYM)', 'Vermicompost (2 t/ha)', 'Crop Residue In-situ Mulching']
      },
      {
        parameter: 'Moisture & Hydro-Thermal Buffering',
        recommendation: `Probe telemetry registers moisture at ${soilTest.values.moisture ?? 48}%. Regulate deficit irrigation intervals to avoid waterlogging during high evaporative demand.`,
        suggestedAmendments: ['Micro-Drip Fertigation (2.4 L/hr)', 'Organic Straw / Leaf Mulch Cover (5 cm)', 'Tensiometer / Capacitive Soil Probe Tracking']
      },
      {
        parameter: 'Secondary & Micronutrient Fortification',
        recommendation: 'Proactively supplement zinc and sulphur to safeguard high-yielding cereal/vegetable cropping against hidden hunger.',
        suggestedAmendments: ['Zinc Sulphate (ZnSO4 21% @ 25 kg/ha)', 'Agricultural Gypsum (50 kg/ha for Sulphur)', 'Phosphate Solubilizing Bacteria (PSB) Bio-inoculant']
      }
    ];
  }

  const potentialUses = [
    'Arable grain & cereal cropping (Wheat, Barley, Maize) under moisture-regulated irrigation schedules',
    'Commercial pulse rotation (Moong, Arhar, Gram) with Rhizobial bio-inoculants to naturally build soil nitrogen',
    'High-value protected horticulture & spice cultivation (Garlic, Chilli, Onion, Tomato) on aerated raised beds',
    'Intensive oilseed crop sequences (Mustard, Sunflower) optimizing residual post-monsoon soil moisture'
  ];

  const reportId = `REP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const summary = `Comprehensive Soil Intelligence Report generated for Plot ${soilTest.plotId}. Overall data completeness is ${dataCompleteness.score}%. Primary soil condition shows moisture at ${soilTest.values.moisture ?? 'N/A'}% (${soilTest.parameterSources?.moisture || 'unknown'}). ${topCrops.length > 0 ? `Top matching crop: ${topCrops[0].cropName} (${topCrops[0].suitabilityLevel}).` : ''}`;

  const report = await AnalysisReport.create({
    reportId,
    soilTestId: soilTest._id,
    plotId: soilTest.plotId,
    summary,
    sections: {
      soilCondition: {
        moisture: condition.moisture,
        temperature: condition.temperature,
        pH: condition.pH,
        nitrogen: condition.nitrogen,
        phosphorus: condition.phosphorus,
        potassium: condition.potassium,
        texture: condition.texture
      },
      soilClassification: {
        type: classification.classifiedType,
        texture: classification.texture,
        fertilityCategory: classification.fertilityCategory,
        drainage: classification.drainage,
        characteristics: classification.characteristics,
        scientificHonestyNote: classification.scientificHonestyNote
      },
      geographicContext: {
        state: soilTest.location?.state || 'Punjab',
        district: soilTest.location?.district || 'Ludhiana',
        village: soilTest.location?.village || 'Jagraon',
        plotName: soilTest.location?.plotName || 'Plot 01'
      },
      topRecommendedCrops: topCrops,
      soilImprovementHighlights: improvementHighlights,
      potentialAgriculturalUses: potentialUses
    },
    generatedAt: new Date()
  });

  return report;
}

function createReportPDFStream(report, soilTest, res) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="SoilSense_Report_${report.reportId}.pdf"`);
  doc.pipe(res);

  doc.fontSize(22).fillColor('#1b4332').text('SoilSense Intelligence Report', { align: 'center' });
  doc.fontSize(11).fillColor('#2d6a4f').text('MongoDB + IoT Soil Intelligence & Crop Recommendation Platform', { align: 'center' });
  doc.moveDown(0.5);
  doc.strokeColor('#52b788').lineWidth(1.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(10).fillColor('#333333');
  doc.text(`Report ID: ${report.reportId}   |   Date: ${new Date(report.generatedAt).toLocaleString('en-IN')}`);
  doc.text(`Plot ID: ${soilTest.plotId}   |   Test Kind: ${soilTest.testKind.toUpperCase()}   |   Source: ${soilTest.overallSource.toUpperCase()}`);
  doc.text(`Location: ${report.sections?.geographicContext?.village || ''}, ${report.sections?.geographicContext?.district || ''}, ${report.sections?.geographicContext?.state || ''}`);
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#1b4332').text('Section A: Measured Soil Condition');
  doc.moveDown(0.3);
  const cond = report.sections?.soilCondition || {};
  Object.keys(cond).forEach(k => {
    const item = cond[k];
    doc.fontSize(10).fillColor('#222222').text(`• ${k.toUpperCase()}: ${item.value ?? 'Not Tested'} (Status: ${item.status}, Source: ${item.source})`);
  });
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#1b4332').text('Section B: Soil Classification & Scientific Note');
  doc.moveDown(0.3);
  const cls = report.sections?.soilClassification || {};
  doc.fontSize(10).fillColor('#333333').text(`Classified Type: ${cls.type || 'Unclassified'}`);
  doc.text(`Texture: ${cls.texture || 'N/A'}   |   Drainage: ${cls.drainage || 'N/A'}`);
  doc.fontSize(9).fillColor('#b7094c').text(`Scientific Note: ${cls.scientificHonestyNote}`);
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#1b4332').text('Section C: Crop Suitability Recommendations');
  doc.moveDown(0.3);
  (report.sections?.topRecommendedCrops || []).forEach(c => {
    doc.fontSize(10).fillColor('#1b4332').text(`• ${c.cropName} (${c.category}): ${c.suitabilityLevel} [Score: ${c.suitabilityScore ?? 'N/A'}/100]`);
    doc.fontSize(9).fillColor('#555555').text(`  ${c.keyReason}`);
  });
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#1b4332').text('Section D: Targeted Soil Improvement Highlights');
  doc.moveDown(0.3);
  (report.sections?.soilImprovementHighlights || []).forEach(h => {
    doc.fontSize(10).fillColor('#2d6a4f').text(`• ${h.parameter}: ${h.recommendation}`);
    if (h.suggestedAmendments && h.suggestedAmendments.length > 0) {
      doc.fontSize(9).fillColor('#555555').text(`  Suggested Amendments: ${h.suggestedAmendments.join('; ')}`);
    }
  });

  doc.moveDown(2);
  doc.fontSize(8).fillColor('#888888').text('SoilSense Agricultural Diagnostic System - National Institute of Technology Delhi (CSE Department). Certified DBMS Laboratory Project.', { align: 'center' });

  doc.end();
}

module.exports = {
  generateSoilReport,
  createReportPDFStream
};
