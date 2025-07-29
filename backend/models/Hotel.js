const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["Standard", "Deluxe", "Suite", "Executive", "Presidential"],
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  available: {
    type: Number,
    required: true,
    min: 0,
  },
  amenities: [
    {
      type: String,
      enum: [
        "King Bed",
        "Queen Bed",
        "Twin Beds",
        "Free WiFi",
        "TV",
        "Mini Bar",
        "Air Conditioning",
        "Balcony",
        "Ocean View",
        "Mountain View",
        "Kitchen",
        "Living Room",
        "Work Desk",
        "Safe",
        "Iron",
        "Hair Dryer",
      ],
    },
  ],
  images: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a hotel name"],
      trim: true,
      maxlength: [100, "Hotel name cannot be more than 100 characters"],
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
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    amenities: [
      {
        type: String,
        enum: [
          "Free WiFi",
          "Shuttle Service",
          "Restaurant",
          "Fitness Center",
          "Pool",
          "Spa",
          "Business Center",
          "Conference Rooms",
          "Free Breakfast",
          "Room Service",
          "Laundry Service",
          "Pet Friendly",
          "Accessible",
          "Parking",
          "Airport Shuttle",
        ],
      },
    ],
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      website: String,
    },
    policies: {
      checkIn: {
        type: String,
        default: "3:00 PM",
      },
      checkOut: {
        type: String,
        default: "11:00 AM",
      },
      cancellation: {
        type: String,
        default: "Free cancellation up to 24 hours before check-in",
      },
      pets: {
        type: Boolean,
        default: false,
      },
      smoking: {
        type: Boolean,
        default: false,
      },
    },
    rooms: [roomSchema],
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
hotelSchema.index({ location: "2dsphere" });
hotelSchema.index({ "address.city": 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ isActive: 1 });

// Virtual for full address
hotelSchema.virtual("fullAddress").get(function () {
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

// Method to get available rooms
hotelSchema.methods.getAvailableRooms = function () {
  return this.rooms.filter((room) => room.available > 0 && room.isActive);
};

// Method to update room availability
hotelSchema.methods.updateRoomAvailability = function (roomId, quantity) {
  const room = this.rooms.id(roomId);
  if (room) {
    room.available = Math.max(0, room.available - quantity);
    return this.save();
  }
  throw new Error("Room not found");
};

// Ensure virtual fields are serialized
hotelSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Hotel", hotelSchema);
