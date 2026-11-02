import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/dbConnection.config.js";
import adminSeed from "./admin.seed.js";
import userSeed from "./user.seed.js";

const Seed = async () => {
  try {
    await connectDB();

    await adminSeed();
    await userSeed();
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.log("Seeding error:", error.message);
    process.exit(1);
  }
};

Seed();
