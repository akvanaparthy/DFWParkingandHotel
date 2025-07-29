const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["hotel", "parking", "both"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
      default: "pending",
    },
    // Hotel booking details
    hotel: {
      hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      checkIn: Date,
      checkOut: Date,
      guests: {
        type: Number,
        min: 1,
        max: 10,
      },
      roomType: String,
      amenities: [String],
      roomPrice: Number,
    },
    // Parking booking details
    parking: {
      parkingLotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingLot",
      },
      spotId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      checkIn: Date,
      checkOut: Date,
      vehicleInfo: {
        make: String,
        model: String,
        color: String,
        licensePlate: String,
      },
      spotType: {
        type: String,
        enum: ["Standard", "Covered", "Handicap", "Electric", "Oversized"],
        default: "Standard",
      },
      spotPrice: Number,
    },
    // Payment information
    payment: {
      method: {
        type: String,
        enum: ["credit_card", "debit_card", "paypal", "stripe"],
        required: true,
      },
      transactionId: String,
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      stripePaymentIntentId: String,
    },
    // Pricing breakdown
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      fees: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    // Additional information
    specialRequests: String,
    cancellationReason: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    notes: String,
    // Timestamps for tracking
    confirmedAt: Date,
    cancelledAt: Date,
    completedAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ type: 1 });
bookingSchema.index({ "hotel.checkIn": 1 });
bookingSchema.index({ "parking.checkIn": 1 });
bookingSchema.index({ "payment.status": 1 });

// Virtual for booking duration
bookingSchema.virtual("duration").get(function () {
  if (this.type === "hotel" && this.hotel.checkIn && this.hotel.checkOut) {
    return Math.ceil(
      (this.hotel.checkOut - this.hotel.checkIn) / (1000 * 60 * 60 * 24)
    );
  }
  if (
    this.type === "parking" &&
    this.parking.checkIn &&
    this.parking.checkOut
  ) {
    return Math.ceil(
      (this.parking.checkOut - this.parking.checkIn) / (1000 * 60 * 60 * 24)
    );
  }
  return 0;
});

// Virtual for is active booking
bookingSchema.virtual("isActive").get(function () {
  const now = new Date();
  if (this.type === "hotel") {
    return (
      this.hotel.checkIn <= now &&
      this.hotel.checkOut >= now &&
      this.status === "confirmed"
    );
  }
  if (this.type === "parking") {
    return (
      this.parking.checkIn <= now &&
      this.parking.checkOut >= now &&
      this.status === "confirmed"
    );
  }
  return false;
});

// Method to calculate total amount
bookingSchema.methods.calculateTotal = function () {
  let total = this.pricing.subtotal;
  total += this.pricing.taxes;
  total += this.pricing.fees;
  total -= this.pricing.discount;
  return total;
};

// Method to cancel booking
bookingSchema.methods.cancelBooking = function (reason = "") {
  this.status = "cancelled";
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Method to complete booking
bookingSchema.methods.completeBooking = function () {
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

// Method to process refund
bookingSchema.methods.processRefund = function (amount) {
  this.status = "refunded";
  this.refundAmount = amount;
  this.refundedAt = new Date();
  this.payment.status = "refunded";
  return this.save();
};

// Ensure virtual fields are serialized
bookingSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);
