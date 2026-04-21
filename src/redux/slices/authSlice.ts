import { Admin } from "@/components/interface/admin/admin.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  admin: Admin | null;
  loading: boolean;
  error: string | null;
}

const COOKIE_KEY = "admin_auth";
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: 7,
  path: "/",
};

function getInitialState(): AuthState {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
      admin: null,
      loading: false,
      error: null,
    };
  }

  try {
    const data = Cookies.get(COOKIE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        accessToken: parsed.accessToken ?? null,
        refreshToken: parsed.refreshToken ?? null,
        admin: parsed.admin ?? null,
        loading: false,
        error: null,
      };
    }
  } catch {}

  return {
    accessToken: null,
    refreshToken: null,
    admin: null,
    loading: false,
    error: null,
  };
}

const saveToCookie = (state: AuthState) => {
  try {
    const { accessToken, refreshToken, admin } = state;
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ accessToken, refreshToken, admin }),
      COOKIE_OPTIONS,
    );
  } catch {}
};

const authSlice = createSlice({
  name: "adminAuth",
  initialState: getInitialState(),
  reducers: {
    login(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        admin: Admin;
      }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.admin = action.payload.admin;
      saveToCookie(state);
    },

    updateAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      saveToCookie(state);
    },

    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.admin = null;
      Cookies.remove(COOKIE_KEY);
    },
  },
});

export const { login, updateAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
