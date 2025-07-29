const express = require("express");
const { body, query, validationResult } = require("express-validator");
const User = require("../models/User");
const Hotel = require("../models/Hotel");
const ParkingLot = require("../models/ParkingLot");
const Booking = require("../models/Booking");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth);

// Assign hotel to hotel admin
router.post("/assign/hotel/:hotelId", auth, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { adminId } = req.body;

    // Validate admin exists and is a hotel admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "hotel_admin") {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel admin",
      });
    }

    // Update hotel with admin assignment
    const hotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { admin: adminId },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Update user's assigned hotel
    await User.findByIdAndUpdate(adminId, { assignedHotel: hotelId });

    res.json({
      success: true,
      message: "Hotel assigned successfully",
      data: { hotel },
    });
  } catch (error) {
    console.error("Error assigning hotel:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning hotel",
    });
  }
});

// Assign parking lot to parking admin
router.post("/assign/parking/:parkingId", auth, async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { adminId } = req.body;

    // Validate admin exists and is a parking admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "parking_admin") {
      return res.status(400).json({
        success: false,
        message: "Invalid parking admin",
      });
    }

    // Update parking lot with admin assignment
    const parkingLot = await ParkingLot.findByIdAndUpdate(
      parkingId,
      { admin: adminId },
      { new: true }
    );

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: "Parking lot not found",
      });
    }

    // Update user's assigned parking lot
    await User.findByIdAndUpdate(adminId, { assignedParking: parkingId });

    res.json({
      success: true,
      message: "Parking lot assigned successfully",
      data: { parkingLot },
    });
  } catch (error) {
    console.error("Error assigning parking lot:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning parking lot",
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Super Admin)
router.get("/dashboard", authorize("super_admin"), async (req, res) => {
  try {
    const [
      totalUsers,
      totalHotels,
      totalParkingLots,
      totalBookings,
      recentBookings,
      revenueStats,
    ] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments(),
      ParkingLot.countDocuments(),
      Booking.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email"),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["confirmed", "completed"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.total" },
            avgBookingValue: { $avg: "$pricing.total" },
          },
        },
      ]),
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, avgBookingValue: 0 };

    // Create recent activity from bookings
    const recentActivity = recentBookings.map((booking) => ({
      description: `New ${booking.type} booking by ${
        booking.user?.name || "User"
      }`,
      timestamp: booking.createdAt,
      type: "booking",
    }));

    res.json({
      success: true,
      data: {
        statistics: {
          users: totalUsers,
          hotels: totalHotels,
          parkingLots: totalParkingLots,
          bookings: totalBookings,
          revenue: revenue.totalRevenue,
          avgBookingValue: revenue.avgBookingValue,
          recentActivity,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
});

// @route   GET /api/admin/hotel-stats
// @desc    Get hotel admin dashboard statistics
// @access  Private (Hotel Admin)
router.get("/hotel-stats", authorize("hotel_admin"), async (req, res) => {
  try {
    const [totalRooms, activeBookings, revenueStats, recentBookings] =
      await Promise.all([
        Hotel.aggregate([{ $unwind: "$rooms" }, { $count: "total" }]),
        Booking.countDocuments({
          type: "hotel",
          status: { $in: ["confirmed", "active"] },
        }),
        Booking.aggregate([
          {
            $match: {
              type: "hotel",
              status: { $in: ["confirmed", "completed"] },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$pricing.total" },
            },
          },
        ]),
        Booking.find({ type: "hotel" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("user", "name email")
          .populate("hotel", "name"),
      ]);

    const revenue = revenueStats[0]?.totalRevenue || 0;
    const totalRoomsCount = totalRooms[0]?.total || 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalRooms: totalRoomsCount,
          activeBookings,
          revenue,
          recentBookings,
        },
      },
    });
  } catch (error) {
    console.error("Hotel stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching hotel statistics",
    });
  }
});

