import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectPermissionsState = (state: RootState) =>
  state.permissions.byRole;

export const selectRoleId = (_: RootState, roleId?: string) => roleId;

export const selectPermissionsForRole = createSelector(
  [selectPermissionsState, selectRoleId],
  (byRole, roleId) => {
    if (!roleId) return null;
    return byRole[roleId] ?? null;
  }
);
