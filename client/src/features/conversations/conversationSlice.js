
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { request } from "../../services/api";

// Fetch existing conversations
export const fetchConversations = createAsyncThunk(
  "conversations/fetchConversations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const result = await request("/conversations", token);

      const currentUserId = String(getState().auth.user?.id);

      return result.conversations.map((conversation) => {
        const participants = conversation.participants || [];

        const otherParticipants = participants.filter(
          (participant) =>
            String(participant.user?._id || participant.user?.id) !==
            currentUserId
        );

        const otherUser = otherParticipants[0]?.user;

        const name =
          conversation.type === "group"
            ? conversation.name
            : otherUser?.name || "Unknown user";

        return {
          id: conversation._id,
          type: conversation.type,
          name,
          avatar: name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          color: "violet",
          online: false,
          lastMessage: "Start a conversation",
          time: new Date(conversation.updatedAt).toLocaleDateString(),
          unread: 0,
          messages: [],
          participants,
        };
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all registered users
export const fetchUsers = createAsyncThunk(
  "conversations/fetchUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const result = await request("/users", token);

      return result.users || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  users: [],
  activeId: null,
  loading: false,
  usersLoading: false,
  error: null,
};

const conversationSlice = createSlice({
  name: "conversations",
  initialState,

  reducers: {
    selectConversation(state, action) {
      state.activeId = action.payload;

      const selected = state.items.find(
        (item) => item.id === action.payload
      );

      if (selected) selected.unread = 0;
    },

    sendMessage(state, action) {
      const conversation = state.items.find(
        (item) => item.id === state.activeId
      );

      if (!conversation) return;

      const message = {
        id: Date.now(),
        sender: "me",
        text: action.payload,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      conversation.messages.push(message);
      conversation.lastMessage = action.payload;
      conversation.time = "Now";
    },

    addConversation(state, action) {
      state.items.unshift(action.payload);
      state.activeId = action.payload.id;
    },
  },

  extraReducers: (builder) => {
    builder
      // Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.activeId = action.payload[0]?.id || null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to load conversations";
      })

      // Registered users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload || "Failed to load users";
      });
  },
});

export const {
  selectConversation,
  sendMessage,
  addConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
