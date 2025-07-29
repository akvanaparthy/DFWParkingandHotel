import React from "react";
import { Plane, Car } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated Logo */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl floating">
              <Plane className="h-12 w-12 text-primary-600" />
            </div>
            <div
              className="p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl floating"
              style={{ animationDelay: "0.5s" }}
            >
              <Car className="h-10 w-10 text-accent-500" />
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DFW Parking</h2>
          <p className="text-gray-600 mb-8">Loading your experience...</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
