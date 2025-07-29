# DFW Parking - Airport Hotel & Parking Management System

A comprehensive web application for managing airport hotels and parking services, specifically designed for Dallas/Fort Worth International Airport (DFW). This platform provides a complete solution for travelers seeking convenient hotel stays with parking packages.

## 🚀 Features

### For Travelers

- **Combined Booking**: Hotel rooms + parking spots in one transaction
- **Shuttle Service**: Integrated shuttle scheduling to/from airport
- **Cost Savings**: Competitive pricing vs. airport parking rates
- **Flexible Options**: Pre-flight, post-flight, or both stays
- **Real-time Availability**: Live booking and availability tracking

### For Hotel & Parking Managers

- **Admin Dashboards**: Dedicated panels for hotel and parking administrators
- **Room Management**: Add, edit, and manage room types with detailed properties
- **Parking Spot Management**: Configure and manage parking spots
- **Booking Management**: View and manage all reservations
- **Revenue Analytics**: Track bookings, revenue, and performance metrics

### For Super Administrators

- **User Management**: Assign and manage hotel/parking administrators
- **Property Management**: Add and configure hotels and parking lots
- **System Overview**: Comprehensive dashboard with all system data
- **Role-based Access Control**: Secure access management

## 🏗️ Architecture

### Frontend

- **React.js**: Modern UI with functional components and hooks
- **Tailwind CSS**: Responsive design with utility-first styling
- **Context API**: State management for authentication and bookings
- **Axios**: HTTP client for API communication

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: Authentication and authorization
- **Express Validator**: Input validation and sanitization

## 📁 Project Structure

```
Website/
├── backend/                 # Backend API server
│   ├── config/             # Database and configuration
│   ├── middleware/         # Authentication and error handling
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   └── server.js          # Main server file
├── src/                   # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── pages/            # Page components
│   ├── services/         # API service functions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dfw-parking
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Database Setup:**

   ```bash
   npm run setup
   ```

5. **Seed Database (Optional):**

   ```bash
   npm run seed
   ```

6. **Start Backend Server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to project root:**

   ```bash
   cd ..
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🔐 Authentication & Roles

### User Roles

- **Super Admin**: Full system access and management
- **Hotel Admin**: Manage assigned hotel properties
- **Parking Admin**: Manage assigned parking lots
- **Customer**: Book hotels and parking services

### API Endpoints

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Admin Routes

- `GET /api/admin/dashboard` - Super admin dashboard
- `GET /api/admin/hotels` - Hotel management
- `GET /api/admin/parking` - Parking lot management
- `GET /api/admin/users` - User management

#### Hotel Admin Routes

- `GET /api/admin/hotel-stats` - Hotel statistics
- `GET /api/admin/hotel/rooms` - Room management
- `GET /api/admin/hotel/bookings` - Booking management

#### Parking Admin Routes

- `GET /api/admin/parking-stats` - Parking statistics
- `GET /api/admin/parking/spots` - Spot management
- `GET /api/admin/parking/bookings` - Booking management

## 🎨 UI Components

### Admin Panels

- **Super Admin Panel**: Complete system overview and management
- **Hotel Admin Panel**: Hotel-specific dashboard with room management
- **Parking Admin Panel**: Parking-specific dashboard with spot management

### Booking System

- **Combined Booking**: Hotel + parking package booking
- **Flexible Dates**: Pre-flight, post-flight, or both stays
- **Real-time Availability**: Live booking status

## 🚀 Deployment

### Environment Variables

Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret
CORS_ORIGIN=your-frontend-domain
```

### Build Commands

```bash
# Backend
cd backend
npm run build

# Frontend
npm run build
```

## 📊 Database Schema

### Users

- Authentication details
- Role-based access control
- Profile information

### Hotels

- Basic information (name, description, address)
- Room types and configurations
- Admin assignments

### Parking Lots

- Location and capacity
- Spot configurations
- Admin assignments

### Bookings

- Customer information
- Hotel and parking reservations
- Payment and status tracking

## 🔧 Development

### Code Style

- ESLint configuration for code quality
- Prettier for code formatting
- Consistent naming conventions

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Phase 1 (Current)

- ✅ Core booking system
- ✅ Admin panels
- ✅ User authentication
- ✅ Basic CRUD operations

### Phase 2 (Planned)

- 🔄 Payment integration
- 🔄 Email notifications
- 🔄 Mobile app
- 🔄 Advanced analytics

### Phase 3 (Future)

- 📋 Multi-airport expansion
- 📋 Partner integrations
- 📋 AI-powered recommendations
- 📋 Loyalty program

---

**Built with ❤️ for DFW travelers**
