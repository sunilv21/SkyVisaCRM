import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Auth token received:", token ? "Yes" : "No");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded, user ID:", decoded.id);
      req.user = await User.findById(decoded.id).select("-password");
      console.log("User found:", req.user ? req.user.email : "Not found");
      return next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    console.error("No authorization token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin only access" });
  }
};
