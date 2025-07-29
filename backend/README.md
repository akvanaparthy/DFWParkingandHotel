# DFW Parking Backend API

A comprehensive backend API for the DFW Parking and Hotel Booking Platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Hotel Management**: Complete hotel booking system with room availability
- **Parking Management**: Parking lot booking with spot management
- **Booking System**: Unified booking system for hotels and parking
- **User Management**: Multi-role user system (customer, admin, support)
- **Real-time Availability**: Dynamic availability checking
- **Payment Integration**: Stripe payment processing
- **Email Notifications**: Automated email notifications
- **File Upload**: Image upload for hotels and parking lots
- **Rate Limiting**: API rate limiting for security
- **Validation**: Comprehensive input validation
- **Error Handling**: Centralized error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **File Upload**: multer
- **Email**: nodemailer
- **Payments**: Stripe
- **Security**: helmet, cors, rate limiting
- **Logging**: morgan

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dfw-parking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

Make sure MongoDB is running, then seed the database:

```bash
npm run seed
```

### 4. Start the Server

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📊 Database Seeding

The seed script creates sample data including:

- **Users**: 6 users with different roles
- **Hotels**: 3 hotels with rooms and amenities
- **Parking Lots**: 3 parking lots with spots

### Demo Credentials

```
Customer: john@example.com / password123
Hotel Admin: hotel@dfwparking.com / password123
Parking Admin: parking@dfwparking.com / password123
Super Admin: admin@dfwparking.com / password123
Support: support@dfwparking.com / password123
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                    | Description       | Access  |
| ------ | --------------------------- | ----------------- | ------- |
| POST   | `/api/auth/register`        | Register new user | Public  |
| POST   | `/api/auth/login`           | Login user        | Public  |
| GET    | `/api/auth/me`              | Get current user  | Private |
| POST   | `/api/auth/logout`          | Logout user       | Private |
| PUT    | `/api/auth/change-password` | Change password   | Private |
| POST   | `/api/auth/forgot-password` | Reset password    | Public  |

### Hotels

| Method | Endpoint                       | Description          | Access |
| ------ | ------------------------------ | -------------------- | ------ |
| GET    | `/api/hotels`                  | Get all hotels       | Public |
| GET    | `/api/hotels/:id`              | Get hotel by ID      | Public |
| GET    | `/api/hotels/:id/availability` | Check availability   | Public |
| GET    | `/api/hotels/:id/rooms`        | Get hotel rooms      | Public |
| GET    | `/api/hotels/search/nearby`    | Search nearby hotels | Public |

### Parking

| Method | Endpoint                        | Description           | Access |
| ------ | ------------------------------- | --------------------- | ------ |
| GET    | `/api/parking`                  | Get all parking lots  | Public |
| GET    | `/api/parking/:id`              | Get parking lot by ID | Public |
| GET    | `/api/parking/:id/availability` | Check availability    | Public |
| GET    | `/api/parking/search/nearby`    | Search nearby parking | Public |

### Bookings

| Method | Endpoint            | Description       | Access  |
| ------ | ------------------- | ----------------- | ------- |
| GET    | `/api/bookings`     | Get user bookings | Private |
| POST   | `/api/bookings`     | Create booking    | Private |
| GET    | `/api/bookings/:id` | Get booking by ID | Private |
| PUT    | `/api/bookings/:id` | Update booking    | Private |
| DELETE | `/api/bookings/:id` | Cancel booking    | Private |

### Users

| Method | Endpoint              | Description       | Access  |
| ------ | --------------------- | ----------------- | ------- |
| GET    | `/api/users/profile`  | Get user profile  | Private |
| PUT    | `/api/users/profile`  | Update profile    | Private |
| GET    | `/api/users/bookings` | Get user bookings | Private |

### Admin

| Method | Endpoint               | Description          | Access |
| ------ | ---------------------- | -------------------- | ------ |
| GET    | `/api/admin/dashboard` | Admin dashboard      | Admin  |
| GET    | `/api/admin/users`     | Get all users        | Admin  |
| GET    | `/api/admin/bookings`  | Get all bookings     | Admin  |
| GET    | `/api/admin/hotels`    | Get all hotels       | Admin  |
| GET    | `/api/admin/parking`   | Get all parking lots | Admin  |

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **customer**: Regular users who can book hotels and parking
- **hotel_admin**: Hotel managers who can manage their hotel
- **parking_admin**: Parking lot managers who can manage their parking
- **super_admin**: System administrators with full access
- **support**: Customer support agents

## 📝 Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Hotels

```bash
GET /api/hotels?page=1&limit=10&rating=4&amenities=Free WiFi,Pool
```

### Check Hotel Availability

```bash
GET /api/hotels/64f1234567890abcdef12345/availability?checkIn=2024-01-15&checkOut=2024-01-17&guests=2
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **Error Handling**: Centralized error handling without exposing sensitive data

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── User.js              # User model
│   ├── Hotel.js             # Hotel model
│   ├── ParkingLot.js        # Parking lot model
│   └── Booking.js           # Booking model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── hotels.js            # Hotel routes
│   ├── parking.js           # Parking routes
│   ├── bookings.js          # Booking routes
│   ├── users.js             # User routes
│   ├── admin.js             # Admin routes
│   └── support.js           # Support routes
├── scripts/
│   └── seed.js              # Database seeding script
├── uploads/                 # File uploads directory
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md               # This file
```

## 🧪 Testing

Run tests:

```bash
npm test
```

## 📈 Monitoring

The API includes:

- Request logging with Morgan
- Error logging
- Health check endpoint at `/api/health`
- Performance monitoring ready

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/dfw-parking
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure MongoDB Atlas or production database
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@dfwparking.com or create an issue in the repository.
