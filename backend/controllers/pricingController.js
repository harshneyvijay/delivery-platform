const PricingConfig = require('../models/PricingConfig');

// @desc    Get all pricing configurations
// @route   GET /api/pricing
// @access  Private
const getPricingConfigs = async (req, res, next) => {
  try {
    const configs = await PricingConfig.find().sort({ zone: 1 });
    res.status(200).json({ success: true, count: configs.length, data: configs });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a pricing configuration
// @route   POST /api/pricing
// @access  Private/Admin
const createPricingConfig = async (req, res, next) => {
  try {
    const { zone, basePrice, pricePerKg, codFee } = req.body;

    if (
      !zone ||
      basePrice === undefined ||
      pricePerKg === undefined ||
      codFee === undefined
    ) {
      res.status(400);
      throw new Error('Please provide zone, basePrice, pricePerKg and codFee');
    }

    const existing = await PricingConfig.findOne({ zone });
    if (existing) {
      res.status(400);
      throw new Error(`Pricing configuration for zone "${zone}" already exists`);
    }

    const config = await PricingConfig.create({ zone, basePrice, pricePerKg, codFee });

    res.status(201).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a pricing configuration
// @route   PUT /api/pricing/:id
// @access  Private/Admin
const updatePricingConfig = async (req, res, next) => {
  try {
    const { zone, basePrice, pricePerKg, codFee } = req.body;

    const config = await PricingConfig.findById(req.params.id);

    if (!config) {
      res.status(404);
      throw new Error('Pricing configuration not found');
    }

    if (zone) config.zone = zone;
    if (basePrice !== undefined) config.basePrice = basePrice;
    if (pricePerKg !== undefined) config.pricePerKg = pricePerKg;
    if (codFee !== undefined) config.codFee = codFee;

    const updatedConfig = await config.save();

    res.status(200).json({ success: true, data: updatedConfig });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a pricing configuration
// @route   DELETE /api/pricing/:id
// @access  Private/Admin
const deletePricingConfig = async (req, res, next) => {
  try {
    const config = await PricingConfig.findById(req.params.id);

    if (!config) {
      res.status(404);
      throw new Error('Pricing configuration not found');
    }

    await config.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPricingConfigs,
  createPricingConfig,
  updatePricingConfig,
  deletePricingConfig,
};
