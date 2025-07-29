const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const User = require("../models/User");
const Hotel = require("../models/Hotel");
const ParkingLot = require("../models/ParkingLot");
const SupportTicket = require("../models/SupportTicket");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/dfw-parking"
    );
    console.log("📦 MongoDB Connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Sample users data
const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "customer",
    phone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      country: "USA",
    },
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "customer",
    phone: "+1-555-0124",
    address: {
      street: "456 Oak Ave",
      city: "Fort Worth",
      state: "TX",
      zipCode: "76102",
      country: "USA",
    },
  },
  {
    name: "Hotel Manager",
    email: "hotel@dfwparking.com",
    password: "password123",
    role: "hotel_admin",
    phone: "+1-555-0125",
  },
  {
    name: "Parking Manager",
    email: "parking@dfwparking.com",
    password: "password123",
    role: "parking_admin",
    phone: "+1-555-0126",
  },
  {
    name: "Super Admin",
    email: "admin@dfwparking.com",
    password: "password123",
    role: "super_admin",
    phone: "+1-555-0127",
  },
  {
    name: "Support Agent",
    email: "support@dfwparking.com",
    password: "password123",
    role: "support",
    phone: "+1-555-0128",
  },
];

// Sample hotels data
const hotels = [
  {
    name: "DFW Airport Marriott",
    description:
      "Luxury hotel located just minutes from DFW Airport with shuttle service and premium amenities.",
    address: {
      street: "8440 Freeport Parkway",
      city: "Irving",
      state: "TX",
      zipCode: "75063",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-96.8519, 32.8968],
    },
    distance: "0.5 miles from DFW",
    rating: 4.5,
    totalReviews: 1250,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    ],
    amenities: [
      "Free WiFi",
      "Shuttle Service",
      "Restaurant",
      "Fitness Center",
      "Pool",
      "Business Center",
      "Free Breakfast",
      "Room Service",
    ],
    contact: {
      phone: "+1-972-929-8400",
      email: "info@dfwmarriott.com",
      website: "https://www.marriott.com",
    },
    rooms: [
      {
        type: "Standard",
        name: "Standard King Room",
        description: "Comfortable room with king bed and city view",
        price: 129,
        capacity: 2,
        available: 15,
        amenities: ["King Bed", "Free WiFi", "TV", "Air Conditioning"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        ],
      },
      {
        type: "Deluxe",
        name: "Deluxe Suite",
        description: "Spacious suite with separate living area",
        price: 199,
        capacity: 4,
        available: 8,
        amenities: ["King Bed", "Living Room", "Kitchen", "Balcony"],
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        ],
      },
      {
        type: "Executive",
        name: "Executive King",
        description: "Premium room with executive lounge access",
        price: 249,
        capacity: 2,
        available: 5,
        amenities: ["King Bed", "Free WiFi", "Mini Bar"],
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89436dece?w=800",
        ],
      },
    ],
  },
  {
    name: "Hilton DFW Lakes",
    description:
      "Modern hotel with lake views and excellent airport accessibility.",
    address: {
      street: "1800 Highway 26 East",
      city: "Grapevine",
      state: "TX",
      zipCode: "76051",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-96.9989, 32.9343],
    },
    distance: "1.2 miles from DFW",
    rating: 4.3,
    totalReviews: 890,
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
    ],
    amenities: [
      "Free WiFi",
      "Shuttle Service",
      "Restaurant",
      "Fitness Center",
      "Pool",
      "Spa",
      "Business Center",
      "Conference Rooms",
    ],
    contact: {
      phone: "+1-817-481-8444",
      email: "info@hiltondfw.com",
      website: "https://www.hilton.com",
    },
    rooms: [
      {
        type: "Standard",
        name: "Standard Double Room",
        description: "Comfortable room with two queen beds",
        price: 119,
        capacity: 4,
        available: 20,
        amenities: ["Queen Bed", "Free WiFi", "TV", "Air Conditioning"],
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        ],
      },
      {
        type: "Deluxe",
        name: "Deluxe King Room",
        description: "Spacious room with king bed and lake view",
        price: 159,
        capacity: 2,
        available: 12,
        amenities: ["King Bed", "Free WiFi", "Balcony"],
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89436dece?w=800",
        ],
      },
    ],
  },
  {
    name: "Hyatt Regency DFW",
    description: "Connected to DFW Airport via SkyLink with premium amenities.",
    address: {
      street: "2334 North International Parkway",
      city: "Dallas",
      state: "TX",
      zipCode: "75261",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-96.8519, 32.8968],
    },
    distance: "0.1 miles from DFW",
    rating: 4.7,
    totalReviews: 2100,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    ],
    amenities: [
      "Free WiFi",
      "Airport Shuttle",
      "Restaurant",
      "Fitness Center",
      "Pool",
      "Spa",
      "Business Center",
      "Free Breakfast",
    ],
    contact: {
      phone: "+1-972-453-1234",
      email: "info@hyattdfw.com",
      website: "https://www.hyatt.com",
    },
    rooms: [
      {
        type: "Standard",
        name: "Regency King Room",
        description: "Comfortable room with king bed and airport views",
        price: 179,
        capacity: 2,
        available: 25,
        amenities: ["King Bed", "Free WiFi", "TV", "Air Conditioning"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        ],
      },
      {
        type: "Suite",
        name: "Regency Suite",
        description: "Luxury suite with separate living and dining areas",
        price: 299,
        capacity: 6,
        available: 10,
        amenities: ["King Bed", "Living Room", "Kitchen"],
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        ],
      },
    ],
  },
];

