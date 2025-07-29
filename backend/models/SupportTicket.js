const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: String,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["booking", "payment", "technical", "service", "other"],
      default: "other",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: Date,
    resolvedAt: Date,
    resolution: String,
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: [
      {
        content: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    tags: [String],
    isUrgent: {
      type: Boolean,
      default: false,
    },
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ "customer.email": 1 });
supportTicketSchema.index({ createdAt: -1 });

// Virtual for ticket age
supportTicketSchema.virtual("age").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to assign ticket
supportTicketSchema.methods.assignTicket = function (userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  if (this.status === "open") {
    this.status = "in_progress";
  }
  return this.save();
};

// Method to resolve ticket
supportTicketSchema.methods.resolveTicket = function (resolution, userId) {
  this.status = "resolved";
  this.resolution = resolution;
  this.resolvedAt = new Date();

  // Add resolution note
  this.notes.push({
    content: `Ticket resolved: ${resolution}`,
    createdBy: userId,
  });

  return this.save();
};

// Method to add note
supportTicketSchema.methods.addNote = function (content, userId) {
  this.notes.push({
    content,
    createdBy: userId,
  });
  return this.save();
};

// Method to update status
supportTicketSchema.methods.updateStatus = function (newStatus, userId) {
  this.status = newStatus;

  // Add status change note
  this.notes.push({
    content: `Status changed to: ${newStatus}`,
    createdBy: userId,
  });

  if (newStatus === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  return this.save();
};

// Static method to get ticket statistics
supportTicketSchema.statics.getStatistics = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgAge: { $avg: { $subtract: [new Date(), "$createdAt"] } },
      },
    },
  ]);
};

// Static method to get tickets by priority
supportTicketSchema.statics.getByPriority = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);
};

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
