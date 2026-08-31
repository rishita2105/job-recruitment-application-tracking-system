import jwt from "jsonwebtoken";

export function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function setTokenCookie(response, token) {
  const expiresInDays = Number(process.env.COOKIE_EXPIRES_DAYS) || 7;
  const isProduction = process.env.NODE_ENV === "production";

  response.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
  });
}

export function clearTokenCookie(response) {
  const isProduction = process.env.NODE_ENV === "production";

  response.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
}