// @route   GET /api/admin/parking-stats
// @desc    Get parking admin dashboard statistics
// @access  Private (Parking Admin)
router.get("/parking-stats", authorize("parking_admin"), async (req, res) => {
  try {
    const [totalSpots, activeBookings, revenueStats, recentBookings] =
      await Promise.all([
        ParkingLot.aggregate([{ $unwind: "$spots" }, { $count: "total" }]),
        Booking.countDocuments({
          type: "parking",
          status: { $in: ["confirmed", "active"] },
        }),
        Booking.aggregate([
          {
            $match: {
              type: "parking",
              status: { $in: ["confirmed", "completed"] },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$pricing.total" },
            },
          },
        ]),
        Booking.find({ type: "parking" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("user", "name email")
          .populate("parking", "name"),
      ]);

    const revenue = revenueStats[0]?.totalRevenue || 0;
    const totalSpotsCount = totalSpots[0]?.total || 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalSpots: totalSpotsCount,
          activeBookings,
          revenue,
          recentBookings,
        },
      },
    });
  } catch (error) {
    console.error("Parking stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching parking statistics",
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Super Admin)
router.get(
  "/users",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("role")
      .optional()
      .isIn([
        "customer",
        "hotel_admin",
        "parking_admin",
        "super_admin",
        "support",
      ])
      .withMessage("Invalid role"),
    query("search").optional().trim(),
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

      const { page = 1, limit = 10, role, search } = req.query;

      const filter = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const users = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching users",
      });
    }
  }
);

// @route   PUT /api/admin/users/:id
// @desc    Update user role and status
// @access  Private (Super Admin)
router.put(
  "/users/:id",
  [
    body("role")
      .optional()
      .isIn([
        "customer",
        "hotel_admin",
        "parking_admin",
        "super_admin",
        "support",
      ])
      .withMessage("Invalid role"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
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

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent changing own role
      if (user._id.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot modify your own role",
        });
      }

      const { role, isActive } = req.body;
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();

      res.json({
        success: true,
        message: "User updated successfully",
        data: {
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating user",
      });
    }
  }
);

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filtering
// @access  Private (Super Admin)
router.get(
  "/bookings",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
    query("type")
      .optional()
      .isIn(["hotel", "parking", "both"])
      .withMessage("Invalid booking type"),
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

      const { page = 1, limit = 10, status, type } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;

      const bookings = await Booking.find(filter)
        .populate("user", "name email")
        .populate("hotel.hotelId", "name")
        .populate("parking.parkingLotId", "name")
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const total = await Booking.countDocuments(filter);

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get admin bookings error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching bookings",
      });
    }
  }
);

// @route   PUT /api/admin/bookings/:id
// @desc    Update booking status
// @access  Private (Super Admin)
router.put(
  "/bookings/:id",
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
    body("notes").optional().trim(),
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

      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const { status, notes } = req.body;
      booking.status = status;
      if (notes) booking.notes = notes;

      await booking.save();

      res.json({
        success: true,
        message: "Booking status updated successfully",
        data: {
          booking,
        },
      });
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating booking status",
      });
    }
  }
);

// @route   GET /api/admin/reports
// @desc    Get various reports
// @access  Private (Super Admin)
router.get(
  "/reports",
  [
    query("type")
      .isIn(["revenue", "bookings", "users"])
      .withMessage("Invalid report type"),
    query("period")
      .optional()
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("Invalid period"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be valid"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be valid"),
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

      const { type, period = "monthly", startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      let reportData;
      switch (type) {
        case "revenue":
          reportData = await Booking.aggregate([
            {
              $match: {
                ...dateFilter,
                status: { $in: ["confirmed", "completed"] },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format:
                      period === "daily"
                        ? "%Y-%m-%d"
                        : period === "weekly"
                        ? "%Y-%U"
                        : period === "monthly"
                        ? "%Y-%m"
                        : "%Y",
                    date: "$createdAt",
                  },
                },
                totalRevenue: { $sum: "$pricing.total" },
                bookingCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]);
          break;

        case "bookings":
          reportData = await Booking.aggregate([
            { $match: dateFilter },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$pricing.total" },
              },
            },
          ]);
          break;

        case "users":
          reportData = await User.aggregate([
            { $match: dateFilter },
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ]);
          break;
      }

      res.json({
        success: true,
        data: {
          type,
          period,
          reportData,
        },
      });
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while generating report",
      });
    }
  }
);

