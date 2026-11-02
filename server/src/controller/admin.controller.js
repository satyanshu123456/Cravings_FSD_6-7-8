import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Rider from "../models/rider.model.js";
import Order from "../models/order.model.js";
import Contact from "../models/contact.model.js";

// GET /admin/overview
export const GetAdminOverview = async (req, res, next) => {
  try {
    const [totalCustomers, totalRestaurants, totalRiders, allOrders, totalMessages] =
      await Promise.all([
        User.countDocuments({ userType: "customer" }),
        Restaurant.countDocuments(),
        User.countDocuments({ userType: "rider" }),
        Order.find().sort({ createdAt: -1 }),
        Contact.countDocuments(),
      ]);

    const totalOrders = allOrders.length;
    let totalGMV = 0;
    let totalPlatformFees = 0;

    allOrders.forEach((o) => {
      if (
        o.paymentDetails?.paymentStatus === "completed" ||
        o.orderStatus === "delivered"
      ) {
        totalGMV += o.billDetails?.finalAmount || 0;
        totalPlatformFees +=
          (o.billDetails?.platformFee || 0) +
          (o.billDetails?.convenienceFee || 0);
      }
    });

    res.status(200).json({
      message: "Admin overview fetched successfully",
      data: {
        totalCustomers,
        totalRestaurants,
        totalRiders,
        totalOrders,
        totalMessages,
        totalGMV: Math.round(totalGMV * 100) / 100,
        totalPlatformFees: Math.round(totalPlatformFees * 100) / 100,
        recentOrders: allOrders.slice(0, 5),
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /admin/restaurants
export const GetAllRestaurantsAdmin = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("managerId", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Restaurants fetched successfully",
      data: restaurants,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// PATCH /admin/restaurant/:restaurantId/status
export const UpdateRestaurantStatusAdmin = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "blocked"].includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    restaurant.status = status;
    await restaurant.save();

    res.status(200).json({
      message: `Restaurant status updated to ${status}`,
      data: restaurant,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /admin/riders
export const GetAllRidersAdmin = async (req, res, next) => {
  try {
    const riders = await Rider.find()
      .populate("riderId", "fullName email phone photo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Riders fetched successfully",
      data: riders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// PATCH /admin/rider/:riderId/status
export const UpdateRiderStatusAdmin = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "blocked"].includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    rider.status = status;
    await rider.save();

    res.status(200).json({
      message: `Rider status updated to ${status}`,
      data: rider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /admin/orders
export const GetAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("restaurantId", "restaurantName city")
      .populate({
        path: "customerId",
        populate: { path: "customerId", select: "fullName email phone" },
      })
      .populate({
        path: "riderId",
        populate: { path: "riderId", select: "fullName phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All platform orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /admin/contact-messages
export const GetContactMessagesAdmin = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Contact messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

