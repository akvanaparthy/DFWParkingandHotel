const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Get basic system info
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };

    // Check if database is healthy
    const isHealthy = dbStatus === "connected";

    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: isHealthy,
      timestamp: new Date().toISOString(),
      status: isHealthy ? "healthy" : "unhealthy",
      database: {
        status: dbStatus,
        connection: mongoose.connection.host || "unknown",
      },
      system: systemInfo,
      version: process.env.npm_package_version || "1.0.0",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      success: false,
      timestamp: new Date().toISOString(),
      status: "unhealthy",
      error: "Health check failed",
      database: {
        status: "error",
        connection: "unknown",
      },
    });
  }
});

// @route   GET /api/health/detailed
// @desc    Detailed health check with database queries
// @access  Public
router.get("/detailed", async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Test database queries
    let dbTests = {};
    if (dbStatus === "connected") {
      try {
        const [userCount, hotelCount, parkingCount, bookingCount] =
          await Promise.all([
            mongoose.model("User").countDocuments().exec(),
            mongoose.model("Hotel").countDocuments().exec(),
            mongoose.model("ParkingLot").countDocuments().exec(),
            mongoose.model("Booking").countDocuments().exec(),
          ]);

        dbTests = {
          users: userCount,
          hotels: hotelCount,
          parkingLots: parkingCount,
          bookings: bookingCount,
        };
      } catch (dbError) {
        dbTests = { error: dbError.message };
      }
    }

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: "healthy",
      responseTime: `${responseTime}ms`,
      database: {
        status: dbStatus,
        connection: mongoose.connection.host || "unknown",
        tests: dbTests,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        port: process.env.PORT || 5000,
      },
    });
  } catch (error) {
    console.error("Detailed health check error:", error);
    res.status(503).json({
      success: false,
      timestamp: new Date().toISOString(),
      status: "unhealthy",
      error: error.message,
    });
  }
});

module.exports = router;
