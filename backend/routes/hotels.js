const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Hotel = require("../models/Hotel");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels with filtering and pagination
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
    query("rating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be between 0 and 5"),
    query("amenities")
      .optional()
      .isString()
      .withMessage("Amenities must be a string"),
    query("checkIn")
      .optional()
      .isISO8601()
      .withMessage("Check-in date must be valid"),
    query("checkOut")
      .optional()
      .isISO8601()
      .withMessage("Check-out date must be valid"),
    query("guests")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("Guests must be between 1 and 10"),
    query("sort")
      .optional()
      .isIn(["rating", "price", "distance", "name"])
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
        rating,
        amenities,
        checkIn,
        checkOut,
        guests = 1,
        sort = "rating",
        search,
      } = req.query;

      // Build filter object
      const filter = { isActive: true };

      if (rating) {
        filter.rating = { $gte: parseFloat(rating) };
      }

      if (amenities) {
        const amenitiesArray = amenities.split(",").map((a) => a.trim());
        filter.amenities = { $in: amenitiesArray };
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
      if (sort === "rating") sortObj.rating = -1;
      else if (sort === "price") sortObj["rooms.price"] = 1;
      else if (sort === "distance") sortObj.distance = 1;
      else if (sort === "name") sortObj.name = 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get hotels with populated rooms
      const hotels = await Hotel.find(filter)
        .populate("admin", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      // Filter hotels based on availability if dates are provided
      let availableHotels = hotels;
      if (checkIn && checkOut) {
        availableHotels = hotels.filter((hotel) => {
          const availableRooms = hotel.rooms.filter(
            (room) =>
              room.isActive &&
              room.available > 0 &&
              room.capacity >= parseInt(guests)
          );
          return availableRooms.length > 0;
        });
      }

      // Get total count for pagination
      const total = await Hotel.countDocuments(filter);

      res.json({
        success: true,
        data: {
          hotels: availableHotels,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get hotels error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching hotels",
      });
    }
  }
);

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "admin",
      "name email phone"
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    if (!hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: "Hotel is not available",
      });
    }

    res.json({
      success: true,
      data: {
        hotel,
      },
    });
  } catch (error) {
    console.error("Get hotel error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching hotel",
    });
  }
});

// @route   GET /api/hotels/:id/availability
// @desc    Check hotel availability for specific dates
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
    query("guests")
      .isInt({ min: 1, max: 10 })
      .withMessage("Guests must be between 1 and 10"),
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

      const { checkIn, checkOut, guests } = req.query;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Validate dates
      if (checkInDate >= checkOutDate) {
        return res.status(400).json({
          success: false,
          message: "Check-out date must be after check-in date",
        });
      }

      const hotel = await Hotel.findById(req.params.id);
      if (!hotel || !hotel.isActive) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found or not available",
        });
      }

      // Get available rooms
      const availableRooms = hotel.rooms.filter(
        (room) =>
          room.isActive &&
          room.available > 0 &&
          room.capacity >= parseInt(guests)
      );

      // Calculate duration
      const duration = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );

      // Calculate pricing for each room
      const roomsWithPricing = availableRooms.map((room) => ({
        ...room.toObject(),
        totalPrice: room.price * duration,
        duration,
      }));

      res.json({
        success: true,
        data: {
          hotel: {
            id: hotel._id,
            name: hotel.name,
            address: hotel.address,
            amenities: hotel.amenities,
          },
          checkIn: checkInDate,
          checkOut: checkOutDate,
          duration,
          guests: parseInt(guests),
          availableRooms: roomsWithPricing,
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

// @route   GET /api/hotels/:id/rooms
// @desc    Get all rooms for a hotel
// @access  Public
router.get("/:id/rooms", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or not available",
      });
    }

    const rooms = hotel.rooms.filter((room) => room.isActive);

    res.json({
      success: true,
      data: {
        hotel: {
          id: hotel._id,
          name: hotel.name,
        },
        rooms,
      },
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching rooms",
    });
  }
});

// @route   GET /api/hotels/search/nearby
// @desc    Search hotels near a location
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

      const hotels = await Hotel.find({
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
          hotels,
          searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseFloat(radius),
        },
      });
    } catch (error) {
      console.error("Nearby search error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while searching nearby hotels",
      });
    }
  }
);

module.exports = router;
