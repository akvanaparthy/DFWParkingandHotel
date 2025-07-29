const express = require("express");
const { query, validationResult } = require("express-validator");
const ParkingLot = require("../models/ParkingLot");

const router = express.Router();

// @route   GET /api/parking
// @desc    Get all parking lots with filtering and pagination
// @access  Public
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("spotType")
      .optional()
      .isIn(["Standard", "Covered", "Handicap", "Electric", "Oversized"])
      .withMessage("Invalid spot type"),
    query("features")
      .optional()
      .isString()
      .withMessage("Features must be a string"),
    query("checkIn")
      .optional()
      .isISO8601()
      .withMessage("Check-in date must be valid"),
    query("checkOut")
      .optional()
      .isISO8601()
      .withMessage("Check-out date must be valid"),
    query("sort")
      .optional()
      .isIn(["price", "distance", "availability", "name"])
      .withMessage("Invalid sort field"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 10,
        spotType,
        features,
        checkIn,
        checkOut,
        sort = "availability",
        search,
      } = req.query;

      // Build filter object
      const filter = { isActive: true };

      if (features) {
        const featuresArray = features.split(",").map((f) => f.trim());
        filter.features = { $in: featuresArray };
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { "address.city": { $regex: search, $options: "i" } },
        ];
      }

      // Build sort object
      const sortObj = {};
      if (sort === "price") sortObj["pricing.daily"] = 1;
      else if (sort === "distance") sortObj.distance = 1;
      else if (sort === "availability") sortObj["capacity.available"] = -1;
      else if (sort === "name") sortObj.name = 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get parking lots
      const parkingLots = await ParkingLot.find(filter)
        .populate("admin", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      // Filter based on availability if dates are provided
      let availableParkingLots = parkingLots;
      if (checkIn && checkOut) {
        availableParkingLots = parkingLots.filter((lot) => {
          const availableSpots = lot.parkingSpots.filter(
            (spot) => spot.isAvailable && !spot.isReserved
          );
          if (spotType) {
            return availableSpots.some((spot) => spot.type === spotType);
          }
          return availableSpots.length > 0;
        });
      }

      // Get total count for pagination
      const total = await ParkingLot.countDocuments(filter);

      res.json({
        success: true,
        data: {
          parkingLots: availableParkingLots,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get parking lots error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching parking lots",
      });
    }
  }
);

// @route   GET /api/parking/:id
// @desc    Get parking lot by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id).populate(
      "admin",
      "name email phone"
    );

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: "Parking lot not found",
      });
    }

    if (!parkingLot.isActive) {
      return res.status(404).json({
        success: false,
        message: "Parking lot is not available",
      });
    }

    res.json({
      success: true,
      data: {
        parkingLot,
      },
    });
  } catch (error) {
    console.error("Get parking lot error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching parking lot",
    });
  }
});

// @route   GET /api/parking/:id/availability
// @desc    Check parking lot availability for specific dates
// @access  Public
router.get(
  "/:id/availability",
  [
    query("checkIn")
      .isISO8601()
      .withMessage("Check-in date is required and must be valid"),
    query("checkOut")
      .isISO8601()
      .withMessage("Check-out date is required and must be valid"),
    query("spotType")
      .optional()
      .isIn(["Standard", "Covered", "Handicap", "Electric", "Oversized"])
      .withMessage("Invalid spot type"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { checkIn, checkOut, spotType = "Standard" } = req.query;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Validate dates
      if (checkInDate >= checkOutDate) {
        return res.status(400).json({
          success: false,
          message: "Check-out date must be after check-in date",
        });
      }

      const parkingLot = await ParkingLot.findById(req.params.id);
      if (!parkingLot || !parkingLot.isActive) {
        return res.status(404).json({
          success: false,
          message: "Parking lot not found or not available",
        });
      }

      // Get available spots
      const availableSpots = parkingLot.parkingSpots.filter(
        (spot) => spot.isAvailable && !spot.isReserved && spot.type === spotType
      );

      // Calculate duration
      const duration = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );

      // Calculate pricing
      const pricing = parkingLot.pricing;
      const totalPrice =
        duration <= 1
          ? pricing.hourly
          : duration <= 7
          ? pricing.daily * duration
          : duration <= 30
          ? pricing.weekly * Math.ceil(duration / 7)
          : pricing.monthly * Math.ceil(duration / 30);

      res.json({
        success: true,
        data: {
          parkingLot: {
            id: parkingLot._id,
            name: parkingLot.name,
            address: parkingLot.address,
            features: parkingLot.features,
          },
          checkIn: checkInDate,
          checkOut: checkOutDate,
          duration,
          spotType,
          availableSpots: availableSpots.length,
          pricing: {
            hourly: pricing.hourly,
            daily: pricing.daily,
            weekly: pricing.weekly,
            monthly: pricing.monthly,
            totalPrice,
          },
        },
      });
    } catch (error) {
      console.error("Check availability error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while checking availability",
      });
    }
  }
);

// @route   GET /api/parking/search/nearby
// @desc    Search parking lots near a location
// @access  Public
router.get(
  "/search/nearby",
  [
    query("lat").isFloat().withMessage("Latitude is required"),
    query("lng").isFloat().withMessage("Longitude is required"),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 50 })
      .withMessage("Radius must be between 0.1 and 50 km"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { lat, lng, radius = 10 } = req.query;

      const parkingLots = await ParkingLot.find({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          },
        },
      }).populate("admin", "name email");

      res.json({
        success: true,
        data: {
          parkingLots,
          searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseFloat(radius),
        },
      });
    } catch (error) {
      console.error("Nearby search error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while searching nearby parking lots",
      });
    }
  }
);

module.exports = router;