// @route   DELETE /api/admin/hotels/:id
// @desc    Delete a hotel
// @access  Private (Super Admin)
router.delete("/hotels/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Check if hotel has active bookings
    const activeBookings = await Booking.countDocuments({
      "hotel.hotelId": req.params.id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete hotel with active bookings",
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Delete hotel error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting hotel",
    });
  }
});

// @route   DELETE /api/admin/parking/:id
// @desc    Delete a parking lot
// @access  Private (Super Admin)
router.delete("/parking/:id", async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: "Parking lot not found",
      });
    }

    // Check if parking lot has active bookings
    const activeBookings = await Booking.countDocuments({
      "parking.parkingLotId": req.params.id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete parking lot with active bookings",
      });
    }

    await ParkingLot.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Parking lot deleted successfully",
    });
  } catch (error) {
    console.error("Delete parking lot error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting parking lot",
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Super Admin)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Check if user has active bookings
    const activeBookings = await Booking.countDocuments({
      user: req.params.id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active bookings",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
});

// @route   GET /api/admin/hotels
// @desc    Get all hotels for admin
// @access  Private (Super Admin)
router.get("/hotels", authorize("super_admin"), async (req, res) => {
  try {
    const hotels = await Hotel.find().populate("admin", "name email");

    res.json({
      success: true,
      data: {
        hotels,
      },
    });
  } catch (error) {
    console.error("Get hotels error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching hotels",
    });
  }
});

