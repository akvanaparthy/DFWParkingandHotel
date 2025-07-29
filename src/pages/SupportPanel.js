import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBooking } from "../contexts/BookingContext";
import { supportAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader,
} from "lucide-react";

const SupportPanel = () => {
  const { user } = useAuth();
  const { bookings } = useBooking();
  const [activeTab, setActiveTab] = useState("tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
    category: "other",
  });

  // Load tickets from API
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const response = await supportAPI.getTickets({
          search: searchTerm,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });
        setTickets(response.data.data.tickets || []);
      } catch (error) {
        console.error("Error loading tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await supportAPI.updateTicket(ticketId, { status: newStatus });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
      toast.success("Ticket status updated");
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      await supportAPI.assignTicket(ticketId);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, assignedTo: user } : ticket
        )
      );
      toast.success("Ticket assigned successfully");
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast.error("Failed to assign ticket");
    }
  };

  const handleCreateTicket = async () => {
    if (newTicket.subject && newTicket.message) {
      try {
        const response = await supportAPI.createTicket(newTicket);
        const ticket = response.data.data.ticket;
        setTickets((prev) => [ticket, ...prev]);
        setNewTicket({
          subject: "",
          message: "",
          priority: "medium",
          category: "other",
        });
        toast.success("Ticket created successfully");
      } catch (error) {
        console.error("Error creating ticket:", error);
        toast.error("Failed to create ticket");
      }
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      case "urgent":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Panel</h1>
        <p className="text-gray-600">
          Manage customer support tickets and provide assistance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter((t) => t.status === "open").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter((t) => t.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tickets"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "create"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Create Ticket
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "tickets" && (
          <div className="card">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}

            {/* Tickets List */}
            {!loading && (
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tickets found</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket._id} className="card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(ticket.status)}
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{ticket.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {ticket.customer.name}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {ticket.customer.email}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {ticket.assignedTo && (
                            <div className="text-primary-600">
                              Assigned to: {ticket.assignedTo.name}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {!ticket.assignedTo && (
                            <button
                              onClick={() => handleAssignTicket(ticket._id)}
                              className="btn-primary text-sm"
                            >
                              Assign to Me
                            </button>
                          )}
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(ticket._id, e.target.value)
                            }
                            className="input-field text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="card max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Create Support Ticket
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="input-field"
                  rows={4}
                  placeholder="Detailed description of the issue..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) =>
                      setNewTicket((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="input-field"
                  >
                    <option value="other">Other</option>
                    <option value="booking">Booking</option>
                    <option value="payment">Payment</option>
                    <option value="technical">Technical</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateTicket}
                disabled={!newTicket.subject || !newTicket.message}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPanel;
