const mongoose = require("mongoose");

const parkingSpotSchema = new mongoose.Schema({
  spotNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Standard", "Covered", "Handicap", "Electric", "Oversized"],
    default: "Standard",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
});

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a parking lot name"],
      trim: true,
      maxlength: [100, "Parking lot name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    address: {
      line1: {
        type: String,
        required: true,
      },
      line2: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "USA",
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    distance: {
      type: String,
      required: true,
    },
    pricing: {
      hourly: {
        type: Number,
        required: true,
        min: 0,
      },
      daily: {
        type: Number,
        required: true,
        min: 0,
      },
      weekly: {
        type: Number,
        min: 0,
      },
      monthly: {
        type: Number,
        min: 0,
      },
    },
    capacity: {
      total: {
        type: Number,
        required: true,
        min: 1,
      },
      available: {
        type: Number,
        required: true,
        min: 0,
      },
      covered: {
        type: Number,
        default: 0,
      },
      handicap: {
        type: Number,
        default: 0,
      },
      electric: {
        type: Number,
        default: 0,
      },
    },
    features: [
      {
        type: String,
        enum: [
          "Covered Parking",
          "24/7 Security",
          "Shuttle Service",
          "Quick Access",
          "Electric Charging",
          "Handicap Accessible",
          "Oversized Vehicle",
          "Valet Service",
          "Car Wash",
          "Oil Change",
          "Tire Service",
        ],
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    operatingHours: {
      open: {
        type: String,
        default: "24/7",
      },
      close: {
        type: String,
        default: "24/7",
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    policies: {
      maxStay: {
        type: Number,
        default: 30, // days
      },
      cancellation: {
        type: String,
        default: "Free cancellation up to 2 hours before arrival",
      },
      oversizedVehicles: {
        type: Boolean,
        default: false,
      },
    },
    parkingSpots: [parkingSpotSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
parkingLotSchema.index({ location: "2dsphere" });
parkingLotSchema.index({ "address.city": 1 });
parkingLotSchema.index({ isActive: 1 });
parkingLotSchema.index({ "capacity.available": -1 });

// Virtual for full address
parkingLotSchema.virtual("fullAddress").get(function () {
  const addressParts = [this.address.line1];
  if (this.address.line2) {
    addressParts.push(this.address.line2);
  }
  addressParts.push(
    `${this.address.city}, ${this.address.state} ${this.address.zipCode}`
  );
  if (this.address.country && this.address.country !== "USA") {
    addressParts.push(this.address.country);
  }
  return addressParts.join(", ");
});

// Virtual for availability percentage
parkingLotSchema.virtual("availabilityPercentage").get(function () {
  return Math.round((this.capacity.available / this.capacity.total) * 100);
});

// Method to get available spots
parkingLotSchema.methods.getAvailableSpots = function () {
  return this.parkingSpots.filter(
    (spot) => spot.isAvailable && !spot.isReserved
  );
};

// Method to update spot availability
parkingLotSchema.methods.updateSpotAvailability = function (
  spotId,
  isAvailable,
  bookingId = null
) {
  const spot = this.parkingSpots.id(spotId);
  if (spot) {
    spot.isAvailable = isAvailable;
    spot.currentBooking = bookingId;
    this.capacity.available = this.parkingSpots.filter(
      (s) => s.isAvailable
    ).length;
    return this.save();
  }
  throw new Error("Parking spot not found");
};

// Method to find nearest available spot
parkingLotSchema.methods.findNearestAvailableSpot = function (
  spotType = "Standard"
) {
  return this.parkingSpots.find(
    (spot) => spot.isAvailable && !spot.isReserved && spot.type === spotType
  );
};

// Ensure virtual fields are serialized
parkingLotSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("ParkingLot", parkingLotSchema);
