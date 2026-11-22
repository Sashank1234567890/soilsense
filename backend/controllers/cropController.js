const Crop = require('../models/Crop');

/**
 * Search crops with partial and case-insensitive matching
 */
async function searchCrops(req, res) {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    const category = req.query.category;

    if (!q) {
      const filter = category ? { category } : {};
      const crops = await Crop.find(filter).sort({ name: 1 });
      return res.json({ success: true, count: crops.length, data: crops });
    }

    // Use regex for partial, case-insensitive matching
    const searchRegex = new RegExp(q, 'i');
    const filter = {
      $or: [
        { name: searchRegex },
        { scientificName: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { suitableRegions: searchRegex }
      ]
    };

    if (category) {
      filter.category = category;
    }

    const crops = await Crop.find(filter).sort({ name: 1 });
    return res.json({
      success: true,
      query: q,
      count: crops.length,
      data: crops
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get all crops with optional category and season filters
 */
async function getAllCrops(req, res) {
  try {
    const { category, season } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (season) filter.growingSeasons = season;

    const crops = await Crop.find(filter).sort({ name: 1 });
    return res.json({ success: true, count: crops.length, data: crops });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get crop by ID
 */
async function getCropById(req, res) {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    return res.json({ success: true, data: crop });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Create new crop record
 */
async function createCrop(req, res) {
  try {
    const crop = await Crop.create(req.body);
    return res.status(201).json({ success: true, data: crop });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * Update crop record
 */
async function updateCrop(req, res) {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    return res.json({ success: true, data: crop });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  searchCrops,
  getAllCrops,
  getCropById,
  createCrop,
  updateCrop
};
