const express = require("express");
const { body, query, validationResult } = require("express-validator");
const User = require("../models/User");
const Booking = require("../models/Booking");
const SupportTicket = require("../models/SupportTicket");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all support routes
router.use(auth);
router.use(authorize("support"));

// @route   GET /api/support/dashboard
// @desc    Get support dashboard statistics
// @access  Private (Support)
router.get("/dashboard", async (req, res) => {
  try {
    const [totalUsers, totalBookings, pendingBookings, recentBookings] =
      await Promise.all([
        User.countDocuments({ role: "customer" }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: "pending" }),
        Booking.find()
          .populate("user", "name email")
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalBookings,
          pendingBookings,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Support dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
});

// @route   GET /api/support/users
// @desc    Get customer users for support
// @access  Private (Support)
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

      const { page = 1, limit = 10, search } = req.query;

      const filter = { role: "customer" };
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
      console.error("Get support users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching users",
      });
    }
  }
);

// @route   GET /api/support/users/:id
// @desc    Get customer details for support
// @access  Private (Support)
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's booking history
    const bookings = await Booking.find({ user: req.params.id })
      .populate("hotel.hotelId", "name address")
      .populate("parking.parkingLotId", "name address")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        user,
        bookings,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user details",
    });
  }
});

// @route   GET /api/support/bookings
// @desc    Get bookings for support assistance
// @access  Private (Support)
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

      const { page = 1, limit = 10, status, type, search } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;

      // If search is provided, look for bookings by user name/email
      if (search) {
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }).select("_id");

        filter.user = { $in: users.map((u) => u._id) };
      }

      const bookings = await Booking.find(filter)
        .populate("user", "name email phone")
        .populate("hotel.hotelId", "name address")
        .populate("parking.parkingLotId", "name address")
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
      console.error("Get support bookings error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching bookings",
      });
    }
  }
);

// @route   GET /api/support/bookings/:id
// @desc    Get booking details for support
// @access  Private (Support)
router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("hotel.hotelId", "name address contact")
      .populate("parking.parkingLotId", "name address contact");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Get booking details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booking details",
    });
  }
});

// @route   PUT /api/support/bookings/:id
// @desc    Update booking for support assistance
// @access  Private (Support)
router.put(
  "/bookings/:id",
  [
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
    body("notes").optional().trim(),
    body("specialRequests").optional().trim(),
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

      const { status, notes, specialRequests } = req.body;

      if (status !== undefined) booking.status = status;
      if (notes !== undefined) booking.notes = notes;
      if (specialRequests !== undefined)
        booking.specialRequests = specialRequests;

      await booking.save();

      res.json({
        success: true,
        message: "Booking updated successfully",
        data: {
          booking,
        },
      });
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating booking",
      });
    }
  }
);

// @route   GET /api/support/tickets
// @desc    Get all support tickets with filtering
// @access  Private (Support)
router.get(
  "/tickets",
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
      .isIn(["open", "in_progress", "resolved", "closed"])
      .withMessage("Invalid status"),
    query("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
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

      const { page = 1, limit = 10, status, priority, search } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (search) {
        filter.$or = [
          { subject: { $regex: search, $options: "i" } },
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ];
      }

      const tickets = await SupportTicket.find(filter)
        .populate("assignedTo", "name email")
        .populate("relatedBooking", "type status")
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const total = await SupportTicket.countDocuments(filter);

      res.json({
        success: true,
        data: {
          tickets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching tickets",
      });
    }
  }
);

// @route   POST /api/support/tickets
// @desc    Create a new support ticket
// @access  Private
router.post(
  "/tickets",
  [
    auth,
    body("subject")
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Subject must be between 5 and 200 characters"),
    body("message")
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Message must be between 10 and 2000 characters"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
    body("category")
      .optional()
      .isIn(["booking", "payment", "technical", "service", "other"])
      .withMessage("Invalid category"),
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
        subject,
        message,
        priority = "medium",
        category = "other",
      } = req.body;

      const ticket = new SupportTicket({
        customer: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
        subject,
        message,
        priority,
        category,
      });

      await ticket.save();

      res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        data: {
          ticket,
        },
      });
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating ticket",
      });
    }
  }
);

// @route   PUT /api/support/tickets/:id
// @desc    Update support ticket
// @access  Private (Support)
router.put(
  "/tickets/:id",
  [
    auth,
    authorize("support"),
    body("status")
      .optional()
      .isIn(["open", "in_progress", "resolved", "closed"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
    body("resolution").optional().trim(),
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

      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      const { status, priority, resolution } = req.body;

      if (status) {
        await ticket.updateStatus(status, req.user.id);
      }
      if (priority) ticket.priority = priority;
      if (resolution) {
        await ticket.resolveTicket(resolution, req.user.id);
      }

      await ticket.save();

      res.json({
        success: true,
        message: "Ticket updated successfully",
        data: {
          ticket,
        },
      });
    } catch (error) {
      console.error("Update ticket error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating ticket",
      });
    }
  }
);

// @route   POST /api/support/tickets/:id/assign
// @desc    Assign ticket to support agent
// @access  Private (Support)
router.post(
  "/tickets/:id/assign",
  [auth, authorize("support")],
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      await ticket.assignTicket(req.user.id);

      res.json({
        success: true,
        message: "Ticket assigned successfully",
        data: {
          ticket,
        },
      });
    } catch (error) {
      console.error("Assign ticket error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while assigning ticket",
      });
    }
  }
);

// @route   GET /api/support/issues
// @desc    Get common support issues and solutions
// @access  Private (Support)
router.get("/issues", async (req, res) => {
  try {
    const commonIssues = [
      {
        category: "Booking Issues",
        issues: [
          {
            title: "Cannot complete booking",
            description: "User unable to complete hotel or parking booking",
            solutions: [
              "Check if room/spot is still available",
              "Verify payment method is valid",
              "Clear browser cache and try again",
            ],
          },
          {
            title: "Booking confirmation not received",
            description: "User did not receive booking confirmation email",
            solutions: [
              "Check spam/junk folder",
              "Verify email address is correct",
              "Resend confirmation email",
            ],
          },
        ],
      },
      {
        category: "Payment Issues",
        issues: [
          {
            title: "Payment declined",
            description: "Credit card or payment method declined",
            solutions: [
              "Verify card details are correct",
              "Check if card has sufficient funds",
              "Try alternative payment method",
            ],
          },
          {
            title: "Double charge",
            description: "User charged twice for same booking",
            solutions: [
              "Verify if both charges went through",
              "Initiate refund for duplicate charge",
              "Contact payment processor if needed",
            ],
          },
        ],
      },
      {
        category: "Cancellation Issues",
        issues: [
          {
            title: "Cannot cancel booking",
            description: "User unable to cancel existing booking",
            solutions: [
              "Check cancellation policy",
              "Verify booking is within cancellation window",
              "Manual cancellation by support if needed",
            ],
          },
          {
            title: "Refund not received",
            description: "Refund not processed after cancellation",
            solutions: [
              "Check refund processing time (3-5 business days)",
              "Verify original payment method",
              "Contact payment processor if delayed",
            ],
          },
        ],
      },
    ];

    res.json({
      success: true,
      data: {
        commonIssues,
      },
    });
  } catch (error) {
    console.error("Get support issues error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching support issues",
    });
  }
});

module.exports = router;
