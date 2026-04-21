import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchRolePermissionsApi } from "@/api/role/api.role";
import { Module, Permission, IPermission } from "@/types/permissions";

interface PermissionsState {
  byRole: Record<string, Record<Module, Permission[]>>;
  loading: boolean;
  error: string | null;
  lastFetchedRoleId?: string | null;
  fetchedAt?: number | null;
}

const initialState: PermissionsState = {
  byRole: {},
  loading: false,
  error: null,
  lastFetchedRoleId: null,
  fetchedAt: null,
};

export const fetchPermissionsByRole = createAsyncThunk<
  IPermission[],
  string,
  { rejectValue: string }
>("permissions/fetchByRole", async (roleId, { rejectWithValue }) => {
  try {
    return await fetchRolePermissionsApi(roleId);
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || err.message);
  }
});

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearPermissionsForRole(state, action: PayloadAction<string>) {
      delete state.byRole[action.payload];
    },
    clearAllPermissions(state) {
      state.byRole = {};
      state.lastFetchedRoleId = null;
      state.fetchedAt = null;
    },
    setPermissionsForRole(
      state,
      action: PayloadAction<{ roleId: string; permissions: IPermission[] }>,
    ) {
      const { roleId, permissions } = action.payload;
      const grouped: Record<Module, Permission[]> = {} as any;

      permissions.forEach((p) => {
        if (!grouped[p.module]) grouped[p.module] = [];
        grouped[p.module].push(p.permission);
      });

      state.byRole[roleId] = grouped;
      state.lastFetchedRoleId = roleId;
      state.fetchedAt = Date.now();
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionsByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsByRole.fulfilled, (state, action) => {
        const roleId = action.meta.arg;
        const arr = action.payload;

        const grouped: Record<Module, Permission[]> = {} as any;

        arr.forEach((p) => {
          if (!grouped[p.module]) grouped[p.module] = [];
          grouped[p.module].push(p.permission);
        });

        state.byRole[roleId] = grouped;
        state.lastFetchedRoleId = roleId;
        state.fetchedAt = Date.now();
        state.loading = false;
      })
      .addCase(fetchPermissionsByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch permissions";
      });
  },
});

export const {
  clearPermissionsForRole,
  clearAllPermissions,
  setPermissionsForRole,
} = permissionsSlice.actions;

export default permissionsSlice.reducer;
