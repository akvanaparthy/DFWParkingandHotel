const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const ParkingLot = require("../models/ParkingLot");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings with filtering
// @access  Private
router.get(
  "/",
  [
    auth,
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

      const filter = { user: req.user.id };
      if (status) filter.status = status;
      if (type) filter.type = type;

      const bookings = await Booking.find(filter)
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
      console.error("Get bookings error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching bookings",
      });
    }
  }
);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post(
  "/",
  [
    auth,
    body("type")
      .isIn(["hotel", "parking", "both"])
      .withMessage("Invalid booking type"),
    body("payment.method")
      .isIn(["credit_card", "debit_card", "paypal", "stripe"])
      .withMessage("Invalid payment method"),
    body("payment.amount")
      .isFloat({ min: 0 })
      .withMessage("Payment amount must be positive"),
    body("pricing.total")
      .isFloat({ min: 0 })
      .withMessage("Total price must be positive"),
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

      const bookingData = {
        ...req.body,
        user: req.user.id,
      };

      // Validate hotel booking data
      if (bookingData.type === "hotel" || bookingData.type === "both") {
        if (!bookingData.hotel.hotelId || !bookingData.hotel.roomId) {
          return res.status(400).json({
            success: false,
            message:
              "Hotel and room information is required for hotel bookings",
          });
        }

        // Check room availability
        const hotel = await Hotel.findById(bookingData.hotel.hotelId);
        if (!hotel) {
          return res.status(404).json({
            success: false,
            message: "Hotel not found",
          });
        }

        const room = hotel.rooms.id(bookingData.hotel.roomId);
        if (!room || room.available < 1) {
          return res.status(400).json({
            success: false,
            message: "Room is not available",
          });
        }
      }

      // Validate parking booking data
      if (bookingData.type === "parking" || bookingData.type === "both") {
        if (!bookingData.parking.parkingLotId) {
          return res.status(400).json({
            success: false,
            message: "Parking lot information is required for parking bookings",
          });
        }

        // For standalone parking bookings, spotId is required
        if (bookingData.type === "parking" && !bookingData.parking.spotId) {
          return res.status(400).json({
            success: false,
            message:
              "Parking spot information is required for standalone parking bookings",
          });
        }

        // Check parking lot availability
        const parkingLot = await ParkingLot.findById(
          bookingData.parking.parkingLotId
        );
        if (!parkingLot) {
          return res.status(404).json({
            success: false,
            message: "Parking lot not found",
          });
        }

        // For standalone parking bookings, check spot availability
        if (bookingData.type === "parking") {
          const spot = parkingLot.parkingSpots.id(bookingData.parking.spotId);
          if (!spot || !spot.isAvailable || spot.isReserved) {
            return res.status(400).json({
              success: false,
              message: "Parking spot is not available",
            });
          }
        }
      }

      const booking = new Booking(bookingData);
      await booking.save();

      // Update availability
      if (bookingData.type === "hotel" || bookingData.type === "both") {
        await hotel.updateRoomAvailability(bookingData.hotel.roomId, 1);
      }

      if (bookingData.type === "parking" || bookingData.type === "both") {
        // For standalone parking bookings, update spot availability
        if (bookingData.type === "parking") {
          await parkingLot.updateSpotAvailability(
            bookingData.parking.spotId,
            false,
            booking._id
          );
        }
        // For hotel + parking bookings, we don't need to update specific spots
        // since the hotel manages its own parking availability
      }

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: {
          booking,
        },
      });
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating booking",
      });
    }
  }
);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hotel.hotelId", "name address")
      .populate("parking.parkingLotId", "name address");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking or is admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booking",
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking or is admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Only allow certain updates
    const allowedUpdates = ["specialRequests", "notes"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(booking, updates);
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
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete(
  "/:id",
  [auth, body("reason").optional().trim()],
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Check if user owns this booking or is admin
      if (
        booking.user.toString() !== req.user.id &&
        req.user.role !== "super_admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check if booking can be cancelled
      if (booking.status === "cancelled" || booking.status === "completed") {
        return res.status(400).json({
          success: false,
          message: "Booking cannot be cancelled",
        });
      }

      const reason = req.body.reason || "Cancelled by user";
      await booking.cancelBooking(reason);

      // Update availability
      if (booking.type === "hotel" || booking.type === "both") {
        const hotel = await Hotel.findById(booking.hotel.hotelId);
        if (hotel) {
          await hotel.updateRoomAvailability(booking.hotel.roomId, -1);
        }
      }

      if (booking.type === "parking" || booking.type === "both") {
        const parkingLot = await ParkingLot.findById(
          booking.parking.parkingLotId
        );
        if (parkingLot) {
          await parkingLot.updateSpotAvailability(
            booking.parking.spotId,
            true,
            null
          );
        }
      }

      res.json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          booking,
        },
      });
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while cancelling booking",
      });
    }
  }
);

module.exports = router;