// @route   GET /api/admin/parking
// @desc    Get all parking lots for admin
// @access  Private (Super Admin)
router.get("/parking", authorize("super_admin"), async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find().populate("admin", "name email");

    res.json({
      success: true,
      data: {
        parkingLots,
      },
    });
  } catch (error) {
    console.error("Get parking lots error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching parking lots",
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Private (Super Admin)
router.get("/users", authorize("super_admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
});

// @route   POST /api/admin/hotels
// @desc    Create a new hotel
// @access  Private (Super Admin)
router.post(
  "/hotels",
  [
    body("name").notEmpty().withMessage("Hotel name is required"),
    body("address").notEmpty().withMessage("Hotel address is required"),
    body("description").notEmpty().withMessage("Hotel description is required"),
    body("stars")
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be between 1 and 5"),
    body("amenities").isArray().withMessage("Amenities must be an array"),
    body("rooms").isArray().withMessage("Rooms must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const {
        name,
        address,
        description,
        stars,
        amenities,
        rooms,
        admin,
        contactInfo,
        policies,
      } = req.body;

      // Parse address if it's a string
      let parsedAddress;
      if (typeof address === "string") {
        // Simple address parsing - in production you'd want more robust parsing
        const addressParts = address.split(",").map((part) => part.trim());
        parsedAddress = {
          line1: addressParts[0] || "Airport Drive",
          line2: "",
          city: addressParts[1] || "Dallas",
          state: addressParts[2] || "TX",
          zipCode: addressParts[3] || "75261",
          country: "USA",
        };
      } else {
        parsedAddress = address;
      }

      // Create default rooms if none provided
      const defaultRooms =
        rooms && rooms.length > 0
          ? rooms
          : [
              {
                type: "Standard",
                name: "Standard Room",
                description:
                  "Comfortable standard room with essential amenities",
                price: 150,
                capacity: 2,
                available: 10,
                amenities: ["King Bed", "Free WiFi", "TV", "Air Conditioning"],
                images: [
                  "https://via.placeholder.com/400x300?text=Standard+Room",
                ],
              },
              {
                type: "Deluxe",
                name: "Deluxe Room",
                description: "Spacious deluxe room with premium amenities",
                price: 250,
                capacity: 2,
                available: 5,
                amenities: [
                  "King Bed",
                  "Free WiFi",
                  "TV",
                  "Mini Bar",
                  "Balcony",
                ],
                images: [
                  "https://via.placeholder.com/400x300?text=Deluxe+Room",
                ],
              },
            ];

      const hotel = new Hotel({
        name,
        address: parsedAddress,
        description,
        location: {
          type: "Point",
          coordinates: [-96.797, 32.8968], // DFW Airport coordinates
        },
        distance: "0.5 miles from airport",
        rating: stars,
        images: ["https://via.placeholder.com/400x300?text=Hotel"],
        amenities: amenities || [
          "Free WiFi",
          "Shuttle Service",
          "Restaurant",
          "Fitness Center",
        ],
        contact: {
          phone: contactInfo?.phone || "+1 (555) 123-4567",
          email: contactInfo?.email || "info@hotel.com",
          website: contactInfo?.website || "https://hotel.com",
        },
        policies: {
          checkIn: policies?.checkIn || "3:00 PM",
          checkOut: policies?.checkOut || "11:00 AM",
          cancellation:
            policies?.cancellation ||
            "Free cancellation up to 24 hours before check-in",
          pets: policies?.pets || false,
          smoking: policies?.smoking || false,
        },
        rooms: defaultRooms,
        admin,
      });

      await hotel.save();

      res.status(201).json({
        success: true,
        data: {
          hotel,
        },
        message: "Hotel created successfully",
      });
    } catch (error) {
      console.error("Create hotel error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating hotel",
      });
    }
  }
);

// @route   PUT /api/admin/hotels/:id
// @desc    Update a hotel
// @access  Private (Super Admin)
router.put(
  "/hotels/:id",
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Hotel name cannot be empty"),
    body("stars")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be between 1 and 5"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: {
          hotel: updatedHotel,
        },
        message: "Hotel updated successfully",
      });
    } catch (error) {
      console.error("Update hotel error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating hotel",
      });
    }
  }
);

