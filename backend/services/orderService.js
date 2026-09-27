const Order = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');

// Defines which statuses an order may move to from its current status.
const VALID_TRANSITIONS = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

const isValidTransition = (currentStatus, newStatus) => {
  if (!VALID_TRANSITIONS[currentStatus]) {
    return false;
  }
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
};

/**
 * Validates and applies a status transition to an order, recording
 * the change in the OrderStatusHistory collection.
 */
const changeOrderStatus = async (order, newStatus, updatedByUserId) => {
  if (!isValidTransition(order.status, newStatus)) {
    const error = new Error(
      `Invalid status transition from ${order.status} to ${newStatus}`
    );
    error.statusCode = 400;
    throw error;
  }

  order.status = newStatus;
  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: newStatus,
    updatedBy: updatedByUserId,
    timestamp: new Date(),
  });

  return order;
};

/**
 * Records the initial CREATED status in the order history. Used when
 * an order is first created.
 */
const recordInitialStatus = async (order, updatedByUserId) => {
  await OrderStatusHistory.create({
    order: order._id,
    status: order.status,
    updatedBy: updatedByUserId,
    timestamp: new Date(),
  });
};

module.exports = {
  VALID_TRANSITIONS,
  generateOrderId,
  isValidTransition,
  changeOrderStatus,
  recordInitialStatus,
};
