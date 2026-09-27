const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: [true, 'Zone is required'],
      unique: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    pricePerKg: {
      type: Number,
      required: [true, 'Price per kg is required'],
      min: 0,
    },
    codFee: {
      type: Number,
      required: [true, 'COD fee is required'],
      min: 0,
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
