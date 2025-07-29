import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HotelBooking from "./booking/HotelBooking";
import ParkingBooking from "./booking/ParkingBooking";
import CombinedBooking from "./booking/CombinedBooking";

const Booking = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/hotel" element={<HotelBooking />} />
          <Route path="/parking" element={<ParkingBooking />} />
          <Route path="/both" element={<CombinedBooking />} />
          <Route path="*" element={<Navigate to="/booking/hotel" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Booking;
