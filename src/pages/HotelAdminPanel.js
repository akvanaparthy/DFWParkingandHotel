import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Building,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  Image,
  Settings,
  Loader,
  Save,
  CheckCircle,
  X,
} from "lucide-react";

const HotelAdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [hotelStats, setHotelStats] = useState({
    totalRooms: 0,
    activeBookings: 0,
    revenue: 0,
    recentBookings: [],
  });

  // Real data states
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingRoomType, setEditingRoomType] = useState(null);

  // Room form state
  const [roomForm, setRoomForm] = useState({
    type: "Standard",
    capacity: 2,
    price: 120,
    amenities: ["WiFi", "TV", "AC"],
    description: "",
    floor: 1,
    roomNumber: "",
  });

  // Room type form state
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
    capacity: 2,
    bedType: "King",
    bedCount: 1,
    amenities: [],
    images: [],
    isActive: true,
  });

  // Settings state
  const [settings, setSettings] = useState({
    pricing: {
      baseMultiplier: 1.0,
      weekendSurcharge: 15,
      holidaySurcharge: 25,
    },
    booking: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationHours: 24,
    },
    parking: {
      includesParking: false,
      parkingSpots: 0,
      parkingPrice: 0,
    },
  });

  // Hotel info state
  const [hotelInfo, setHotelInfo] = useState({
    name: "",
    description: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
  });

  const [settingsLoading, setSettingsLoading] = useState(false);

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: <DollarSign className="h-5 w-5" />,
    },
    { id: "rooms", name: "Rooms", icon: <Building className="h-5 w-5" /> },
    {
      id: "room-types",
      name: "Room Types",
      icon: <Edit className="h-5 w-5" />,
    },
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

  // Load hotel statistics
  useEffect(() => {
    const loadHotelStats = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getHotelStats();
        setHotelStats(response.data.data.statistics);
      } catch (error) {
        console.error("Error loading hotel stats:", error);
        toast.error("Failed to load hotel statistics");
      } finally {
        setLoading(false);
      }
    };

    loadHotelStats();
  }, []);

  // Load rooms for assigned hotel only
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await adminAPI.getHotelRooms();
        setRooms(response.data.data.rooms || []);
      } catch (error) {
        console.error("Error loading rooms:", error);
        toast.error("Failed to load rooms");
      }
    };

    if (activeTab === "rooms") {
      loadRooms();
    }
  }, [activeTab]);

  // Load bookings for assigned hotel only
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await adminAPI.getHotelBookings();
        setBookings(response.data.data.bookings || []);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings");
      }
    };

    const loadHotelInfo = async () => {
      try {
        const response = await adminAPI.getHotelInfo();
        setHotelInfo(response.data.data.hotel);
      } catch (error) {
        console.error("Error loading hotel info:", error);
        toast.error("Failed to load hotel info");
      }
    };

    if (activeTab === "bookings") {
      loadBookings();
    }
    if (activeTab === "settings") {
      loadHotelInfo();
    }
  }, [activeTab]);

  const handleAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      type: "Standard",
      capacity: 2,
      price: 120,
      amenities: ["WiFi", "TV", "AC"],
      description: "",
      floor: 1,
      roomNumber: "",
    });
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      amenities: room.amenities || [],
      description: room.description || "",
      floor: room.floor || 1,
      roomNumber: room.roomNumber || "",
    });
    setShowRoomModal(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await adminAPI.deleteHotelRoom(roomId);
        toast.success("Room deleted successfully");
        // Reload rooms
        const response = await adminAPI.getHotelRooms();
        setRooms(response.data.data.rooms || []);
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error("Failed to delete room");
      }
    }
  };

  // Room Type Management Functions
  const handleAddRoomType = () => {
    setEditingRoomType(null);
    setRoomTypeForm({
      name: "",
      description: "",
      basePrice: 0,
      capacity: 2,
      bedType: "King",
      bedCount: 1,
      amenities: [],
      images: [],
      isActive: true,
    });
    setShowRoomTypeModal(true);
  };

  const handleEditRoomType = (roomType) => {
    setEditingRoomType(roomType);
    setRoomTypeForm({
      name: roomType.name,
      description: roomType.description || "",
      basePrice: roomType.basePrice || 0,
      capacity: roomType.capacity || 2,
      bedType: roomType.bedType || "King",
      bedCount: roomType.bedCount || 1,
      amenities: roomType.amenities || [],
      images: roomType.images || [],
      isActive: roomType.isActive !== false,
    });
    setShowRoomTypeModal(true);
  };

  const handleDeleteRoomType = async (roomTypeId) => {
    if (window.confirm("Are you sure you want to delete this room type?")) {
      try {
        // Check if any rooms are using this type
        const roomsUsingType = rooms.filter((room) => room.type === roomTypeId);
        if (roomsUsingType.length > 0) {
          toast.error(
            "Cannot delete room type that is being used by existing rooms"
          );
          return;
        }

        // Delete room type (you'll need to implement this API endpoint)
        // await adminAPI.deleteRoomType(roomTypeId);
        toast.success("Room type deleted successfully");
        // Reload room types
        // const response = await adminAPI.getRoomTypes();
        // setRoomTypes(response.data.data.roomTypes || []);
      } catch (error) {
        console.error("Error deleting room type:", error);
        toast.error("Failed to delete room type");
      }
    }
  };

  const handleRoomTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoomType) {
        // await adminAPI.updateRoomType(editingRoomType.id, roomTypeForm);
        toast.success("Room type updated successfully");
      } else {
        // await adminAPI.createRoomType(roomTypeForm);
        toast.success("Room type created successfully");
      }
      setShowRoomTypeModal(false);
      // Reload room types
      // const response = await adminAPI.getRoomTypes();
      // setRoomTypes(response.data.data.roomTypes || []);
    } catch (error) {
      console.error("Error saving room type:", error);
      toast.error("Failed to save room type");
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await adminAPI.updateHotelRoom(editingRoom.id, roomForm);
        toast.success("Room updated successfully");
      } else {
        await adminAPI.createHotelRoom(roomForm);
        toast.success("Room created successfully");
      }
      setShowRoomModal(false);
      // Reload rooms
      const response = await adminAPI.getHotelRooms();
      setRooms(response.data.data.rooms || []);
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to save room");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, status);
      toast.success(`Booking status updated to ${status}`);
      // Reload bookings
      const response = await adminAPI.getHotelBookings();
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
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

  const handleSaveHotelInfo = async () => {
    setSettingsLoading(true);
    try {
      await adminAPI.updateHotelInfo(hotelInfo);
      toast.success("Hotel information updated successfully");
    } catch (error) {
      console.error("Error saving hotel info:", error);
      toast.error("Failed to save hotel information");
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
                  <Building className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Rooms
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hotelStats.totalRooms}
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
                    {hotelStats.activeBookings}
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
                    ${hotelStats.revenue?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {hotelStats.recentBookings?.length > 0 ? (
                  hotelStats.recentBookings.map((booking, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <div>
                        <p className="font-medium">
                          Booking #{booking._id?.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.hotel?.roomType || "Room"} -{" "}
                          {booking.guests || 1} guests
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
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
                  Add New Room
                </button>
                <button className="w-full btn-secondary text-left">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Rooms
                </button>
                <button className="w-full btn-secondary text-left">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </button>
                <button className="w-full btn-secondary text-left">
                  <Settings className="h-4 w-4 mr-2" />
                  Hotel Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Room Management</h2>
        <button
          onClick={handleAddRoom}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Room {room.roomNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          Floor {room.floor}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${room.price}/night
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.available ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        room.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.available ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
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

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, roomNumber: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Floor</label>
                  <input
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        floor: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Room Type</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, type: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    min="1"
                    max="10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Price per Night ($)</label>
                <input
                  type="number"
                  value={roomForm.price}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, description: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="form-label">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "WiFi",
                    "TV",
                    "AC",
                    "Mini Bar",
                    "Balcony",
                    "Ocean View",
                    "Kitchen",
                    "Jacuzzi",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={roomForm.amenities.includes(amenity)}
                        onChange={(e) => {
                          const amenities = e.target.checked
                            ? [...roomForm.amenities, amenity]
                            : roomForm.amenities.filter((a) => a !== amenity);
                          setRoomForm({ ...roomForm, amenities });
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingRoom ? "Update Room" : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderRoomTypes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Room Type Management</h2>
        <button
          onClick={handleAddRoomType}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room Type
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bed Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomTypes.map((roomType) => (
                <tr key={roomType.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {roomType.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {roomType.amenities?.length || 0} amenities
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {roomType.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${roomType.basePrice}/night
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {roomType.capacity} guests
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {roomType.bedCount} {roomType.bedType} bed
                    {roomType.bedCount > 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        roomType.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {roomType.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRoomType(roomType)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoomType(roomType.id)}
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

      {/* Room Type Modal */}
      {showRoomTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingRoomType ? "Edit Room Type" : "Add New Room Type"}
              </h3>
              <button
                onClick={() => setShowRoomTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleRoomTypeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Room Type Name</label>
                  <input
                    type="text"
                    value={roomTypeForm.name}
                    onChange={(e) =>
                      setRoomTypeForm({ ...roomTypeForm, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Deluxe King, Executive Suite"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Base Price ($)</label>
                  <input
                    type="number"
                    value={roomTypeForm.basePrice}
                    onChange={(e) =>
                      setRoomTypeForm({
                        ...roomTypeForm,
                        basePrice: parseFloat(e.target.value),
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
                <label className="form-label">Description</label>
                <textarea
                  value={roomTypeForm.description}
                  onChange={(e) =>
                    setRoomTypeForm({
                      ...roomTypeForm,
                      description: e.target.value,
                    })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Describe the room type, its features, and what makes it special..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    value={roomTypeForm.capacity}
                    onChange={(e) =>
                      setRoomTypeForm({
                        ...roomTypeForm,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Bed Type</label>
                  <select
                    value={roomTypeForm.bedType}
                    onChange={(e) =>
                      setRoomTypeForm({
                        ...roomTypeForm,
                        bedType: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="Twin">Twin</option>
                    <option value="Twin XL">Twin XL</option>
                    <option value="Full">Full</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                    <option value="California King">California King</option>
                    <option value="Sofa Bed">Sofa Bed</option>
                    <option value="Murphy Bed">Murphy Bed</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Number of Beds</label>
                  <input
                    type="number"
                    value={roomTypeForm.bedCount}
                    onChange={(e) =>
                      setRoomTypeForm({
                        ...roomTypeForm,
                        bedCount: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    min="1"
                    max="4"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Amenities</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "WiFi",
                    "TV",
                    "AC",
                    "Mini Bar",
                    "Balcony",
                    "Ocean View",
                    "Kitchen",
                    "Jacuzzi",
                    "Work Desk",
                    "Safe",
                    "Iron",
                    "Hair Dryer",
                    "Coffee Maker",
                    "Refrigerator",
                    "Microwave",
                    "Dishwasher",
                    "Washing Machine",
                    "Dryer",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={roomTypeForm.amenities.includes(amenity)}
                        onChange={(e) => {
                          const amenities = e.target.checked
                            ? [...roomTypeForm.amenities, amenity]
                            : roomTypeForm.amenities.filter(
                                (a) => a !== amenity
                              );
                          setRoomTypeForm({ ...roomTypeForm, amenities });
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Room Type Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload images for this room type
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="room-type-images"
                  />
                  <label
                    htmlFor="room-type-images"
                    className="btn-secondary cursor-pointer"
                  >
                    Choose Images
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={roomTypeForm.isActive}
                  onChange={(e) =>
                    setRoomTypeForm({
                      ...roomTypeForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Active (available for booking)</span>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoomTypeModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingRoomType ? "Update Room Type" : "Add Room Type"}
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
        <h2 className="text-xl font-semibold">Booking Management</h2>
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
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                    {booking.hotel?.roomType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.hotel?.checkIn && booking.hotel?.checkOut ? (
                      <>
                        {new Date(booking.hotel.checkIn).toLocaleDateString()} -{" "}
                        {new Date(booking.hotel.checkOut).toLocaleDateString()}
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
                          : booking.status === "checked_in"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "checked_out"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleUpdateBookingStatus(booking.id, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
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
      <h2 className="text-xl font-semibold">Hotel Settings</h2>

      {/* Hotel Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Hotel Name</label>
            <input
              type="text"
              value={hotelInfo.name}
              onChange={(e) =>
                setHotelInfo({ ...hotelInfo, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter hotel name"
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={hotelInfo.description}
              onChange={(e) =>
                setHotelInfo({ ...hotelInfo, description: e.target.value })
              }
              className="input-field"
              rows={4}
              placeholder="Describe your hotel, amenities, location benefits, etc."
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                value={hotelInfo.address.line1}
                onChange={(e) =>
                  setHotelInfo({
                    ...hotelInfo,
                    address: { ...hotelInfo.address, line1: e.target.value },
                  })
                }
                className="input-field"
                placeholder="Street address, P.O. box, company name"
              />
            </div>
            <div>
              <label className="form-label">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={hotelInfo.address.line2}
                onChange={(e) =>
                  setHotelInfo({
                    ...hotelInfo,
                    address: { ...hotelInfo.address, line2: e.target.value },
                  })
                }
                className="input-field"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={hotelInfo.address.city}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      address: { ...hotelInfo.address, city: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  value={hotelInfo.address.state}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      address: { ...hotelInfo.address, state: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  value={hotelInfo.address.zipCode}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      address: {
                        ...hotelInfo.address,
                        zipCode: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Country</label>
              <select
                value={hotelInfo.address.country}
                onChange={(e) =>
                  setHotelInfo({
                    ...hotelInfo,
                    address: { ...hotelInfo.address, country: e.target.value },
                  })
                }
                className="input-field"
              >
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveHotelInfo}
              className="btn-primary flex items-center"
              disabled={settingsLoading}
            >
              {settingsLoading ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Hotel Info
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Pricing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Base Price Multiplier</label>
              <input
                type="number"
                value={settings.pricing.baseMultiplier}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      baseMultiplier: parseFloat(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0.5"
                max="3"
                step="0.1"
              />
            </div>
            <div>
              <label className="form-label">Weekend Surcharge (%)</label>
              <input
                type="number"
                value={settings.pricing.weekendSurcharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      weekendSurcharge: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                max="50"
              />
            </div>
            <div>
              <label className="form-label">Holiday Surcharge (%)</label>
              <input
                type="number"
                value={settings.pricing.holidaySurcharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      holidaySurcharge: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Booking Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Check-in Time</label>
              <input
                type="time"
                value={settings.booking.checkInTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      checkInTime: e.target.value,
                    },
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Check-out Time</label>
              <input
                type="time"
                value={settings.booking.checkOutTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      checkOutTime: e.target.value,
                    },
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Cancellation Hours</label>
              <input
                type="number"
                value={settings.booking.cancellationHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      cancellationHours: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
                min="0"
                max="72"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Parking Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.parking.includesParking}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    parking: {
                      ...settings.parking,
                      includesParking: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Hotel includes parking for guests</span>
            </label>

            {settings.parking.includesParking && (
              <>
                <div>
                  <label className="form-label">Number of Parking Spots</label>
                  <input
                    type="number"
                    value={settings.parking.parkingSpots}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        parking: {
                          ...settings.parking,
                          parkingSpots: parseInt(e.target.value),
                        },
                      })
                    }
                    className="input-field"
                    min="1"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Parking Price per Day ($)
                  </label>
                  <input
                    type="number"
                    value={settings.parking.parkingPrice}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        parking: {
                          ...settings.parking,
                          parkingPrice: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Image Management</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Hotel Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop images here, or click to select
                </p>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="btn-secondary"
                >
                  Upload Images
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Terms & Conditions</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Enter hotel terms and conditions..."
              />
            </div>
            <div>
              <label className="form-label">Hotel Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Free WiFi",
                  "Shuttle Service",
                  "Restaurant",
                  "Pool",
                  "Gym",
                  "Spa",
                  "Business Center",
                  "Laundry",
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
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

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Upload Hotel Images</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Select images to upload
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-secondary cursor-pointer"
                >
                  Choose Files
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button className="btn-primary">Upload Images</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "rooms":
        return renderRooms();
      case "room-types":
        return renderRoomTypes();
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
        <h1 className="text-3xl font-bold text-gray-900">Hotel Admin Panel</h1>
        <p className="text-gray-600">
          Manage your hotel operations and bookings
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

export default HotelAdminPanel;
