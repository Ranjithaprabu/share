
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import { request } from "../../services/api";

const initialState = {
  user: JSON.parse(localStorage.getItem("connectly_user") || "null"),
  token: localStorage.getItem("connectly_token") || null,
  loading: false,
  error: null,
};

const authenticate = async (endpoint, credentials, rejectWithValue) => {
  try {
    const result = await request(endpoint, null, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = result.data ?? result;

    if (!data.token || !data.user) {
      throw new Error("Invalid authentication response from server");
    }

    localStorage.setItem("connectly_user", JSON.stringify(data.user));
    localStorage.setItem("connectly_token", data.token);

    return { user: data.user, token: data.token };
  } catch (error) {
    return rejectWithValue(error.message);
  }
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) =>
    authenticate("/auth/login", credentials, rejectWithValue)
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials, { rejectWithValue }) =>
    authenticate("/auth/register", credentials, rejectWithValue)
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("connectly_user", JSON.stringify(action.payload.user));
      localStorage.setItem("connectly_token", action.payload.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("connectly_user");
      localStorage.removeItem("connectly_token");
    },
    updateProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("connectly_user", JSON.stringify(state.user));
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(loginUser.pending, registerUser.pending),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(loginUser.fulfilled, registerUser.fulfilled),
        (state, action) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      )
      .addMatcher(
        isAnyOf(loginUser.rejected, registerUser.rejected),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "Authentication failed";
        }
      );
  },
});

export const {
  loginSuccess,
  logout,
  updateProfile,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
