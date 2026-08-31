import "dotenv/config";
import { connectDatabase } from "../config/database.js";
import User from "../models/User.js";

async function createAdmin() {
  await connectDatabase();

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required",
    );
  }

  const existingUser = await User.findOne({
    email: ADMIN_EMAIL.toLowerCase().trim(),
  });

  if (existingUser) {
    console.log("An account with the admin email already exists");
    process.exit(0);
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("Admin account created successfully");
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("Could not create admin:", error.message);
  process.exit(1);
});