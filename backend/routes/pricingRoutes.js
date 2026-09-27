const express = require('express');
const {
  getPricingConfigs,
  createPricingConfig,
  updatePricingConfig,
  deletePricingConfig,
} = require('../controllers/pricingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getPricingConfigs).post(authorize('ADMIN'), createPricingConfig);

router
  .route('/:id')
  .put(authorize('ADMIN'), updatePricingConfig)
  .delete(authorize('ADMIN'), deletePricingConfig);

module.exports = router;
