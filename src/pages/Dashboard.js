import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBooking } from "../contexts/BookingContext";
import { useNavigate } from "react-router-dom";
import {
  Building,
  Car,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  Plus,
  Settings,
  MessageSquare,
  FileText,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const {
    user,
    isCustomer,
    isSuperAdmin,
    isHotelAdmin,
    isParkingAdmin,
    isSupport,
  } = useAuth();
  const { bookings, getBookingsByUser } = useBooking();
  const navigate = useNavigate();

  const userBookings = getBookingsByUser(user?.id);

  const stats = [
    {
      title: "Total Bookings",
      value: userBookings.length,
      icon: <Package className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Active Bookings",
      value: userBookings.filter((b) => b.status === "confirmed").length,
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-green-500",
    },
    {
      title: "Total Spent",
      value: `$${userBookings.reduce((total, booking) => {
        const hotelAmount = booking.hotelData?.totalAmount || 0;
        const parkingAmount = booking.parkingData?.totalAmount || 0;
        return total + hotelAmount + parkingAmount;
      }, 0)}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-yellow-500",
    },
  ];

  const handleNavigateToBooking = () => {
    navigate("/booking");
  };

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  const handleNavigateToSupport = () => {
    navigate("/support");
  };

  const handleNavigateToAdmin = () => {
    navigate("/admin");
  };

  const handleNavigateToHotelAdmin = () => {
    navigate("/hotel-admin");
  };

  const handleNavigateToParkingAdmin = () => {
    navigate("/parking-admin");
  };

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        {userBookings.length > 0 ? (
          <div className="space-y-4">
            {userBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {booking.type === "hotel" &&
                        booking.hotelData &&
                        "Hotel Booking"}
                      {booking.type === "parking" &&
                        booking.parkingData &&
                        "Parking Booking"}
                      {booking.type === "both" && "Combined Booking"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {booking.hotelData && (
                    <p>Hotel: {booking.hotelData.hotelId}</p>
                  )}
                  {booking.parkingData && (
                    <p>Parking: {booking.parkingData.parkingId}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No bookings yet. Start by booking a hotel or parking!
          </p>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNavigateToBooking}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Book Hotel
          </button>
          <button
            onClick={handleNavigateToBooking}
            className="btn-secondary flex items-center justify-center"
          >
            <Car className="h-4 w-4 mr-2" />
            Book Parking
          </button>
          <button
            onClick={handleNavigateToProfile}
            className="btn-secondary flex items-center justify-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Update Profile
          </button>
          <button
            onClick={handleNavigateToSupport}
            className="btn-secondary flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Get Support
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <Building className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hotels</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <Car className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Parking Lots</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$45,678</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNavigateToAdmin}
            className="btn-primary flex items-center justify-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Panel
          </button>
          <button
            onClick={handleNavigateToSupport}
            className="btn-secondary flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Support Panel
          </button>
          <button
            onClick={handleNavigateToAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </button>
          <button
            onClick={handleNavigateToAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );

  const renderHotelAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Building className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$3,456</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Hotel Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNavigateToHotelAdmin}
            className="btn-primary flex items-center justify-center"
          >
            <Building className="h-4 w-4 mr-2" />
            Manage Rooms
          </button>
          <button
            onClick={handleNavigateToHotelAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Bookings
          </button>
          <button
            onClick={handleNavigateToHotelAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Update Pricing
          </button>
          <button
            onClick={handleNavigateToHotelAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Hotel Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderParkingAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Car className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spots</p>
              <p className="text-2xl font-bold text-gray-900">200</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$3,456</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Parking Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNavigateToParkingAdmin}
            className="btn-primary flex items-center justify-center"
          >
            <Car className="h-4 w-4 mr-2" />
            Manage Spots
          </button>
          <button
            onClick={handleNavigateToParkingAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Update Pricing
          </button>
          <button
            onClick={handleNavigateToParkingAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Bookings
          </button>
          <button
            onClick={handleNavigateToParkingAdmin}
            className="btn-secondary flex items-center justify-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Update Features
          </button>
        </div>
      </div>
    </div>
  );

  const renderSupportDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Resolved Today
              </p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">2.3 min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Support Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNavigateToSupport}
            className="btn-primary flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Start New Chat
          </button>
          <button
            onClick={handleNavigateToSupport}
            className="btn-secondary flex items-center justify-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Tickets
          </button>
          <button
            onClick={handleNavigateToSupport}
            className="btn-secondary flex items-center justify-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Knowledge Base
          </button>
          <button
            onClick={handleNavigateToSupport}
            className="btn-secondary flex items-center justify-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {isCustomer && renderCustomerDashboard()}
      {isSuperAdmin && renderAdminDashboard()}
      {isHotelAdmin && renderHotelAdminDashboard()}
      {isParkingAdmin && renderParkingAdminDashboard()}
      {isSupport && renderSupportDashboard()}
    </div>
  );
};

export default Dashboard;