// @route   POST /api/admin/parking
// @desc    Create a new parking lot
// @access  Private (Super Admin)
router.post(
  "/parking",
  [
    body("name").notEmpty().withMessage("Parking lot name is required"),
    body("address").notEmpty().withMessage("Parking lot address is required"),
    body("description")
      .notEmpty()
      .withMessage("Parking lot description is required"),
    body("totalSpots")
      .isInt({ min: 1 })
      .withMessage("Total spots must be at least 1"),
    body("features").isArray().withMessage("Features must be an array"),
    body("pricing").isObject().withMessage("Pricing must be an object"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const {
        name,
        address,
        description,
        totalSpots,
        features,
        pricing,
        admin,
        contactInfo,
        policies,
      } = req.body;

      // Parse address if it's a string
      let parsedAddress;
      if (typeof address === "string") {
        // Simple address parsing - in production you'd want more robust parsing
        const addressParts = address.split(",").map((part) => part.trim());
        parsedAddress = {
          line1: addressParts[0] || "Airport Drive",
          line2: "",
          city: addressParts[1] || "Dallas",
          state: addressParts[2] || "TX",
          zipCode: addressParts[3] || "75261",
          country: "USA",
        };
      } else {
        parsedAddress = address;
      }

      // Create parking spots
      const parkingSpots = [];
      for (let i = 1; i <= totalSpots; i++) {
        parkingSpots.push({
          spotNumber: `${String.fromCharCode(
            65 + Math.floor((i - 1) / 20)
          )}-${String(i % 20 || 20).padStart(2, "0")}`,
          type: "Standard",
          isAvailable: true,
          isReserved: false,
        });
      }

      const parkingLot = new ParkingLot({
        name,
        address: parsedAddress,
        description,
        location: {
          type: "Point",
          coordinates: [-96.797, 32.8968], // DFW Airport coordinates
        },
        distance: "0.5 miles from terminal",
        pricing,
        capacity: {
          total: totalSpots,
          available: totalSpots,
          covered: Math.floor(totalSpots * 0.3),
          handicap: Math.floor(totalSpots * 0.05),
          electric: Math.floor(totalSpots * 0.1),
        },
        features: features || [
          "Covered Parking",
          "24/7 Security",
          "Shuttle Service",
        ],
        images: ["https://via.placeholder.com/400x300?text=Parking+Lot"],
        operatingHours: {
          open: "24/7",
          close: "24/7",
        },
        contact: {
          phone: contactInfo?.phone || "+1 (555) 123-4567",
          email: contactInfo?.email || "info@dfwparking.com",
        },
        policies: {
          maxStay: policies?.maxStay || 30,
          cancellation:
            policies?.cancellation ||
            "Free cancellation up to 2 hours before arrival",
          oversizedVehicles: policies?.oversizedVehicles || false,
        },
        parkingSpots,
        admin,
      });

      await parkingLot.save();

      res.status(201).json({
        success: true,
        data: {
          parkingLot,
        },
        message: "Parking lot created successfully",
      });
    } catch (error) {
      console.error("Create parking lot error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating parking lot",
      });
    }
  }
);

// @route   PUT /api/admin/parking/:id
// @desc    Update a parking lot
// @access  Private (Super Admin)
router.put(
  "/parking/:id",
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Parking lot name cannot be empty"),
    body("totalSpots")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Total spots must be at least 1"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const parkingLot = await ParkingLot.findById(req.params.id);
      if (!parkingLot) {
        return res.status(404).json({
          success: false,
          message: "Parking lot not found",
        });
      }

      const updatedParkingLot = await ParkingLot.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: {
          parkingLot: updatedParkingLot,
        },
        message: "Parking lot updated successfully",
      });
    } catch (error) {
      console.error("Update parking lot error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating parking lot",
      });
    }
  }
);

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Super Admin)
router.post(
  "/users",
  [
    body("name").notEmpty().withMessage("User name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn([
        "customer",
        "hotel_admin",
        "parking_admin",
        "super_admin",
        "support",
      ])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const { name, email, password, role, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const user = new User({
        name,
        email,
        password,
        role,
        phone,
        address,
      });

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
        },
        message: "User created successfully",
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating user",
      });
    }
  }
);

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private (Super Admin)
router.put(
  "/users/:id",
  [
    body("name").optional().notEmpty().withMessage("User name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("role")
      .optional()
      .isIn([
        "customer",
        "hotel_admin",
        "parking_admin",
        "super_admin",
        "support",
      ])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if email is being changed and if it already exists
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "User with this email already exists",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).select("-password");

      res.json({
        success: true,
        data: {
          user: updatedUser,
        },
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating user",
      });
    }
  }
);

// Get hotel rooms for assigned hotel only
router.get("/hotel/rooms", authorize("hotel_admin"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.assignedHotel) {
      return res.status(403).json({
        success: false,
        message: "No hotel assigned to this admin",
      });
    }

    const hotel = await Hotel.findById(user.assignedHotel);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Assigned hotel not found",
      });
    }

    res.json({
      success: true,
      data: { rooms: hotel.rooms },
    });
  } catch (error) {
    console.error("Error fetching hotel rooms:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hotel rooms",
    });
  }
});

