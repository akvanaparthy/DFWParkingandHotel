import React, { useState } from "react";
import { useBooking } from "../../contexts/BookingContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Car,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ParkingBooking = () => {
  const { parkingLots, createBooking } = useBooking();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    selectedLot: null,
    vehicleNumber: "",
    vehicleType: "car",
  });

  const steps = [
    { title: "Parking Duration", icon: <Calendar className="h-5 w-5" /> },
    { title: "Select Lot", icon: <MapPin className="h-5 w-5" /> },
    { title: "Vehicle Details", icon: <Car className="h-5 w-5" /> },
    { title: "Payment", icon: <CreditCard className="h-5 w-5" /> },
  ];

  const vehicleTypes = [
    { id: "car", name: "Car", icon: "🚗" },
    { id: "suv", name: "SUV", icon: "🚙" },
    { id: "truck", name: "Truck", icon: "🚛" },
    { id: "motorcycle", name: "Motorcycle", icon: "🏍️" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLotSelect = (lot) => {
    setBookingData((prev) => ({ ...prev, selectedLot: lot }));
  };

  const calculateDuration = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const diffTime = Math.abs(bookingData.endDate - bookingData.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    if (!bookingData.selectedLot) return 0;

    const duration = calculateDuration();
    const hours = duration * 24;

    if (hours <= 24) {
      return bookingData.selectedLot.pricePerHour * hours;
    } else {
      const days = Math.ceil(hours / 24);
      return bookingData.selectedLot.pricePerDay * days;
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const bookingDetails = {
        type: "parking",
        userId: user.id,
        parking: {
          parkingLotId: bookingData.selectedLot.id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          vehicleInfo: {
            licensePlate: bookingData.vehicleNumber,
          },
          spotPrice: calculateTotal(),
        },
        payment: {
          method: "credit_card",
          amount: calculateTotal(),
          currency: "USD",
          status: "pending",
        },
        pricing: {
          subtotal: calculateTotal(),
          taxes: 0,
          fees: 0,
          discount: 0,
          total: calculateTotal(),
        },
        status: "confirmed",
      };

      await createBooking(bookingDetails);
      // Reset form
      setBookingData({
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        selectedLot: null,
        vehicleNumber: "",
        vehicleType: "car",
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">
              Select Parking Duration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Start Date</label>
                <DatePicker
                  selected={bookingData.startDate}
                  onChange={(date) =>
                    setBookingData((prev) => ({ ...prev, startDate: date }))
                  }
                  minDate={new Date()}
                  className="input-field"
                  placeholderText="Select start date"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <DatePicker
                  selected={bookingData.endDate}
                  onChange={(date) =>
                    setBookingData((prev) => ({ ...prev, endDate: date }))
                  }
                  minDate={bookingData.startDate || new Date()}
                  className="input-field"
                  placeholderText="Select end date"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Start Time</label>
                <DatePicker
                  selected={bookingData.startTime}
                  onChange={(time) =>
                    setBookingData((prev) => ({ ...prev, startTime: time }))
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="input-field"
                  placeholderText="Select start time"
                />
              </div>
              <div>
                <label className="form-label">End Time</label>
                <DatePicker
                  selected={bookingData.endTime}
                  onChange={(time) =>
                    setBookingData((prev) => ({ ...prev, endTime: time }))
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="input-field"
                  placeholderText="Select end time"
                />
              </div>
            </div>

            {bookingData.startDate && bookingData.endDate && (
              <div className="card bg-blue-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Duration Summary
                  </span>
                </div>
                <p className="text-blue-800">
                  Total duration: {calculateDuration()} day(s)
                </p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Select Parking Lot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parkingLots.map((lot) => (
                <div
                  key={lot.id}
                  className={`card cursor-pointer transition-all duration-200 ${
                    bookingData.selectedLot?.id === lot.id
                      ? "ring-2 ring-primary-500 bg-primary-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleLotSelect(lot)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold">{lot.name}</h4>
                    <div className="text-sm text-green-600 font-medium">
                      {lot.availableSpots} spots available
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{lot.address}</p>
                  <p className="text-sm text-gray-500 mb-4">{lot.distance}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Hourly Rate:</span>
                      <span className="font-medium">
                        ${lot.pricePerHour}/hour
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily Rate:</span>
                      <span className="font-medium">
                        ${lot.pricePerDay}/day
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {lot.features.map((feature, index) => (
                      <p key={index} className="text-sm text-gray-500">
                        • {feature}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>

            <div>
              <label className="form-label">Vehicle Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicleTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      bookingData.vehicleType === type.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value={type.id}
                      checked={bookingData.vehicleType === type.id}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          vehicleType: e.target.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="text-2xl mb-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">License Plate Number</label>
              <input
                type="text"
                value={bookingData.vehicleNumber}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    vehicleNumber: e.target.value.toUpperCase(),
                  }))
                }
                className="input-field"
                placeholder="Enter license plate number"
                maxLength={10}
              />
            </div>

            {bookingData.selectedLot && (
              <div className="card bg-green-50">
                <h4 className="font-medium text-green-900 mb-2">
                  Selected Parking Lot
                </h4>
                <p className="text-green-800">{bookingData.selectedLot.name}</p>
                <p className="text-sm text-green-700">
                  {bookingData.selectedLot.address}
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">
              Booking Summary & Payment
            </h3>

            <div className="card">
              <h4 className="text-lg font-semibold mb-4">Booking Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Parking Lot:</span>
                  <span className="font-medium">
                    {bookingData.selectedLot?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-medium">
                    {bookingData.startDate?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>End Date:</span>
                  <span className="font-medium">
                    {bookingData.endDate?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {calculateDuration()} day(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle Type:</span>
                  <span className="font-medium">
                    {
                      vehicleTypes.find((t) => t.id === bookingData.vehicleType)
                        ?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>License Plate:</span>
                  <span className="font-medium">
                    {bookingData.vehicleNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Parking Rate:</span>
                  <span>
                    ${bookingData.selectedLot?.pricePerHour}/hour or $
                    {bookingData.selectedLot?.pricePerDay}/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{calculateDuration()} day(s)</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-lg font-semibold mb-4">
                Payment Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="form-label">CVV</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          bookingData.startDate &&
          bookingData.endDate &&
          bookingData.startTime &&
          bookingData.endTime
        );
      case 1:
        return bookingData.selectedLot;
      case 2:
        return bookingData.vehicleNumber.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? "text-primary-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? "bg-primary-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        <button
          onClick={
            currentStep === steps.length - 1 ? handleConfirmBooking : handleNext
          }
          disabled={!canProceed()}
          className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? "Confirm Booking" : "Next"}
          {currentStep < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 ml-2" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ParkingBooking;
