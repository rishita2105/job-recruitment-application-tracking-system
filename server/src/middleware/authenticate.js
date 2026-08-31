import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authenticate(request, response, next) {
  try {
    const token = request.cookies.token;

    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Please log in to continue",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "The user for this session no longer exists",
      });
    }

    if (user.status === "blocked") {
      return response.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return response.status(401).json({
        success: false,
        message: "Your session is invalid or has expired",
      });
    }
    next(error);
  }
}
