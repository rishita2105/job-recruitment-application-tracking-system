import User from "../models/User.js";
import {
  clearTokenCookie,
  createToken,
  setTokenCookie,
} from "../utils/token.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export async function register(request, response, next) {
  try {
    const { name, email, password, role } = request.body;

    if (!name || !email || !password || !role) {
      return response.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    if (!["candidate", "recruiter"].includes(role)) {
      return response.status(400).json({
        success: false,
        message: "You can register only as a candidate or recruiter",
      });
    }

    if (password.length < 8) {
      return response.status(400).json({
        success: false,
        message: "Password must have at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    setTokenCookie(response, createToken(user._id.toString()));

    return response.status(201).json({
      success: true,
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "blocked") {
      return response.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact the administrator.",
      });
    }

    setTokenCookie(response, createToken(user._id.toString()));

    return response.status(200).json({
      success: true,
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export function logout(request, response) {
  clearTokenCookie(response);
  return response.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

export function getMe(request, response) {
  return response.status(200).json({
    success: true,
    user: publicUser(request.user),
  });
}
