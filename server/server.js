import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Allowed origins for production and development
const allowedOrigins = [
  process.env.CLIENT_URL,  // e.g. https://skycrm01.vercel.app
  "http://localhost:3000",
  "https://skycrm01.vercel.app"
].filter(Boolean);

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests (curl, Postman)
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Handle preflight OPTIONS requests
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CRM Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "CRM Backend API is live 🚀",
    endpoints: {
      health: "/health",
      auth: "/auth",
      users: "/users",
      customers: "/customers",
    },
  });
});

// Routes without /api prefix
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/customers", customerRoutes);

// Error handler
app.use(errorHandler);

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
