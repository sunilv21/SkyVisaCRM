import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const users = [
  {
    name: "System Administrator",
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "John Smith",
    email: "john@company.com",
    password: "emp123",
    role: "employee",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@company.com",
    password: "emp123",
    role: "employee",
  },
];

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Insert new users
    await User.insertMany(users);
    console.log("✅ Users seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
