import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { ISubscription } from "@/components/interface/subscription/subscription.interface";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserInfo {
  id: string;
  name: string;
  phoneNumber: string;
  companyId: string;
  role: {
    id: string;
    name: string;
    permissions: any[];
  };
}


export interface CompanyInfo {
  id: string;
  name: string;
  setupStep: number;
  subscription: ISubscription | null;
}

interface UserAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  company: CompanyInfo | null;
  loading: boolean;
  error: string | null;
}

// ─── Cookie Sync ──────────────────────────────────────────────────────────────
const COOKIE_KEY = "user_auth";
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: 7,
  path: "/",
};

function getInitialState(): UserAuthState {
  // Sync reading from cookies for immediate availability on reload
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      company: null,
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
        user: parsed.user ?? null,
        company: parsed.company ?? null,
        loading: false,
        error: null,
      };
    }
  } catch (err) {
    console.error("Error parsing user_auth cookie:", err);
  }

  return {
    accessToken: null,
    refreshToken: null,
    user: null,
    company: null,
    loading: false,
    error: null,
  };
}

const saveToCookie = (state: UserAuthState) => {
  try {
    const { accessToken, refreshToken, user, company } = state;
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ accessToken, refreshToken, user, company }),
      COOKIE_OPTIONS,
    );
  } catch (err) {
    console.error("Error saving to user_auth cookie:", err);
  }
};

// ─── Slice ─────────────────────────────────────────────────────────────────────
const initialState: UserAuthState = getInitialState();

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    loginUser(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: UserInfo;
        company: CompanyInfo;
      }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.company = action.payload.company;
      state.error = null;
      saveToCookie(state);
    },

    updateUserToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      saveToCookie(state);
    },

    setCompany(state, action: PayloadAction<CompanyInfo>) {
      state.company = action.payload;
      saveToCookie(state);
    },

    setSubscription(state, action: PayloadAction<ISubscription | null>) {
      if (state.company) {
        state.company.subscription = action.payload;
        saveToCookie(state);
      }
    },

    setCompanyStep(state, action: PayloadAction<number>) {
      if (state.company) {
        state.company.setupStep = action.payload;
        saveToCookie(state);
      }
    },

    logoutUser(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.company = null;
      state.error = null;
      Cookies.remove(COOKIE_KEY);
    },
  },
});

export const {
  loginUser,
  updateUserToken,
  setCompany,
  setSubscription,
  setCompanyStep,
  logoutUser,
} = userAuthSlice.actions;

export default userAuthSlice.reducer;
