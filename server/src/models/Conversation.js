const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],

    name: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
        default: null,
      },

    groupAvatar: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);
// Faster conversation lookup by participant
conversationSchema.index({
  "participants.user": 1,
  updatedAt: -1,
});

module.exports = mongoose.model("Conversation", conversationSchema);
