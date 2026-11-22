const AnalysisReport = require('../models/AnalysisReport');
const SoilTest = require('../models/SoilTest');
const { generateSoilReport, createReportPDFStream } = require('../services/reportService');

async function createReport(req, res) {
  try {
    const { soilTestId } = req.body;
    if (!soilTestId) {
      return res.status(400).json({ success: false, message: 'soilTestId is required' });
    }

    const report = await generateSoilReport(soilTestId);
    return res.status(201).json({
      success: true,
      message: 'Analysis report generated.',
      data: report
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getReportById(req, res) {
  try {
    const report = await AnalysisReport.findById(req.params.id).populate('soilTestId');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getAllReports(req, res) {
  try {
    let filter = {};
    if (req.user) {
      const userTests = await SoilTest.find({ userId: req.user._id }).select('_id');
      const testIds = userTests.map(t => t._id);
      filter.soilTestId = { $in: testIds };
    } else {
      return res.json({ success: true, count: 0, data: [] });
    }

    const reports = await AnalysisReport.find(filter).sort({ generatedAt: -1 }).limit(30);
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function downloadReportPDF(req, res) {
  try {
    const report = await AnalysisReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const soilTest = await SoilTest.findById(report.soilTestId);
    if (!soilTest) {
      return res.status(404).json({ success: false, message: 'Associated soil test not found' });
    }

    createReportPDFStream(report, soilTest, res);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createReport,
  getReportById,
  getAllReports,
  downloadReportPDF
};