// Create hotel room for assigned hotel only
router.post(
  "/hotel/rooms",
  authorize("hotel_admin"),
  [
    body("type").notEmpty().withMessage("Room type is required"),
    body("name").notEmpty().withMessage("Room name is required"),
    body("description").notEmpty().withMessage("Room description is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("capacity")
      .isInt({ min: 1, max: 10 })
      .withMessage("Capacity must be between 1 and 10"),
    body("available")
      .isInt({ min: 0 })
      .withMessage("Available rooms must be 0 or more"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.user.id);

      if (!user.assignedHotel) {
        return res.status(403).json({
          success: false,
          message: "No hotel assigned to this admin",
        });
      }

      const hotel = await Hotel.findById(user.assignedHotel);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Assigned hotel not found",
        });
      }

      const newRoom = {
        type: req.body.type,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        capacity: req.body.capacity,
        available: req.body.available,
        amenities: req.body.amenities || [],
        images: req.body.images || [
          "https://via.placeholder.com/400x300?text=Room",
        ],
        isActive: true,
      };

      hotel.rooms.push(newRoom);
      await hotel.save();

      res.status(201).json({
        success: true,
        data: { room: newRoom },
        message: "Room created successfully",
      });
    } catch (error) {
      console.error("Error creating hotel room:", error);
      res.status(500).json({
        success: false,
        message: "Error creating hotel room",
      });
    }
  }
);

// Update hotel room for assigned hotel only
router.put(
  "/hotel/rooms/:roomId",
  authorize("hotel_admin"),
  [
    body("type").optional().notEmpty().withMessage("Room type cannot be empty"),
    body("name").optional().notEmpty().withMessage("Room name cannot be empty"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Room description cannot be empty"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("capacity")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("Capacity must be between 1 and 10"),
    body("available")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Available rooms must be 0 or more"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.user.id);

      if (!user.assignedHotel) {
        return res.status(403).json({
          success: false,
          message: "No hotel assigned to this admin",
        });
      }

      const hotel = await Hotel.findById(user.assignedHotel);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Assigned hotel not found",
        });
      }

      const room = hotel.rooms.id(req.params.roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      // Update room fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          room[key] = req.body[key];
        }
      });

      await hotel.save();

      res.json({
        success: true,
        data: { room },
        message: "Room updated successfully",
      });
    } catch (error) {
      console.error("Error updating hotel room:", error);
      res.status(500).json({
        success: false,
        message: "Error updating hotel room",
      });
    }
  }
);

// Delete hotel room for assigned hotel only
router.delete(
  "/hotel/rooms/:roomId",
  authorize("hotel_admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user.assignedHotel) {
        return res.status(403).json({
          success: false,
          message: "No hotel assigned to this admin",
        });
      }

      const hotel = await Hotel.findById(user.assignedHotel);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Assigned hotel not found",
        });
      }

      const room = hotel.rooms.id(req.params.roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      room.remove();
      await hotel.save();

      res.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting hotel room:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting hotel room",
      });
    }
  }
);

// Get hotel bookings for assigned hotel only
router.get("/hotel/bookings", authorize("hotel_admin"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.assignedHotel) {
      return res.status(403).json({
        success: false,
        message: "No hotel assigned to this admin",
      });
    }

    const bookings = await Booking.find({
      "hotel.hotelId": user.assignedHotel,
    }).populate("user", "name email");

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hotel bookings",
    });
  }
});

// Get parking spots for assigned parking lot only
router.get("/parking/spots", authorize("parking_admin"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.assignedParking) {
      return res.status(403).json({
        success: false,
        message: "No parking lot assigned to this admin",
      });
    }

    const parkingLot = await ParkingLot.findById(user.assignedParking);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: "Assigned parking lot not found",
      });
    }

    res.json({
      success: true,
      data: { spots: parkingLot.parkingSpots },
    });
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching parking spots",
    });
  }
});

