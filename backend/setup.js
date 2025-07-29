const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 DFW Parking Backend Setup\n");

// Check if .env exists
const envPath = path.join(__dirname, ".env");
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log("📝 Creating .env file...");

  // Copy from example
  const examplePath = path.join(__dirname, "env.example");
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log("✅ .env file created from env.example");
  } else {
    console.log("❌ env.example not found");
    process.exit(1);
  }
} else {
  console.log("✅ .env file already exists");
}

// Database setup options
console.log("\n🗄️  Database Setup Options:");
console.log("1. Local MongoDB (requires MongoDB installed)");
console.log("2. MongoDB Atlas (cloud - recommended)");
console.log("3. Skip for now (use existing config)");

rl.question("\nChoose an option (1-3): ", async (answer) => {
  try {
    switch (answer) {
      case "1":
        await setupLocalMongoDB();
        break;
      case "2":
        await setupMongoDBAtlas();
        break;
      case "3":
        console.log("⏭️  Skipping database setup");
        break;
      default:
        console.log("❌ Invalid option");
        process.exit(1);
    }

    console.log("\n🎉 Setup complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Install dependencies: npm install");
    console.log("2. Start MongoDB (if using local)");
    console.log("3. Seed database: npm run seed");
    console.log("4. Start server: npm run dev");

    rl.close();
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    rl.close();
    process.exit(1);
  }
});

async function setupLocalMongoDB() {
  console.log("\n🏠 Setting up Local MongoDB...");

  // Update .env for local MongoDB
  const envContent = fs.readFileSync(envPath, "utf8");
  const updatedContent = envContent
    .replace(
      /MONGODB_URI=.*/,
      "MONGODB_URI=mongodb://localhost:27017/dfw-parking"
    )
    .replace(/NODE_ENV=.*/, "NODE_ENV=development");

  fs.writeFileSync(envPath, updatedContent);

  console.log("✅ Local MongoDB configuration set");
  console.log("📋 Make sure MongoDB is installed and running:");
  console.log("   - Windows: net start MongoDB");
  console.log("   - macOS/Linux: sudo systemctl start mongod");
}

async function setupMongoDBAtlas() {
  console.log("\n☁️  Setting up MongoDB Atlas...");

  const connectionString = await new Promise((resolve) => {
    rl.question("Enter your MongoDB Atlas connection string: ", (answer) => {
      resolve(answer.trim());
    });
  });

  if (!connectionString || !connectionString.includes("mongodb+srv://")) {
    console.log("❌ Invalid connection string");
    return;
  }

  // Update .env for MongoDB Atlas
  const envContent = fs.readFileSync(envPath, "utf8");
  const updatedContent = envContent
    .replace(/MONGODB_URI=.*/, `MONGODB_URI=${connectionString}`)
    .replace(/NODE_ENV=.*/, "NODE_ENV=development");

  fs.writeFileSync(envPath, updatedContent);

  console.log("✅ MongoDB Atlas configuration set");
  console.log("📋 Your database will be stored in the cloud");
}

// Handle process exit
process.on("SIGINT", () => {
  console.log("\n👋 Setup cancelled");
  rl.close();
  process.exit(0);
});
