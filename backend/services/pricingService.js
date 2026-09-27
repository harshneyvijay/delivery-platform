const PricingConfig = require('../models/PricingConfig');

/**
 * Calculates the delivery fee for an order based on the pricing configuration
 * stored in MongoDB for the given zone.
 *
 * Delivery Fee = Base Price for Zone + (Weight * Price Per Kg) + COD Fee
 *
 * COD Fee only applies when the order has a COD amount greater than 0.
 */
const calculateDeliveryFee = async (zone, weight, codAmount) => {
  const pricingConfig = await PricingConfig.findOne({ zone });

  if (!pricingConfig) {
    const error = new Error(`No pricing configuration found for zone: ${zone}`);
    error.statusCode = 400;
    throw error;
  }

  const numericWeight = Number(weight) || 0;
  const numericCodAmount = Number(codAmount) || 0;

  const codFee = numericCodAmount > 0 ? pricingConfig.codFee : 0;

  const deliveryFee =
    pricingConfig.basePrice + numericWeight * pricingConfig.pricePerKg + codFee;

  return Math.round(deliveryFee * 100) / 100;
};

module.exports = { calculateDeliveryFee };
