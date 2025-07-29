import axios from "axios";
import { normalizeApiResponse } from "../utils/dataNormalizer";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and normalize data
api.interceptors.response.use(
  (response) => {
    // Normalize MongoDB _id to id for frontend compatibility
    return normalizeApiResponse(response);
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  changePassword: (passwords) => api.put("/auth/change-password", passwords),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
};

// Hotels API
export const hotelsAPI = {
  getAll: (params = {}) => api.get("/hotels", { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  checkAvailability: (id, params) =>
    api.get(`/hotels/${id}/availability`, { params }),
  getRooms: (id) => api.get(`/hotels/${id}/rooms`),
  searchNearby: (params) => api.get("/hotels/search/nearby", { params }),
};

// Parking API
export const parkingAPI = {
  getAll: (params = {}) => api.get("/parking", { params }),
  getById: (id) => api.get(`/parking/${id}`),
  checkAvailability: (id, params) =>
    api.get(`/parking/${id}/availability`, { params }),
  searchNearby: (params) => api.get("/parking/search/nearby", { params }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post("/bookings", bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancel: (id, reason) => api.delete(`/bookings/${id}`, { data: { reason } }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (profileData) => api.put("/users/profile", profileData),
  getUserBookings: () => api.get("/users/bookings"),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getHotelStats: () => api.get("/admin/hotel-stats"),
  getParkingStats: () => api.get("/admin/parking-stats"),
  getAllUsers: (params = {}) => api.get("/admin/users", { params }),
  getAllBookings: (params = {}) => api.get("/admin/bookings", { params }),
  getAllHotels: (params = {}) => api.get("/admin/hotels", { params }),
  getAllParking: (params = {}) => api.get("/admin/parking", { params }),
  deleteHotel: (id) => api.delete(`/admin/hotels/${id}`),
  deleteParkingLot: (id) => api.delete(`/admin/parking/${id}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateHotel: (id, data) => api.put(`/admin/hotels/${id}`, data),
  updateParkingLot: (id, data) => api.put(`/admin/parking/${id}`, data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  createHotel: (data) => api.post("/admin/hotels", data),
  createParkingLot: (data) => api.post("/admin/parking", data),
  createUser: (data) => api.post("/admin/users", data),
  cancelBooking: (id) => api.delete(`/admin/bookings/${id}`),

  // Hotel Admin specific APIs
  getHotelRooms: () => api.get("/admin/hotel/rooms"),
  getHotelBookings: () => api.get("/admin/hotel/bookings"),
  createHotelRoom: (data) => api.post("/admin/hotel/rooms", data),
  updateHotelRoom: (id, data) => api.put(`/admin/hotel/rooms/${id}`, data),
  deleteHotelRoom: (id) => api.delete(`/admin/hotel/rooms/${id}`),
  updateBookingStatus: (id, status) =>
    api.put(`/admin/bookings/${id}/status`, { status }),

  // Parking Admin specific APIs
  getParkingSpots: () => api.get("/admin/parking/spots"),
  getParkingBookings: () => api.get("/admin/parking/bookings"),
  createParkingSpot: (data) => api.post("/admin/parking/spots", data),
  updateParkingSpot: (id, data) => api.put(`/admin/parking/spots/${id}`, data),
  deleteParkingSpot: (id) => api.delete(`/admin/parking/spots/${id}`),

  // Property assignment
  assignProperty: (type, propertyId, adminId) =>
    api.post(`/admin/assign/${type}/${propertyId}`, { adminId }),
};

// Support API
export const supportAPI = {
  getTickets: (params = {}) => api.get("/support/tickets", { params }),
  createTicket: (ticketData) => api.post("/support/tickets", ticketData),
  updateTicket: (id, ticketData) =>
    api.put(`/support/tickets/${id}`, ticketData),
  getTicket: (id) => api.get(`/support/tickets/${id}`),
  assignTicket: (id) => api.post(`/support/tickets/${id}/assign`),
  getIssues: () => api.get("/support/issues"),
};

// Health check
export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
