import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const AuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.Oreo;
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const OTPAuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.kitkat;
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RestaurantAuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.Oreo;
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    if (verifiedUser.userType !== "restaurant") {
      const error = new Error("Unauthorized Access - Restaurant only");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RiderAuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.Oreo;
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    if (verifiedUser.userType !== "rider") {
      const error = new Error("Unauthorized Access - Riders only");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const AdminAuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.Oreo;
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    if (verifiedUser.userType !== "admin") {
      const error = new Error("Unauthorized Access - Admins only");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
