import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import HotelAdminPanel from "./pages/HotelAdminPanel";
import ParkingAdminPanel from "./pages/ParkingAdminPanel";
import SupportPanel from "./pages/SupportPanel";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/booking/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Booking />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "super_admin" ? (
              <Layout>
                <AdminPanel />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/hotel-admin"
          element={
            isAuthenticated && user?.role === "hotel_admin" ? (
              <Layout>
                <HotelAdminPanel />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/parking-admin"
          element={
            isAuthenticated && user?.role === "parking_admin" ? (
              <Layout>
                <ParkingAdminPanel />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/support"
          element={
            isAuthenticated && user?.role === "support" ? (
              <Layout>
                <SupportPanel />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Dashboard route - redirects based on user role */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