// Sample support tickets data
const supportTickets = [
  {
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-0123",
    },
    subject: "Parking spot not available",
    message:
      "I booked parking spot A-15 but it was occupied when I arrived. This caused me to miss my flight. Please help resolve this issue.",
    status: "open",
    priority: "high",
    category: "booking",
  },
  {
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-0129",
    },
    subject: "Hotel booking confirmation",
    message:
      "I haven't received my hotel booking confirmation email. I need this for my business trip tomorrow.",
    status: "in_progress",
    priority: "medium",
    category: "booking",
  },
  {
    customer: {
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "+1-555-0130",
    },
    subject: "Shuttle service delay",
    message:
      "The shuttle from parking to airport was 20 minutes late. This is unacceptable for a premium service.",
    status: "resolved",
    priority: "low",
    category: "service",
  },
  {
    customer: {
      name: "Lisa Wilson",
      email: "lisa@example.com",
      phone: "+1-555-0131",
    },
    subject: "Payment issue",
    message:
      "I was charged twice for the same parking reservation. Please refund the duplicate charge immediately.",
    status: "open",
    priority: "urgent",
    category: "payment",
  },
];

// Sample parking lots data
const parkingLots = [
  {
    name: "DFW Airport Express Parking",
    description:
      "Convenient parking with 24/7 shuttle service to all DFW terminals.",
    address: {
      street: "2400 Aviation Drive",
      city: "Dallas",
      state: "TX",
      zipCode: "75261",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-96.8519, 32.8968],
    },
    distance: "0.3 miles from DFW",
    pricing: {
      hourly: 8,
      daily: 15,
      weekly: 85,
      monthly: 250,
    },
    capacity: {
      total: 500,
      available: 350,
      covered: 100,
      handicap: 20,
      electric: 15,
    },
    features: [
      "Covered Parking",
      "24/7 Security",
      "Shuttle Service",
      "Quick Access",
      "Electric Charging",
      "Handicap Accessible",
    ],
    images: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    ],
    contact: {
      phone: "+1-972-973-3111",
      email: "parking@dfwairport.com",
    },
    parkingSpots: Array.from({ length: 500 }, (_, i) => ({
      spotNumber: `A${String(i + 1).padStart(3, "0")}`,
      type:
        i < 100
          ? "Covered"
          : i < 120
          ? "Handicap"
          : i < 135
          ? "Electric"
          : "Standard",
      isAvailable: Math.random() > 0.3,
      isReserved: false,
    })),
  },
  {
    name: "Premier Parking DFW",
    description: "Premium parking with valet service and car wash options.",
    address: {
      street: "1800 Highway 26 East",
      city: "Grapevine",
      state: "TX",
      zipCode: "76051",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-96.9989, 32.9343],
    },
    distance: "1.5 miles from DFW",
    pricing: {
      hourly: 12,
      daily: 22,
      weekly: 120,
      monthly: 350,
    },
    capacity: {
      total: 300,
      available: 200,
      covered: 150,
      handicap: 15,
      electric: 20,
    },
    features: [
      "Covered Parking",
      "24/7 Security",
      "Shuttle Service",
      "Valet Service",
      "Car Wash",
      "Electric Charging",
      "Handicap Accessible",
    ],
    images: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    ],
    contact: {
      phone: "+1-817-481-8444",
      email: "info@premierparkingdfw.com",
    },
    parkingSpots: Array.from({ length: 300 }, (_, i) => ({
      spotNumber: `P${String(i + 1).padStart(3, "0")}`,
      type:
        i < 150
          ? "Covered"
          : i < 165
          ? "Handicap"
          : i < 185
          ? "Electric"
          : "Standard",
      isAvailable: Math.random() > 0.4,
      isReserved: false,
    })),
  },
  {
    name: "Economy Parking DFW",
    description: "Affordable parking with reliable shuttle service.",
    address: {
      street: "3200 East Airfield Drive",
      city: "Dallas",
      state: "TX",
      zipCode: "75261",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-96.8519, 32.8968],
    },
    distance: "0.8 miles from DFW",
    pricing: {
      hourly: 5,
      daily: 10,
      weekly: 60,
      monthly: 180,
    },
    capacity: {
      total: 800,
      available: 600,
      covered: 0,
      handicap: 40,
      electric: 10,
    },
    features: [
      "24/7 Security",
      "Shuttle Service",
      "Quick Access",
      "Handicap Accessible",
      "Oversized Vehicle",
    ],
    images: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    ],
    contact: {
      phone: "+1-972-973-3112",
      email: "economy@dfwairport.com",
    },
    parkingSpots: Array.from({ length: 800 }, (_, i) => ({
      spotNumber: `E${String(i + 1).padStart(3, "0")}`,
      type: i < 40 ? "Handicap" : i < 50 ? "Electric" : "Standard",
      isAvailable: Math.random() > 0.25,
      isReserved: false,
    })),
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await ParkingLot.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.name} (${user.role})`);
    }

    // Create hotels
    for (const hotelData of hotels) {
      const hotel = new Hotel(hotelData);
      await hotel.save();
      console.log(`🏨 Created hotel: ${hotel.name}`);
    }

    // Create parking lots
    for (const parkingData of parkingLots) {
      const parkingLot = new ParkingLot(parkingData);
      await parkingLot.save();
      console.log(`🅿️  Created parking lot: ${parkingLot.name}`);
    }

    // Create support tickets
    for (const ticketData of supportTickets) {
      const ticket = new SupportTicket(ticketData);
      await ticket.save();
      console.log(`🎫 Created support ticket: ${ticket.subject}`);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👤 Users: ${createdUsers.length}`);
    console.log(`   🏨 Hotels: ${hotels.length}`);
    console.log(`   🅿️  Parking Lots: ${parkingLots.length}`);
    console.log(`   🎫 Support Tickets: ${supportTickets.length}`);

    console.log("\n🔑 Demo Credentials:");
    console.log("   Customer: john@example.com / password123");
    console.log("   Hotel Admin: hotel@dfwparking.com / password123");
    console.log("   Parking Admin: parking@dfwparking.com / password123");
    console.log("   Super Admin: admin@dfwparking.com / password123");
    console.log("   Support: support@dfwparking.com / password123");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run seeding
connectDB().then(seedDatabase);
