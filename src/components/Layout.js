import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Plane,
  Car,
  Building,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
} from "lucide-react";
import { useState } from "react";

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Book Hotel", href: "/booking/hotel" },
    { name: "Book Parking", href: "/booking/parking" },
    { name: "Book Both", href: "/booking/both" },
  ];

  const adminNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Building className="h-4 w-4" />,
    },
    {
      name: "Admin Panel",
      href: "/admin",
      role: "super_admin",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      name: "Hotel Admin",
      href: "/hotel-admin",
      role: "hotel_admin",
      icon: <Building className="h-4 w-4" />,
    },
    {
      name: "Parking Admin",
      href: "/parking-admin",
      role: "parking_admin",
      icon: <Car className="h-4 w-4" />,
    },
    {
      name: "Support",
      href: "/support",
      role: "support",
      icon: <Bell className="h-4 w-4" />,
    },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="flex items-center space-x-1 p-2 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl group-hover:shadow-glow transition-all duration-300">
                  <Plane className="h-8 w-8 text-primary-600" />
                  <Car className="h-6 w-6 text-accent-500" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  DFW Parking
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? "active bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    {adminNavigation
                      .filter((item) => !item.role || user?.role === item.role)
                      .map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            isActive(item.href)
                              ? "bg-primary-50 text-primary-600"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                          title={item.name}
                        >
                          {item.icon}
                        </Link>
                      ))}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {user?.name}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="nav-link px-4 py-2 rounded-xl hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-100 shadow-lg">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin Tools
                    </div>
                    {adminNavigation
                      .filter((item) => !item.role || user?.role === item.role)
                      .map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive(item.href)
                              ? "text-primary-600 bg-primary-50"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                          </div>
                        </Link>
                      ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center px-4 py-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center space-x-1 p-2 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                  <Plane className="h-6 w-6 text-primary-600" />
                  <Car className="h-5 w-5 text-accent-500" />
                </div>
                <span className="text-lg font-bold gradient-text">
                  DFW Parking
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your trusted partner for DFW Airport parking and hotel bookings.
                Convenient, secure, and reliable service for all your travel
                needs.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Services
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/booking/hotel"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Hotel Booking
                  </Link>
                  <Link
                    to="/booking/parking"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Parking Booking
                  </Link>
                  <Link
                    to="/booking/both"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Hotel + Parking
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 DFW Parking. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