// Create parking spot for assigned parking lot only
router.post(
  "/parking/spots",
  authorize("parking_admin"),
  [
    body("spotNumber").notEmpty().withMessage("Spot number is required"),
    body("spotType").notEmpty().withMessage("Spot type is required"),
    body("section").notEmpty().withMessage("Section is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.user.id);

      if (!user.assignedParking) {
        return res.status(403).json({
          success: false,
          message: "No parking lot assigned to this admin",
        });
      }

      const parkingLot = await ParkingLot.findById(user.assignedParking);
      if (!parkingLot) {
        return res.status(404).json({
          success: false,
          message: "Assigned parking lot not found",
        });
      }

      const newSpot = {
        spotNumber: req.body.spotNumber,
        type: req.body.spotType,
        section: req.body.section,
        isAvailable: req.body.isAvailable !== false,
        price: req.body.price,
        isReserved: req.body.isReserved || false,
      };

      parkingLot.parkingSpots.push(newSpot);
      await parkingLot.save();

      res.status(201).json({
        success: true,
        data: { spot: newSpot },
        message: "Parking spot created successfully",
      });
    } catch (error) {
      console.error("Error creating parking spot:", error);
      res.status(500).json({
        success: false,
        message: "Error creating parking spot",
      });
    }
  }
);

// Update parking spot for assigned parking lot only
router.put(
  "/parking/spots/:spotId",
  authorize("parking_admin"),
  [
    body("spotNumber")
      .optional()
      .notEmpty()
      .withMessage("Spot number cannot be empty"),
    body("spotType")
      .optional()
      .notEmpty()
      .withMessage("Spot type cannot be empty"),
    body("section")
      .optional()
      .notEmpty()
      .withMessage("Section cannot be empty"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.user.id);

      if (!user.assignedParking) {
        return res.status(403).json({
          success: false,
          message: "No parking lot assigned to this admin",
        });
      }

      const parkingLot = await ParkingLot.findById(user.assignedParking);
      if (!parkingLot) {
        return res.status(404).json({
          success: false,
          message: "Assigned parking lot not found",
        });
      }

      const spot = parkingLot.parkingSpots.id(req.params.spotId);
      if (!spot) {
        return res.status(404).json({
          success: false,
          message: "Parking spot not found",
        });
      }

      // Update spot fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          if (key === "spotType") {
            spot.type = req.body[key];
          } else {
            spot[key] = req.body[key];
          }
        }
      });

      await parkingLot.save();

      res.json({
        success: true,
        data: { spot },
        message: "Parking spot updated successfully",
      });
    } catch (error) {
      console.error("Error updating parking spot:", error);
      res.status(500).json({
        success: false,
        message: "Error updating parking spot",
      });
    }
  }
);

// Delete parking spot for assigned parking lot only
router.delete(
  "/parking/spots/:spotId",
  authorize("parking_admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user.assignedParking) {
        return res.status(403).json({
          success: false,
          message: "No parking lot assigned to this admin",
        });
      }

      const parkingLot = await ParkingLot.findById(user.assignedParking);
      if (!parkingLot) {
        return res.status(404).json({
          success: false,
          message: "Assigned parking lot not found",
        });
      }

      const spot = parkingLot.parkingSpots.id(req.params.spotId);
      if (!spot) {
        return res.status(404).json({
          success: false,
          message: "Parking spot not found",
        });
      }

      spot.remove();
      await parkingLot.save();

      res.json({
        success: true,
        message: "Parking spot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting parking spot:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting parking spot",
      });
    }
  }
);

// Get parking bookings for assigned parking lot only
router.get(
  "/parking/bookings",
  authorize("parking_admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user.assignedParking) {
        return res.status(403).json({
          success: false,
          message: "No parking lot assigned to this admin",
        });
      }

      const bookings = await Booking.find({
        "parking.parkingLotId": user.assignedParking,
      }).populate("user", "name email");

      res.json({
        success: true,
        data: { bookings },
      });
    } catch (error) {
      console.error("Error fetching parking bookings:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching parking bookings",
      });
    }
  }
);

module.exports = router;
