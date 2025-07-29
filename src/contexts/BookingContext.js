import React, { createContext, useContext, useState, useEffect } from "react";
import { hotelsAPI, parkingAPI, bookingsAPI } from "../services/api";
import toast from "react-hot-toast";

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    type: null, // 'hotel', 'parking', 'both'
    hotelData: null,
    parkingData: null,
    currentStep: 0,
  });

  const [hotels, setHotels] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({
    hotels: false,
    parking: false,
    bookings: false,
  });

  // Load hotels from API
  useEffect(() => {
    const loadHotels = async () => {
      setLoading((prev) => ({ ...prev, hotels: true }));
      try {
        const response = await hotelsAPI.getAll();
        setHotels(response.data.data.hotels || []);
      } catch (error) {
        console.error("Error loading hotels:", error);
        toast.error("Failed to load hotels");
      } finally {
        setLoading((prev) => ({ ...prev, hotels: false }));
      }
    };

    loadHotels();
  }, []);

  // Load parking lots from API
  useEffect(() => {
    const loadParkingLots = async () => {
      setLoading((prev) => ({ ...prev, parking: true }));
      try {
        const response = await parkingAPI.getAll();
        setParkingLots(response.data.data.parkingLots || []);
      } catch (error) {
        console.error("Error loading parking lots:", error);
        toast.error("Failed to load parking lots");
      } finally {
        setLoading((prev) => ({ ...prev, parking: false }));
      }
    };

    loadParkingLots();
  }, []);

  // Load user bookings from API
  useEffect(() => {
    const loadBookings = async () => {
      setLoading((prev) => ({ ...prev, bookings: true }));
      try {
        const response = await bookingsAPI.getAll();
        setBookings(response.data.data.bookings || []);
      } catch (error) {
        console.error("Error loading bookings:", error);
        // Don't show error toast for bookings as user might not be logged in
      } finally {
        setLoading((prev) => ({ ...prev, bookings: false }));
      }
    };

    loadBookings();
  }, []);

  const startBooking = (type) => {
    setBookingData({
      type,
      hotelData: null,
      parkingData: null,
      currentStep: 0,
    });
  };

  const updateBookingData = (updates) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  };

  const createBooking = async (bookingDetails) => {
    try {
      const response = await bookingsAPI.create(bookingDetails);
      const newBooking = response.data.data.booking;

      setBookings((prev) => [newBooking, ...prev]);

      // Reset booking data
      setBookingData({
        type: null,
        hotelData: null,
        parkingData: null,
        currentStep: 0,
      });

      toast.success("Booking confirmed successfully!");
      return { success: true, booking: newBooking };
    } catch (error) {
      const message =
        error.response?.data?.message || "Booking failed. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await bookingsAPI.cancel(bookingId);

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast.success("Booking cancelled successfully");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel booking";
      toast.error(message);
      throw error;
    }
  };

  const getBookingsByUser = (userId) => {
    return bookings.filter((booking) => booking.user === userId);
  };

  const getBookingsByHotel = (hotelId) => {
    return bookings.filter((booking) => booking.hotel?.hotelId === hotelId);
  };

  const getBookingsByParking = (parkingId) => {
    return bookings.filter(
      (booking) => booking.parking?.parkingLotId === parkingId
    );
  };

  const value = {
    bookingData,
    hotels,
    parkingLots,
    bookings,
    loading,
    startBooking,
    updateBookingData,
    createBooking,
    cancelBooking,
    getBookingsByUser,
    getBookingsByHotel,
    getBookingsByParking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
