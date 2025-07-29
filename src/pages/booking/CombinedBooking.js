import React, { useState } from "react";
import { useBooking } from "../../contexts/BookingContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Users,
  Building,
  Car,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Package,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CombinedBooking = () => {
  const { hotels, parkingLots, createBooking } = useBooking();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    // Hotel data
    checkIn: null,
    checkOut: null,
    guests: 1,
    selectedHotel: null,
    selectedRoom: null,
    hotelAmenities: [],

    // Parking data
    parkingStartDate: null,
    parkingEndDate: null,
    parkingStartTime: null,
    parkingEndTime: null,
    selectedParkingLot: null,
    vehicleNumber: "",
    vehicleType: "car",
  });

  const steps = [
    { title: "Hotel Details", icon: <Calendar className="h-5 w-5" /> },
    { title: "Select Hotel", icon: <Building className="h-5 w-5" /> },
    { title: "Choose Room", icon: <Users className="h-5 w-5" /> },
    { title: "Parking Details", icon: <Car className="h-5 w-5" /> },
    { title: "Select Parking", icon: <MapPin className="h-5 w-5" /> },
    { title: "Payment", icon: <CreditCard className="h-5 w-5" /> },
  ];

  const amenities = [
    { id: "wifi", name: "WiFi", price: 10 },
    { id: "breakfast", name: "Breakfast", price: 15 },
    { id: "parking", name: "Parking", price: 20 },
    { id: "shuttle", name: "Airport Shuttle", price: 25 },
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

  const handleHotelSelect = (hotel) => {
    setBookingData((prev) => ({
      ...prev,
      selectedHotel: hotel,
      selectedRoom: null,
    }));
  };

  const handleRoomSelect = (room) => {
    setBookingData((prev) => ({ ...prev, selectedRoom: room }));
  };

  const handleParkingLotSelect = (lot) => {
    setBookingData((prev) => ({ ...prev, selectedParkingLot: lot }));
  };

  const handleHotelAmenityToggle = (amenityId) => {
    setBookingData((prev) => ({
      ...prev,
      hotelAmenities: prev.hotelAmenities.includes(amenityId)
        ? prev.hotelAmenities.filter((id) => id !== amenityId)
        : [...prev.hotelAmenities, amenityId],
    }));
  };

  const calculateHotelTotal = () => {
    if (!bookingData.selectedRoom) return 0;

    const roomPrice = bookingData.selectedRoom.price;
    const nights =
      bookingData.checkIn && bookingData.checkOut
        ? Math.ceil(
            (bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24)
          )
        : 0;

    const amenitiesTotal = bookingData.hotelAmenities.reduce(
      (total, amenityId) => {
        const amenity = amenities.find((a) => a.id === amenityId);
        return total + (amenity ? amenity.price : 0);
      },
      0
    );

    return (roomPrice + amenitiesTotal) * nights;
  };

  const calculateParkingTotal = () => {
    if (!bookingData.selectedParkingLot) return 0;

    const startDate = bookingData.parkingStartDate;
    const endDate = bookingData.parkingEndDate;
    if (!startDate || !endDate) return 0;

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const hours = diffDays * 24;

    if (hours <= 24) {
      return bookingData.selectedParkingLot.pricing.hourly * hours;
    } else {
      const days = Math.ceil(hours / 24);
      return bookingData.selectedParkingLot.pricing.daily * days;
    }
  };

  const calculateTotal = () => {
    return calculateHotelTotal() + calculateParkingTotal();
  };

  const handleConfirmBooking = async () => {
    try {
      const bookingDetails = {
        type: "both",
        userId: user.id,
        hotel: {
          hotelId: bookingData.selectedHotel.id,
          roomId: bookingData.selectedRoom.id,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          amenities: bookingData.hotelAmenities,
          roomPrice: bookingData.selectedRoom.price,
        },
        parking: {
          parkingLotId: bookingData.selectedParkingLot.id,
          startDate: bookingData.parkingStartDate,
          endDate: bookingData.parkingEndDate,
          vehicleInfo: {
            licensePlate: bookingData.vehicleNumber,
          },
          spotPrice: calculateParkingTotal(),
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
        checkIn: null,
        checkOut: null,
        guests: 1,
        selectedHotel: null,
        selectedRoom: null,
        hotelAmenities: [],
        parkingStartDate: null,
        parkingEndDate: null,
        parkingStartTime: null,
        parkingEndTime: null,
        selectedParkingLot: null,
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
            <h3 className="text-lg font-semibold mb-4">Hotel Dates & Guests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Check-in Date</label>
                <DatePicker
                  selected={bookingData.checkIn}
                  onChange={(date) =>
                    setBookingData((prev) => ({ ...prev, checkIn: date }))
                  }
                  minDate={new Date()}
                  className="input-field"
                  placeholderText="Select check-in date"
                />
              </div>
              <div>
                <label className="form-label">Check-out Date</label>
                <DatePicker
                  selected={bookingData.checkOut}
                  onChange={(date) =>
                    setBookingData((prev) => ({ ...prev, checkOut: date }))
                  }
                  minDate={bookingData.checkIn || new Date()}
                  className="input-field"
                  placeholderText="Select check-out date"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Number of Guests</label>
              <select
                value={bookingData.guests}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    guests: parseInt(e.target.value),
                  }))
                }
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Hotel
              </h3>
              <p className="text-gray-600">
                Select from our carefully curated hotels near DFW Airport
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className={`card-hover ${
                    bookingData.selectedHotel?.id === hotel.id
                      ? "ring-2 ring-primary-500 bg-primary-50"
                      : ""
                  }`}
                  onClick={() => handleHotelSelect(hotel)}
                >
                  <div className="relative mb-4">
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                      {hotel.distance}
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {hotel.name}
                  </h4>
                  <p className="text-gray-600 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.address}
                  </p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <CheckCircle
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(hotel.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {hotel.rating}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Select Your Room
              </h3>
              <p className="text-gray-600">
                Choose the perfect room for your stay
              </p>
            </div>

            {bookingData.selectedHotel && (
              <div>
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 mb-8">
                  <div className="flex items-center space-x-4">
                    <img
                      src={bookingData.selectedHotel.images[0]}
                      alt={bookingData.selectedHotel.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {bookingData.selectedHotel.name}
                      </h4>
                      <p className="text-gray-600">
                        {bookingData.selectedHotel.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {bookingData.selectedHotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`card-hover ${
                        bookingData.selectedRoom?.id === room.id
                          ? "ring-2 ring-primary-500 bg-primary-50"
                          : ""
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <h5 className="text-xl font-bold text-gray-900 mb-2">
                        {room.type}
                      </h5>
                      <div className="text-3xl font-bold text-primary-600 mb-3">
                        ${room.price}
                        <span className="text-sm font-normal text-gray-500">
                          /night
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Capacity: {room.capacity} guests
                        </p>
                        <p className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {room.available} rooms available
                        </p>
                      </div>

                      <div className="space-y-1">
                        {room.amenities.map((amenity, index) => (
                          <p
                            key={index}
                            className="text-sm text-gray-500 flex items-center"
                          >
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {amenity}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {bookingData.selectedRoom && (
                  <div className="card">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-primary-600" />
                      Additional Amenities
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {amenities.map((amenity) => (
                        <label
                          key={amenity.id}
                          className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                        >
                          <input
                            type="checkbox"
                            checked={bookingData.hotelAmenities.includes(
                              amenity.id
                            )}
                            onChange={() =>
                              handleHotelAmenityToggle(amenity.id)
                            }
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex items-center space-x-2">
                            <span className="flex-1">{amenity.name}</span>
                          </div>
                          <span className="text-primary-600 font-semibold">
                            +${amenity.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Parking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Parking Start Date</label>
                <DatePicker
                  selected={bookingData.parkingStartDate}
                  onChange={(date) =>
                    setBookingData((prev) => ({
                      ...prev,
                      parkingStartDate: date,
                    }))
                  }
                  minDate={new Date()}
                  className="input-field"
                  placeholderText="Select start date"
                />
              </div>
              <div>
                <label className="form-label">Parking End Date</label>
                <DatePicker
                  selected={bookingData.parkingEndDate}
                  onChange={(date) =>
                    setBookingData((prev) => ({
                      ...prev,
                      parkingEndDate: date,
                    }))
                  }
                  minDate={bookingData.parkingStartDate || new Date()}
                  className="input-field"
                  placeholderText="Select end date"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Start Time</label>
                <DatePicker
                  selected={bookingData.parkingStartTime}
                  onChange={(time) =>
                    setBookingData((prev) => ({
                      ...prev,
                      parkingStartTime: time,
                    }))
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
                  selected={bookingData.parkingEndTime}
                  onChange={(time) =>
                    setBookingData((prev) => ({
                      ...prev,
                      parkingEndTime: time,
                    }))
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Vehicle Number</label>
                <input
                  type="text"
                  value={bookingData.vehicleNumber}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      vehicleNumber: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="Enter vehicle number"
                />
              </div>
              <div>
                <label className="form-label">Vehicle Type</label>
                <select
                  value={bookingData.vehicleType}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      vehicleType: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Select Parking Lot
              </h3>
              <p className="text-gray-600">
                Choose a parking lot near your hotel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parkingLots.map((lot) => (
                <div
                  key={lot.id}
                  className={`card-hover ${
                    bookingData.selectedParkingLot?.id === lot.id
                      ? "ring-2 ring-primary-500 bg-primary-50"
                      : ""
                  }`}
                  onClick={() => handleParkingLotSelect(lot)}
                >
                  <div className="relative mb-4">
                    <img
                      src={lot.images[0]}
                      alt={lot.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                      {lot.distance}
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {lot.name}
                  </h4>
                  <p className="text-gray-600 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {lot.address}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Hourly Rate:
                      </span>
                      <span className="font-semibold">
                        ${lot.pricing.hourly}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Rate:</span>
                      <span className="font-semibold">
                        ${lot.pricing.daily}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Available Spots:
                      </span>
                      <span className="font-semibold text-green-600">
                        {lot.capacity.available}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lot.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Summary & Payment
              </h3>
              <p className="text-gray-600">
                Review your booking details and complete payment
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div className="space-y-6">
                <div className="card">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Hotel Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hotel:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.selectedHotel?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.selectedRoom?.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.checkIn?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.checkOut?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.guests}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Car className="h-5 w-5 mr-2 text-blue-500" />
                    Parking Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Parking Lot:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.selectedParkingLot?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.parkingStartDate?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.parkingEndDate?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.vehicleNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="card">
                <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hotel Total:</span>
                    <span className="font-semibold">
                      ${calculateHotelTotal()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parking Total:</span>
                    <span className="font-semibold">
                      ${calculateParkingTotal()}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="card">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
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
                  <div>
                    <label className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Doe"
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
          bookingData.checkIn && bookingData.checkOut && bookingData.guests
        );
      case 1:
        return bookingData.selectedHotel;
      case 2:
        return bookingData.selectedRoom;
      case 3:
        return (
          bookingData.parkingStartDate &&
          bookingData.parkingEndDate &&
          bookingData.vehicleNumber
        );
      case 4:
        return bookingData.selectedParkingLot;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`ml-3 text-sm font-semibold ${
                  index <= currentStep ? "text-primary-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
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
      <div className="flex justify-between mt-8">
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

export default CombinedBooking;
