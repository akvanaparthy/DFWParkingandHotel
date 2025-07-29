const fs = require("fs");
const path = require("path");

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dfw-parking

# JWT Configuration
JWT_SECRET=dfw-parking-super-secret-jwt-key-2024
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Configuration (for future use)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
`;

const envPath = path.join(__dirname, ".env");

try {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created successfully!");
  console.log("📁 Location:", envPath);
  console.log("\n🔑 Key environment variables set:");
  console.log("   - JWT_SECRET: dfw-parking-super-secret-jwt-key-2024");
  console.log("   - MONGODB_URI: mongodb://localhost:27017/dfw-parking");
  console.log("   - PORT: 5000");
  console.log("\n🚀 You can now restart the server and try logging in!");
} catch (error) {
  console.error("❌ Error creating .env file:", error.message);
  console.log(
    "\n📝 Please create the .env file manually with the content above."
  );
}
