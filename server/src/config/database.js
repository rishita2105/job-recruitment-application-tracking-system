import dns from "node:dns";
import mongoose from "mongoose";

// Required because the current network DNS refuses Node SRV requests
dns.setServers(["1.1.1.1", "8.8.8.8"]);

export async function connectDatabase() {
  try {
    console.log("Node DNS servers:", dns.getServers());

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error("Message:", error.message);

    process.exit(1);
  }
}