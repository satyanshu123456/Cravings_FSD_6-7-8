import Rider from "../models/rider.model.js";
import Order from "../models/order.model.js";

const getOrCreateRider = async (userId) => {
  let rider = await Rider.findOne({ riderId: userId });
  if (!rider) {
    rider = await Rider.create({
      riderId: userId,
      status: "active",
      isAvailable: true,
    });
  }
  return rider;
};

// GET /rider/profile
export const GetRiderProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const rider = await getOrCreateRider(currentUser._id);
    await rider.populate("riderId", "fullName email phone photo");

    res.status(200).json({
      message: "Rider profile fetched successfully",
      data: rider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// PUT /rider/profile
export const UpdateRiderProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { vehicleDetails, currentAddress, financialDetails, isAvailable } = req.body;

    const rider = await getOrCreateRider(currentUser._id);

    if (vehicleDetails) {
      rider.vehicleDetails = { ...rider.vehicleDetails, ...vehicleDetails };
    }
    if (currentAddress) {
      rider.currentAddress = { ...rider.currentAddress, ...currentAddress };
    }
    if (financialDetails) {
      rider.financialDetails = { ...rider.financialDetails, ...financialDetails };
    }
    if (typeof isAvailable === "boolean") {
      rider.isAvailable = isAvailable;
    }

    await rider.save();

    res.status(200).json({
      message: "Rider profile updated successfully",
      data: rider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// PATCH /rider/toggle-availability
export const ToggleRiderAvailability = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const rider = await getOrCreateRider(currentUser._id);
    rider.isAvailable = !rider.isAvailable;
    await rider.save();

    res.status(200).json({
      message: `Availability updated to ${rider.isAvailable ? "Online" : "Offline"}`,
      data: { isAvailable: rider.isAvailable },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /rider/available-deliveries
export const GetAvailableDeliveries = async (req, res, next) => {
  try {
    // Orders ready for pickup or accepted, with no rider assigned
    const orders = await Order.find({
      orderStatus: { $in: ["ready", "accepted"] },
      riderId: null,
      "paymentDetails.paymentStatus": "completed",
    })
      .populate("restaurantId", "restaurantName address city contactDetails phone")
      .populate({
        path: "customerId",
        populate: { path: "customerId", select: "fullName phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Available deliveries fetched",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// POST /rider/accept-order/:orderId
export const AcceptDelivery = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    const rider = await getOrCreateRider(currentUser._id);

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    if (order.riderId) {
      const error = new Error("This delivery has already been assigned to another rider");
      error.statusCode = 400;
      return next(error);
    }

    order.riderId = rider._id;
    order.orderStatus = "pickedUp";
    await order.save();

    res.status(200).json({
      message: "Delivery accepted! Head to the restaurant for pickup.",
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /rider/my-deliveries
export const GetMyDeliveries = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const rider = await getOrCreateRider(currentUser._id);

    const orders = await Order.find({ riderId: rider._id })
      .populate("restaurantId", "restaurantName address city contactDetails phone coverImage")
      .populate({
        path: "customerId",
        populate: { path: "customerId", select: "fullName phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "My deliveries fetched",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// PATCH /rider/update-status/:orderId
export const UpdateDeliveryStatus = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    const allowed = ["pickedUp", "onTheWay", "outForDelivery", "delivered"];
    if (!allowed.includes(status)) {
      const error = new Error(`Invalid delivery status transition to ${status}`);
      error.statusCode = 400;
      return next(error);
    }

    const rider = await getOrCreateRider(currentUser._id);
    const order = await Order.findOne({ _id: orderId, riderId: rider._id });

    if (!order) {
      const error = new Error("Order not assigned to you");
      error.statusCode = 404;
      return next(error);
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      message: `Delivery updated to: ${status}`,
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /rider/overview
export const GetRiderOverview = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const rider = await getOrCreateRider(currentUser._id);

    const orders = await Order.find({ riderId: rider._id })
      .populate("restaurantId", "restaurantName city")
      .sort({ createdAt: -1 });

    const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered");
    const activeTrips = orders.filter((o) =>
      ["pickedUp", "onTheWay", "outForDelivery"].includes(o.orderStatus),
    );

    // Earnings: ₹40 base payout per delivered trip
    const totalEarnings = deliveredOrders.length * 40;

    res.status(200).json({
      message: "Rider overview fetched",
      data: {
        totalDeliveries: deliveredOrders.length,
        totalEarnings,
        activeTripsCount: activeTrips.length,
        isAvailable: rider.isAvailable,
        averageRating: rider.averageRating || 4.8,
        activeOrders: activeTrips,
        recentDeliveries: deliveredOrders.slice(0, 5),
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

