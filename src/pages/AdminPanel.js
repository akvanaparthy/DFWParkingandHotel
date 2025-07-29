import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Building,
  Car,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Settings,
  Package,
  Calendar,
  DollarSign,
  Loader,
  X,
  Save,
} from "lucide-react";

// Default rooms configuration
const defaultRooms = [
  {
    type: "Standard",
    name: "Standard Room",
    description: "Comfortable standard room with essential amenities",
    price: 150,
    capacity: 2,
    available: 10,
    amenities: ["King Bed", "Free WiFi", "TV", "Air Conditioning"],
    images: ["https://via.placeholder.com/400x300?text=Standard+Room"],
  },
  {
    type: "Deluxe",
    name: "Deluxe Room",
    description: "Spacious deluxe room with premium amenities",
    price: 250,
    capacity: 2,
    available: 5,
    amenities: ["King Bed", "Free WiFi", "TV", "Mini Bar", "Balcony"],
    images: ["https://via.placeholder.com/400x300?text=Deluxe+Room"],
  },
];

// Helper function to format role names for display
const formatRoleName = (role) => {
  const roleMap = {
    super_admin: "Super Admin",
    hotel_admin: "Hotel Admin",
    parking_admin: "Parking Admin",
    customer: "Customer",
  };
  return roleMap[role] || role;
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    users: 0,
    hotels: 0,
    parkingLots: 0,
    revenue: 0,
    recentActivity: [],
  });
  const [hotels, setHotels] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Modal states
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Assignment modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState(""); // "hotel" or "parking"
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [availableAdmins, setAvailableAdmins] = useState([]);

  // Form states
  const [hotelForm, setHotelForm] = useState({
    name: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    description: "",
    stars: 3,
    amenities: ["Free WiFi", "Shuttle Service", "Restaurant"],
    rooms: [],
  });

  const [parkingForm, setParkingForm] = useState({
    name: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    description: "",
    totalSpots: 50,
    features: ["Covered Parking", "24/7 Security", "Shuttle Service"],
    pricing: {
      hourly: 8,
      daily: 25,
      weekly: 150,
      monthly: 500,
    },
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    address: "",
  });

  // Admin assignment states for creation
  const [assignAdminOnCreate, setAssignAdminOnCreate] = useState(false);
  const [selectedAdminForCreate, setSelectedAdminForCreate] = useState(null);
  const [createNewAdmin, setCreateNewAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    { id: "hotels", name: "Hotels", icon: <Building className="h-5 w-5" /> },
    { id: "parking", name: "Parking", icon: <Car className="h-5 w-5" /> },
    { id: "users", name: "Users", icon: <Users className="h-5 w-5" /> },
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

  // Load dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getDashboard();
        setDashboardStats(response.data.data.statistics);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  // Load hotels
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await adminAPI.getAllHotels();
        console.log("Loaded hotels:", response.data.data.hotels);
        setHotels(response.data.data.hotels || []);
      } catch (error) {
        console.error("Error loading hotels:", error);
        toast.error("Failed to load hotels");
      }
    };

    if (activeTab === "hotels") {
      loadHotels();
    }
  }, [activeTab]);

  // Load parking lots
  useEffect(() => {
    const loadParkingLots = async () => {
      try {
        const response = await adminAPI.getAllParking();
        console.log("Loaded parking lots:", response.data.data.parkingLots);
        setParkingLots(response.data.data.parkingLots || []);
      } catch (error) {
        console.error("Error loading parking lots:", error);
        toast.error("Failed to load parking lots");
      }
    };

    if (activeTab === "parking") {
      loadParkingLots();
    }
  }, [activeTab]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await adminAPI.getAllUsers();
        setUsers(response.data.data.users || []);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users");
      }
    };

    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  // Load bookings
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await adminAPI.getAllBookings();
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

  const handleDeleteHotel = async (hotelId) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      try {
        await adminAPI.deleteHotel(hotelId);
        setHotels((prev) => prev.filter((hotel) => hotel.id !== hotelId));
        toast.success("Hotel deleted successfully");
      } catch (error) {
        console.error("Error deleting hotel:", error);
        toast.error("Failed to delete hotel");
      }
    }
  };

  const handleDeleteParkingLot = async (parkingId) => {
    if (window.confirm("Are you sure you want to delete this parking lot?")) {
      try {
        await adminAPI.deleteParkingLot(parkingId);
        setParkingLots((prev) => prev.filter((lot) => lot.id !== parkingId));
        toast.success("Parking lot deleted successfully");
      } catch (error) {
        console.error("Error deleting parking lot:", error);
        toast.error("Failed to delete parking lot");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEditHotel = (hotelId) => {
    const hotel = hotels.find((h) => h.id === hotelId);
    if (hotel) {
      setEditingItem(hotel);
      setHotelForm({
        name: hotel.name,
        address: hotel.address,
        description: hotel.description,
        stars: hotel.stars,
        amenities: hotel.amenities || [],
        rooms: hotel.rooms || [],
      });
      setShowHotelModal(true);
    }
  };

  const handleEditParkingLot = (parkingId) => {
    const parkingLot = parkingLots.find((p) => p.id === parkingId);
    if (parkingLot) {
      setEditingItem(parkingLot);
      setParkingForm({
        name: parkingLot.name,
        address: parkingLot.address,
        description: parkingLot.description,
        totalSpots: parkingLot.totalSpots,
        features: parkingLot.features || [],
        pricing: parkingLot.pricing || {
          hourly: 8,
          daily: 25,
          weekly: 150,
          monthly: 500,
        },
      });
      setShowParkingModal(true);
    }
  };

  const handleEditUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditingItem(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
      });
      setShowUserModal(true);
    }
  };

  const handleAddHotel = () => {
    setEditingItem(null);
    setHotelForm({
      name: "",
      address: "",
      description: "",
      stars: 3,
      amenities: ["Free WiFi", "Shuttle Service", "Restaurant"],
      rooms: [],
    });
    setShowHotelModal(true);
  };

  const handleAddParkingLot = () => {
    setEditingItem(null);
    setParkingForm({
      name: "",
      address: "",
      description: "",
      totalSpots: 50,
      features: ["Covered Parking", "24/7 Security", "Shuttle Service"],
      pricing: {
        hourly: 8,
        daily: 25,
        weekly: 150,
        monthly: 500,
      },
    });
    setShowParkingModal(true);
  };

  const handleAddUser = () => {
    setEditingItem(null);
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "customer",
      phone: "",
      address: "",
    });
    setShowUserModal(true);
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const hotelData = {
        ...hotelForm,
        // Use the structured address object
        address: hotelForm.address,
        location: {
          type: "Point",
          coordinates: [-96.797, 32.7767], // DFW coordinates
        },
        distance: "0.5 miles from DFW",
        capacity: {
          total: 100,
          available: 100,
        },
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        contact: {
          phone: "+1 (555) 123-4567",
          email: "info@hotel.com",
        },
        policies: {
          checkIn: "3:00 PM",
          checkOut: "11:00 AM",
          cancellation: "Free cancellation up to 24 hours before check-in",
        },
        rooms: defaultRooms,
      };

      if (editingItem) {
        await adminAPI.updateHotel(editingItem.id, hotelData);
        toast.success("Hotel updated successfully");
      } else {
        const response = await adminAPI.createHotel(hotelData);

        // If admin assignment is enabled, assign the hotel
        if (assignAdminOnCreate && (selectedAdminForCreate || createNewAdmin)) {
          let adminId = selectedAdminForCreate?.id;

          // Create new admin if needed
          if (createNewAdmin) {
            const newAdminData = {
              ...newAdminForm,
              role: "hotel_admin",
            };
            const newAdminResponse = await adminAPI.createUser(newAdminData);
            adminId = newAdminResponse.data.data.user.id;
          }

          // Assign hotel to admin
          if (adminId) {
            await adminAPI.assignProperty(
              "hotel",
              response.data.data.hotel.id,
              adminId
            );
            toast.success("Hotel created and assigned successfully");
          } else {
            toast.success("Hotel created successfully");
          }
        } else {
          toast.success("Hotel created successfully");
        }
      }

      setShowHotelModal(false);
      setHotelForm({
        name: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
        },
        description: "",
        stars: 3,
        amenities: ["Free WiFi", "Shuttle Service", "Restaurant"],
        rooms: [],
      });
      setAssignAdminOnCreate(false);
      setSelectedAdminForCreate(null);
      setCreateNewAdmin(false);
      setNewAdminForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error saving hotel:", error);
      toast.error("Failed to save hotel");
    } finally {
      setModalLoading(false);
    }
  };

  const handleParkingSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const parkingData = {
        ...parkingForm,
        // Use the structured address object
        address: parkingForm.address,
        location: {
          type: "Point",
          coordinates: [-96.797, 32.7767], // DFW coordinates
        },
        distance: "0.3 miles from DFW",
        capacity: {
          total: parkingForm.totalSpots,
          available: parkingForm.totalSpots,
        },
        images: [
          "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        contact: {
          phone: "+1 (555) 987-6543",
          email: "info@parking.com",
        },
        policies: {
          maxStay: 30,
          cancellation: "Free cancellation up to 2 hours before arrival",
        },
        operatingHours: {
          open: "24/7",
          close: "24/7",
        },
        parkingSpots: Array.from(
          { length: parkingForm.totalSpots },
          (_, i) => ({
            spotNumber: `A-${i + 1}`,
            type: "Standard",
            isAvailable: true,
            isReserved: false,
            currentBooking: null,
          })
        ),
      };

      if (editingItem) {
        await adminAPI.updateParkingLot(editingItem.id, parkingData);
        toast.success("Parking lot updated successfully");
      } else {
        const response = await adminAPI.createParkingLot(parkingData);

        // If admin assignment is enabled, assign the parking lot
        if (assignAdminOnCreate && (selectedAdminForCreate || createNewAdmin)) {
          let adminId = selectedAdminForCreate?.id;

          // Create new admin if needed
          if (createNewAdmin) {
            const newAdminData = {
              ...newAdminForm,
              role: "parking_admin",
            };
            const newAdminResponse = await adminAPI.createUser(newAdminData);
            adminId = newAdminResponse.data.data.user.id;
          }

          // Assign parking lot to admin
          if (adminId) {
            await adminAPI.assignProperty(
              "parking",
              response.data.data.parkingLot.id,
              adminId
            );
            toast.success("Parking lot created and assigned successfully");
          } else {
            toast.success("Parking lot created successfully");
          }
        } else {
          toast.success("Parking lot created successfully");
        }
      }

      setShowParkingModal(false);
      setParkingForm({
        name: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
        },
        description: "",
        totalSpots: 50,
        features: ["Covered Parking", "24/7 Security", "Shuttle Service"],
        pricing: {
          hourly: 8,
          daily: 25,
          weekly: 150,
          monthly: 500,
        },
      });
      setAssignAdminOnCreate(false);
      setSelectedAdminForCreate(null);
      setCreateNewAdmin(false);
      setNewAdminForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error saving parking lot:", error);
      toast.error("Failed to save parking lot");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingItem) {
        const updateData = { ...userForm };
        if (!updateData.password) {
          delete updateData.password;
        }
        await adminAPI.updateUser(editingItem.id, updateData);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingItem.id ? { ...user, ...updateData } : user
          )
        );
        toast.success("User updated successfully");
      } else {
        const response = await adminAPI.createUser(userForm);
        setUsers((prev) => [response.data.data.user, ...prev]);
        toast.success("User created successfully");
      }
      setShowUserModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  const handleViewBooking = (bookingId) => {
    // TODO: Implement booking view modal
    toast.info("Booking view feature coming soon");
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await adminAPI.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      // Reload bookings
      const response = await adminAPI.getAllBookings();
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleAssignProperty = async (type, property) => {
    setAssignmentType(type);
    setSelectedProperty(property);
    setShowAssignmentModal(true);

    // Ensure users are loaded
    if (users.length === 0) {
      try {
        const response = await adminAPI.getAllUsers();
        const allUsers = response.data.data.users || [];
        setUsers(allUsers);

        // Load available admins
        const admins = allUsers.filter((user) =>
          type === "hotel"
            ? user.role === "hotel_admin"
            : user.role === "parking_admin"
        );
        console.log(`Found ${admins.length} ${type} admins:`, admins);
        setAvailableAdmins(admins);
      } catch (error) {
        console.error("Error loading users for assignment:", error);
        toast.error("Failed to load users");
      }
    } else {
      // Load available admins from existing users
      const admins = users.filter((user) =>
        type === "hotel"
          ? user.role === "hotel_admin"
          : user.role === "parking_admin"
      );
      console.log(
        `Found ${admins.length} ${type} admins from existing users:`,
        admins
      );
      setAvailableAdmins(admins);
    }

    // Reset selected admin
    setSelectedAdmin(null);
  };

  const handleAssignmentSubmit = async () => {
    if (!selectedAdmin) {
      toast.error("Please select an admin");
      return;
    }

    try {
      console.log("Assigning property:", {
        type: assignmentType,
        propertyId: selectedProperty.id,
        adminId: selectedAdmin.id,
        propertyName: selectedProperty.name,
        adminName: selectedAdmin.name,
      });

      await adminAPI.assignProperty(
        assignmentType,
        selectedProperty.id,
        selectedAdmin.id
      );
      toast.success(
        `${
          assignmentType === "hotel" ? "Hotel" : "Parking lot"
        } assigned successfully`
      );
      setShowAssignmentModal(false);

      // Reload data
      if (assignmentType === "hotel") {
        const response = await adminAPI.getAllHotels();
        console.log("Reloaded hotels:", response.data.data.hotels);
        setHotels(response.data.data.hotels || []);
      } else {
        const response = await adminAPI.getAllParking();
        console.log("Reloaded parking lots:", response.data.data.parkingLots);
        setParkingLots(response.data.data.parkingLots || []);
      }
    } catch (error) {
      console.error("Error assigning property:", error);
      toast.error("Failed to assign property");
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.users}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <Building className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hotels</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.hotels}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500 text-white">
                  <Car className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Parking Lots
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.parkingLots}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardStats.revenue?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {dashboardStats.recentActivity?.length > 0 ? (
                  dashboardStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm">{activity.description}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAddHotel}
                  className="w-full btn-primary text-left"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Hotel
                </button>
                <button
                  onClick={handleAddParkingLot}
                  className="w-full btn-secondary text-left"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Parking Lot
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full btn-secondary text-left"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="w-full btn-secondary text-left"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderHotels = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hotel Management</h2>
        <button
          onClick={handleAddHotel}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hotel.rating} ★
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof hotel.address === "object"
                      ? `${hotel.address.line1}${
                          hotel.address.line2 ? `, ${hotel.address.line2}` : ""
                        }, ${hotel.address.city}, ${hotel.address.state} ${
                          hotel.address.zipCode
                        }`
                      : hotel.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {hotel.rooms?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {hotel.admin?.name || "Not Assigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditHotel(hotel.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAssignProperty("hotel", hotel)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Assign Admin
                      </button>
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

  const renderParking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Parking Management</h2>
        <button
          onClick={handleAddParkingLot}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parking Lot
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parking Lot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spots
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parkingLots.map((lot) => (
                <tr key={lot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Car className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lot.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lot.distance}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof lot.address === "object"
                      ? `${lot.address.line1}${
                          lot.address.line2 ? `, ${lot.address.line2}` : ""
                        }, ${lot.address.city}, ${lot.address.state} ${
                          lot.address.zipCode
                        }`
                      : lot.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.totalSpots}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {lot.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.admin?.name || "Not Assigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditParkingLot(lot.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParkingLot(lot.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAssignProperty("parking", lot)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Assign Admin
                      </button>
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

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={handleAddUser}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatRoleName(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Bookings</h2>
        <div className="flex space-x-2">
          <select className="input-field">
            <option value="">All Types</option>
            <option value="hotel">Hotel</option>
            <option value="parking">Parking</option>
            <option value="both">Hotel + Parking</option>
          </select>
          <select className="input-field">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{booking.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.user?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.type === "hotel"
                          ? "bg-blue-100 text-blue-800"
                          : booking.type === "parking"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {booking.type === "both"
                        ? "Hotel + Parking"
                        : booking.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.pricing?.total || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBooking(booking.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
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
      <h2 className="text-xl font-semibold">System Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Hotel Commission (%)</label>
              <input type="number" className="input-field" defaultValue="10" />
            </div>
            <div>
              <label className="form-label">Parking Commission (%)</label>
              <input type="number" className="input-field" defaultValue="15" />
            </div>
            <button onClick={handleSaveSettings} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tax Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                className="input-field"
                defaultValue="8.25"
              />
            </div>
            <div>
              <label className="form-label">Service Fee (%)</label>
              <input type="number" className="input-field" defaultValue="5" />
            </div>
            <button onClick={handleSaveSettings} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Newsletter Campaign</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Campaign Subject</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter campaign subject"
              />
            </div>
            <div>
              <label className="form-label">Campaign Message</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Enter campaign message"
              ></textarea>
            </div>
            <div>
              <label className="form-label">Target Audience</label>
              <select className="input-field">
                <option value="all">All Users</option>
                <option value="customers">Customers Only</option>
                <option value="hotel_admins">Hotel Admins</option>
                <option value="parking_admins">Parking Admins</option>
              </select>
            </div>
            <button onClick={handleSaveSettings} className="btn-primary">
              Send Newsletter
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Live Chat Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Chat Widget Status</label>
              <select className="input-field">
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div>
              <label className="form-label">Support Hours</label>
              <input type="text" className="input-field" defaultValue="24/7" />
            </div>
            <div>
              <label className="form-label">Auto-Response Message</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Enter auto-response message"
              ></textarea>
            </div>
            <button onClick={handleSaveSettings} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "hotels":
        return renderHotels();
      case "parking":
        return renderParking();
      case "users":
        return renderUsers();
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">
          Manage your DFW Parking & Hotel Booking platform
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

      {/* Hotel Modal */}
      {showHotelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit Hotel" : "Add New Hotel"}
              </h3>
              <button
                onClick={() => setShowHotelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleHotelSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelForm.name}
                    onChange={(e) =>
                      setHotelForm({ ...hotelForm, name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Stars</label>
                  <select
                    value={hotelForm.stars}
                    onChange={(e) =>
                      setHotelForm({
                        ...hotelForm,
                        stars: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <option key={star} value={star}>
                        {star} Star{star !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    value={hotelForm.address.line1}
                    onChange={(e) =>
                      setHotelForm({
                        ...hotelForm,
                        address: {
                          ...hotelForm.address,
                          line1: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                    placeholder="Street address, P.O. box, company name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={hotelForm.address.line2}
                    onChange={(e) =>
                      setHotelForm({
                        ...hotelForm,
                        address: {
                          ...hotelForm.address,
                          line2: e.target.value,
                        },
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
                      value={hotelForm.address.city}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          address: {
                            ...hotelForm.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={hotelForm.address.state}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          address: {
                            ...hotelForm.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      value={hotelForm.address.zipCode}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          address: {
                            ...hotelForm.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <select
                    value={hotelForm.address.country}
                    onChange={(e) =>
                      setHotelForm({
                        ...hotelForm,
                        address: {
                          ...hotelForm.address,
                          country: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={hotelForm.description}
                  onChange={(e) =>
                    setHotelForm({ ...hotelForm, description: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Describe the hotel, its amenities, location benefits, etc."
                  required
                />
              </div>

              {/* Admin Assignment Section */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-3">Admin Assignment</h4>
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={assignAdminOnCreate}
                    onChange={(e) => setAssignAdminOnCreate(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={true}
                  />
                  <span>Assign admin to this hotel</span>
                </label>

                {assignAdminOnCreate && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="flex items-center space-x-3 mb-2">
                        <input
                          type="radio"
                          checked={!createNewAdmin}
                          onChange={() => setCreateNewAdmin(false)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>Select existing admin</span>
                      </label>
                      {!createNewAdmin && (
                        <select
                          value={selectedAdminForCreate?.id || ""}
                          onChange={(e) => {
                            const admin = users.find(
                              (u) =>
                                u.id === e.target.value &&
                                u.role === "hotel_admin"
                            );
                            setSelectedAdminForCreate(admin);
                          }}
                          className="input-field"
                        >
                          <option value="">
                            Choose an existing hotel admin...
                          </option>
                          {users
                            .filter((u) => u.role === "hotel_admin")
                            .map((admin) => (
                              <option key={admin.id} value={admin.id}>
                                {admin.name} ({admin.email}) -{" "}
                                {formatRoleName(admin.role)}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-3 mb-2">
                        <input
                          type="radio"
                          checked={createNewAdmin}
                          onChange={() => setCreateNewAdmin(true)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>Create new admin</span>
                      </label>
                      {createNewAdmin && (
                        <div className="space-y-3">
                          <div>
                            <label className="form-label">Admin Name</label>
                            <input
                              type="text"
                              value={newAdminForm.name}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  name: e.target.value,
                                })
                              }
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Admin Email</label>
                            <input
                              type="email"
                              value={newAdminForm.email}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  email: e.target.value,
                                })
                              }
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Admin Password</label>
                            <input
                              type="password"
                              value={newAdminForm.password}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  password: e.target.value,
                                })
                              }
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Admin Phone</label>
                            <input
                              type="tel"
                              value={newAdminForm.phone}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  phone: e.target.value,
                                })
                              }
                              className="input-field"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowHotelModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? "Update Hotel" : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Assign {assignmentType === "hotel" ? "Hotel" : "Parking Lot"}{" "}
                Admin
              </h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">
                  {assignmentType === "hotel" ? "Hotel" : "Parking Lot"}
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-semibold">{selectedProperty?.name}</p>
                  <p className="text-sm text-gray-600">
                    {typeof selectedProperty?.address === "object"
                      ? `${selectedProperty.address.line1}${
                          selectedProperty.address.line2
                            ? `, ${selectedProperty.address.line2}`
                            : ""
                        }, ${selectedProperty.address.city}, ${
                          selectedProperty.address.state
                        } ${selectedProperty.address.zipCode}`
                      : selectedProperty?.address}
                  </p>
                </div>
              </div>

              <div>
                <label className="form-label">Select Admin</label>
                <select
                  value={selectedAdmin?.id || ""}
                  onChange={(e) => {
                    const admin = availableAdmins.find(
                      (a) => a.id === e.target.value
                    );
                    setSelectedAdmin(admin);
                  }}
                  className="input-field"
                  required
                >
                  <option value="">Choose an admin...</option>
                  {availableAdmins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email}) -{" "}
                      {formatRoleName(admin.role)}
                    </option>
                  ))}
                </select>
              </div>

              {availableAdmins.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    No {assignmentType === "hotel" ? "hotel" : "parking"} admins
                    available. Please create one first.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignmentSubmit}
                  disabled={!selectedAdmin || availableAdmins.length === 0}
                  className="btn-primary"
                >
                  Assign Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parking Modal */}
      {showParkingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit Parking Lot" : "Add New Parking Lot"}
              </h3>
              <button
                onClick={() => setShowParkingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleParkingSubmit} className="space-y-4">
              <div>
                <label className="form-label">Parking Lot Name</label>
                <input
                  type="text"
                  value={parkingForm.name}
                  onChange={(e) =>
                    setParkingForm({ ...parkingForm, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    value={parkingForm.address.line1}
                    onChange={(e) =>
                      setParkingForm({
                        ...parkingForm,
                        address: {
                          ...parkingForm.address,
                          line1: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                    placeholder="Street address, P.O. box, company name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={parkingForm.address.line2}
                    onChange={(e) =>
                      setParkingForm({
                        ...parkingForm,
                        address: {
                          ...parkingForm.address,
                          line2: e.target.value,
                        },
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
                      value={parkingForm.address.city}
                      onChange={(e) =>
                        setParkingForm({
                          ...parkingForm,
                          address: {
                            ...parkingForm.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={parkingForm.address.state}
                      onChange={(e) =>
                        setParkingForm({
                          ...parkingForm,
                          address: {
                            ...parkingForm.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      value={parkingForm.address.zipCode}
                      onChange={(e) =>
                        setParkingForm({
                          ...parkingForm,
                          address: {
                            ...parkingForm.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <select
                    value={parkingForm.address.country}
                    onChange={(e) =>
                      setParkingForm({
                        ...parkingForm,
                        address: {
                          ...parkingForm.address,
                          country: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={parkingForm.description}
                  onChange={(e) =>
                    setParkingForm({
                      ...parkingForm,
                      description: e.target.value,
                    })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Describe the parking lot, its features, location benefits, etc."
                  required
                />
              </div>

              {/* Admin Assignment Section */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-3">Admin Assignment</h4>
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={assignAdminOnCreate}
                    onChange={(e) => setAssignAdminOnCreate(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={true}
                  />
                  <span>Assign admin to this parking lot</span>
                </label>

                {assignAdminOnCreate && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="flex items-center space-x-3 mb-2">
                        <input
                          type="radio"
                          checked={!createNewAdmin}
                          onChange={() => setCreateNewAdmin(false)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>Select existing admin</span>
                      </label>
                      {!createNewAdmin && (
                        <select
                          value={selectedAdminForCreate?.id || ""}
                          onChange={(e) => {
                            const admin = users.find(
                              (u) =>
                                u.id === e.target.value &&
                                u.role === "parking_admin"
                            );
                            setSelectedAdminForCreate(admin);
                          }}
                          className="input-field"
                        >
                          <option value="">
                            Choose an existing parking admin...
                          </option>
                          {users
                            .filter((u) => u.role === "parking_admin")
                            .map((admin) => (
                              <option key={admin.id} value={admin.id}>
                                {admin.name} ({admin.email}) -{" "}
                                {formatRoleName(admin.role)}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-3 mb-2">
                        <input
                          type="radio"
                          checked={createNewAdmin}
                          onChange={() => setCreateNewAdmin(true)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>Create new admin</span>
                      </label>
                      {createNewAdmin && (
                        <div className="space-y-3">
                          <div>
                            <label className="form-label">Admin Name</label>
                            <input
                              type="text"
                              value={newAdminForm.name}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  name: e.target.value,
                                })
                              }
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Admin Email</label>
                            <input
                              type="email"
                              value={newAdminForm.email}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  email: e.target.value,
                                })
                              }
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Admin Password</label>
                            <input
                              type="password"
                              value={newAdminForm.password}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  password: e.target.value,
                                })
                              }
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Admin Phone</label>
                            <input
                              type="tel"
                              value={newAdminForm.phone}
                              onChange={(e) =>
                                setNewAdminForm({
                                  ...newAdminForm,
                                  phone: e.target.value,
                                })
                              }
                              className="input-field"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Total Spots</label>
                <input
                  type="number"
                  value={parkingForm.totalSpots}
                  onChange={(e) =>
                    setParkingForm({
                      ...parkingForm,
                      totalSpots: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={parkingForm.pricing.hourly}
                    onChange={(e) =>
                      setParkingForm({
                        ...parkingForm,
                        pricing: {
                          ...parkingForm.pricing,
                          hourly: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Daily Rate ($)</label>
                  <input
                    type="number"
                    value={parkingForm.pricing.daily}
                    onChange={(e) =>
                      setParkingForm({
                        ...parkingForm,
                        pricing: {
                          ...parkingForm.pricing,
                          daily: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary flex items-center"
                >
                  {modalLoading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingItem ? "Update Parking Lot" : "Create Parking Lot"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowParkingModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="form-label">
                  {editingItem
                    ? "Password (leave blank to keep current)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  className="input-field"
                  required={!editingItem}
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="customer">Customer</option>
                  <option value="hotel_admin">Hotel Admin</option>
                  <option value="parking_admin">Parking Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="form-label">Phone (Optional)</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm({ ...userForm, phone: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Address (Optional)</label>
                <textarea
                  value={userForm.address}
                  onChange={(e) =>
                    setUserForm({ ...userForm, address: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary flex items-center"
                >
                  {modalLoading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingItem ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
