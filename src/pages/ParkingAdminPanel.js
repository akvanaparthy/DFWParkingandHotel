import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Car,
  Calendar,
  DollarSign,
  Settings,
  Edit,
  Plus,
  Trash2,
  Loader,
  Save,
  CheckCircle,
  X,
} from "lucide-react";

const ParkingAdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [parkingStats, setParkingStats] = useState({
    totalSpots: 0,
    activeBookings: 0,
    revenue: 0,
    recentBookings: [],
  });

  // Real data states
  const [parkingSpots, setParkingSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);

  // Parking spot form state
  const [spotForm, setSpotForm] = useState({
    spotNumber: "",
    spotType: "Standard",
    section: "A",
    isAvailable: true,
    price: 25,
  });

  // Settings state
  const [settings, setSettings] = useState({
    pricing: {
      hourly: 8,
      daily: 25,
      weekly: 150,
      monthly: 500,
    },
    features: {
      covered: true,
      security: true,
      shuttle: true,
      evCharging: false,
      valet: false,
    },
    operating: {
      openingTime: "00:00",
      closingTime: "23:59",
      gracePeriod: 15,
    },
  });

  const [settingsLoading, setSettingsLoading] = useState(false);

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: <DollarSign className="h-5 w-5" />,
    },
    { id: "spots", name: "Parking Spots", icon: <Car className="h-5 w-5" /> },
    {
      id: "bookings",
      name: "Bookings",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Load parking statistics for assigned parking lot only
  useEffect(() => {
    const loadParkingStats = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getParkingStats();
        setParkingStats(response.data.data.statistics);
      } catch (error) {
        console.error("Error loading parking stats:", error);
        toast.error("Failed to load parking statistics");
      } finally {
        setLoading(false);
      }
    };

    loadParkingStats();
  }, []);

  // Load parking spots for assigned parking lot only
  useEffect(() => {
    const loadParkingSpots = async () => {
      try {
        const response = await adminAPI.getParkingSpots();
        setParkingSpots(response.data.data.spots || []);
      } catch (error) {
        console.error("Error loading parking spots:", error);
        toast.error("Failed to load parking spots");
      }
    };

    if (activeTab === "spots") {
      loadParkingSpots();
    }
  }, [activeTab]);

  // Load bookings for assigned parking lot only
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await adminAPI.getParkingBookings();
        setBookings(response.data.data.bookings || []);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings");
      }
    };

    if (activeTab === "bookings") {
      loadBookings();
    }
  }, [activeTab]);

  const handleAddSpot = () => {
    setEditingSpot(null);
    setSpotForm({
      spotNumber: "",
      spotType: "Standard",
      section: "A",
      isAvailable: true,
      price: 25,
    });
    setShowSpotModal(true);
  };

  const handleEditSpot = (spot) => {
    setEditingSpot(spot);
    setSpotForm({
      spotNumber: spot.spotNumber,
      spotType: spot.spotType,
      section: spot.section,
      isAvailable: spot.isAvailable,
      price: spot.price,
    });
    setShowSpotModal(true);
  };

  const handleDeleteSpot = async (spotId) => {
    if (window.confirm("Are you sure you want to delete this parking spot?")) {
      try {
        await adminAPI.deleteParkingSpot(spotId);
        toast.success("Parking spot deleted successfully");
        // Reload spots
        const response = await adminAPI.getParkingSpots();
        setParkingSpots(response.data.data.spots || []);
      } catch (error) {
        console.error("Error deleting parking spot:", error);
        toast.error("Failed to delete parking spot");
      }
    }
  };

  const handleSpotSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSpot) {
        await adminAPI.updateParkingSpot(editingSpot.id, spotForm);
        toast.success("Parking spot updated successfully");
      } else {
        await adminAPI.createParkingSpot(spotForm);
        toast.success("Parking spot created successfully");
      }
      setShowSpotModal(false);
      // Reload spots
      const response = await adminAPI.getParkingSpots();
      setParkingSpots(response.data.data.spots || []);
    } catch (error) {
      console.error("Error saving parking spot:", error);
      toast.error("Failed to save parking spot");
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      // Simulate API call for saving settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <Car className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Spots
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parkingStats.totalSpots}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {parkingStats.activeBookings}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    ${parkingStats.revenue?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {parkingStats.recentBookings?.length > 0 ? (
                  parkingStats.recentBookings.map((booking, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <div>
                        <p className="font-medium">
                          Booking #{booking._id?.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.parking?.spotNumber || "Spot"} -{" "}
                          {booking.duration || 1} days
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed" ||
                          booking.status === "active"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent bookings</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Spot
                </button>
                <button className="w-full btn-secondary text-left">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Spots
                </button>
                <button className="w-full btn-secondary text-left">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </button>
                <button className="w-full btn-secondary text-left">
                  <Settings className="h-4 w-4 mr-2" />
                  Parking Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSpots = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Parking Spot Management</h2>
        <button
          onClick={handleAddSpot}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Spot
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parkingSpots.map((spot) => (
                <tr key={spot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Car className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {spot.spotNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          Section {spot.section}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {spot.spotType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${spot.price}/day
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        spot.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {spot.isAvailable ? "Available" : "Occupied"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {spot.currentBooking
                      ? `#${spot.currentBooking.id.slice(-8)} (${
                          spot.currentBooking.duration
                        })`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSpot(spot)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSpot(spot.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parking Spot Modal */}
      {showSpotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingSpot ? "Edit Parking Spot" : "Add New Parking Spot"}
              </h3>
              <button
                onClick={() => setShowSpotModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSpotSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Spot Number</label>
                  <input
                    type="text"
                    value={spotForm.spotNumber}
                    onChange={(e) =>
                      setSpotForm({ ...spotForm, spotNumber: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Section</label>
                  <select
                    value={spotForm.section}
                    onChange={(e) =>
                      setSpotForm({ ...spotForm, section: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Spot Type</label>
                  <select
                    value={spotForm.spotType}
                    onChange={(e) =>
                      setSpotForm({ ...spotForm, spotType: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Large">Large</option>
                    <option value="Compact">Compact</option>
                    <option value="Handicap">Handicap</option>
                    <option value="EV">EV Charging</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Price per Day ($)</label>
                  <input
                    type="number"
                    value={spotForm.price}
                    onChange={(e) =>
                      setSpotForm({
                        ...spotForm,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={spotForm.isAvailable}
                    onChange={(e) =>
                      setSpotForm({
                        ...spotForm,
                        isAvailable: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Spot is available</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSpotModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSpot ? "Update Spot" : "Add Spot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Parking Bookings</h2>
        <div className="flex space-x-2">
          <button className="btn-secondary">Export</button>
          <button className="btn-secondary">Filter</button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{booking.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.user?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.user?.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.parking?.spotNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.parking?.vehicleInfo?.licensePlate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.parking?.startDate && booking.parking?.endDate ? (
                      <>
                        {new Date(
                          booking.parking.startDate
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(booking.parking.endDate).toLocaleDateString()}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.pricing?.total || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parking Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Pricing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Hourly Rate ($)</label>
              <input
                type="number"
                value={settings.pricing.hourly}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      hourly: parseFloat(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="form-label">Daily Rate ($)</label>
              <input
                type="number"
                value={settings.pricing.daily}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      daily: parseFloat(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="form-label">Weekly Rate ($)</label>
              <input
                type="number"
                value={settings.pricing.weekly}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      weekly: parseFloat(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="form-label">Monthly Rate ($)</label>
              <input
                type="number"
                value={settings.pricing.monthly}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      monthly: parseFloat(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features.covered}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      covered: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Covered Parking</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features.security}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      security: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>24/7 Security</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features.shuttle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      shuttle: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Airport Shuttle</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features.evCharging}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      evCharging: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>EV Charging</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features.valet}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: { ...settings.features, valet: e.target.checked },
                  })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Valet Service</span>
            </label>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Opening Time</label>
              <input
                type="time"
                value={settings.operating.openingTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    operating: {
                      ...settings.operating,
                      openingTime: e.target.value,
                    },
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Closing Time</label>
              <input
                type="time"
                value={settings.operating.closingTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    operating: {
                      ...settings.operating,
                      closingTime: e.target.value,
                    },
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Grace Period (minutes)</label>
              <input
                type="number"
                value={settings.operating.gracePeriod}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    operating: {
                      ...settings.operating,
                      gracePeriod: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                max="60"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full btn-secondary text-left">
              <DollarSign className="h-4 w-4 mr-2" />
              Update All Spot Prices
            </button>
            <button className="w-full btn-secondary text-left">
              <Car className="h-4 w-4 mr-2" />
              Manage Spot Availability
            </button>
            <button className="w-full btn-secondary text-left">
              <Calendar className="h-4 w-4 mr-2" />
              View Booking Calendar
            </button>
            <button className="w-full btn-secondary text-left">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={settingsLoading}
          className="btn-primary flex items-center"
        >
          {settingsLoading ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "spots":
        return renderSpots();
      case "bookings":
        return renderBookings();
      case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Parking Admin Panel
        </h1>
        <p className="text-gray-600">
          Manage your parking lot operations and bookings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
};

export default ParkingAdminPanel;
