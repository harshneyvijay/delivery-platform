const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignDriver,
  updateOrderStatus,
  getOrderHistory,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorize('ADMIN', 'DISPATCHER'), createOrder)
  .get(authorize('ADMIN', 'DISPATCHER', 'DRIVER'), getOrders);

router
  .route('/:id')
  .get(authorize('ADMIN', 'DISPATCHER', 'DRIVER'), getOrderById)
  .put(authorize('ADMIN', 'DISPATCHER'), updateOrder)
  .delete(authorize('ADMIN'), deleteOrder);

router.put('/:id/assign', authorize('ADMIN', 'DISPATCHER'), assignDriver);
router.put('/:id/status', authorize('ADMIN', 'DISPATCHER', 'DRIVER'), updateOrderStatus);
router.get('/:id/history', authorize('ADMIN', 'DISPATCHER', 'DRIVER'), getOrderHistory);

module.exports = router;
