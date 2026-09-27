const Order = require('../models/Order');
const User = require('../models/User');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { calculateDeliveryFee } = require('../services/pricingService');
const {
  generateOrderId,
  changeOrderStatus,
  recordInitialStatus,
} = require('../services/orderService');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Admin,Dispatcher
const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      zone,
      weight,
      codAmount,
    } = req.body;

    if (
      !customerName ||
      !customerPhone ||
      !pickupAddress ||
      !deliveryAddress ||
      !zone ||
      weight === undefined
    ) {
      res.status(400);
      throw new Error(
        'Please provide customerName, customerPhone, pickupAddress, deliveryAddress, zone and weight'
      );
    }

    const deliveryFee = await calculateDeliveryFee(zone, weight, codAmount || 0);

    const order = await Order.create({
      orderId: generateOrderId(),
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      zone,
      weight,
      codAmount: codAmount || 0,
      deliveryFee,
      status: 'CREATED',
    });

    await recordInitialStatus(order, req.user._id);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (drivers only see orders assigned to them)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'DRIVER') {
      filter.assignedDriver = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('assignedDriver', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'assignedDriver',
      'name email role'
    );

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (
      req.user.role === 'DRIVER' &&
      (!order.assignedDriver || order.assignedDriver._id.toString() !== req.user._id.toString())
    ) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an order's details
// @route   PUT /api/orders/:id
// @access  Private/Admin,Dispatcher
const updateOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      zone,
      weight,
      codAmount,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (customerName) order.customerName = customerName;
    if (customerPhone) order.customerPhone = customerPhone;
    if (pickupAddress) order.pickupAddress = pickupAddress;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;

    let pricingFieldsChanged = false;

    if (zone && zone !== order.zone) {
      order.zone = zone;
      pricingFieldsChanged = true;
    }
    if (weight !== undefined && weight !== order.weight) {
      order.weight = weight;
      pricingFieldsChanged = true;
    }
    if (codAmount !== undefined && codAmount !== order.codAmount) {
      order.codAmount = codAmount;
      pricingFieldsChanged = true;
    }

    if (pricingFieldsChanged) {
      order.deliveryFee = await calculateDeliveryFee(
        order.zone,
        order.weight,
        order.codAmount
      );
    }

    const updatedOrder = await order.save();

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    await OrderStatusHistory.deleteMany({ order: order._id });
    await order.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a driver to an order
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin,Dispatcher
const assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      res.status(400);
      throw new Error('Please provide driverId');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const driver = await User.findById(driverId);

    if (!driver || driver.role !== 'DRIVER') {
      res.status(400);
      throw new Error('Provided driverId does not belong to a valid driver');
    }

    if (order.status !== 'CREATED' && order.status !== 'ASSIGNED') {
      res.status(400);
      throw new Error(
        `Cannot assign a driver to an order with status ${order.status}`
      );
    }

    order.assignedDriver = driver._id;

    if (order.status === 'CREATED') {
      await changeOrderStatus(order, 'ASSIGNED', req.user._id);
    } else {
      await order.save();
    }

    const updatedOrder = await Order.findById(order._id).populate(
      'assignedDriver',
      'name email role'
    );

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an order's status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400);
      throw new Error('Please provide status');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (
      req.user.role === 'DRIVER' &&
      (!order.assignedDriver || order.assignedDriver.toString() !== req.user._id.toString())
    ) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }

    const updatedOrder = await changeOrderStatus(order, status, req.user._id);

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Get status history for an order
// @route   GET /api/orders/:id/history
// @access  Private
const getOrderHistory = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (
      req.user.role === 'DRIVER' &&
      (!order.assignedDriver || order.assignedDriver.toString() !== req.user._id.toString())
    ) {
      res.status(403);
      throw new Error('Not authorized to view this order history');
    }

    const history = await OrderStatusHistory.find({ order: order._id })
      .populate('updatedBy', 'name email role')
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignDriver,
  updateOrderStatus,
  getOrderHistory,
};
