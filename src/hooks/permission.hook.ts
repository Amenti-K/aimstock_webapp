import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  fetchPermissionsByRole,
  setPermissionsForRole,
} from "@/redux/slices/permissionsSlice";
import { selectPermissionsForRole } from "@/redux/selectors/permissionSelector";
import { Module, Permission } from "@/types/permissions";

export const usePermissions = (roleId?: string) => {
  const dispatch = useDispatch();
  const { byRole, loading, error } = useSelector(
    (s: RootState) => s.permissions,
  );
  const { user } = useSelector((s: RootState) => s.userAuth);
  
  const effectiveRoleId = roleId || user?.role.id || undefined;

  const permissionsForRole = useSelector((s: RootState) =>
    selectPermissionsForRole(s, effectiveRoleId),
  );

  useEffect(() => {
    if (
      effectiveRoleId &&
      user?.role?.id === effectiveRoleId &&
      user.role.permissions
    ) {
      const hasPermissions = Boolean(byRole[effectiveRoleId]);
      if (!hasPermissions) {
        dispatch(
          setPermissionsForRole({
            roleId: effectiveRoleId,
            permissions: user.role.permissions,
          }) as any,
        );
      }
    }
  }, [dispatch, effectiveRoleId, user, byRole]);

  useEffect(() => {
    if (!effectiveRoleId) return;

    const hasPermissions = Boolean(byRole[effectiveRoleId]);

    if (!hasPermissions && !loading) {
      dispatch(fetchPermissionsByRole(effectiveRoleId) as any);
    }
  }, [dispatch, effectiveRoleId, byRole, loading]);

  const can = useCallback(
    (module: Module, permission: Permission) => {
      // 1. Check if we have specific role-based permissions in the slice
      if (effectiveRoleId) {
        const perms = byRole[effectiveRoleId];
        if (perms) {
          const modulePerms = perms[module] || [];
          if (modulePerms.includes("ALL")) return true;
          return modulePerms.includes(permission);
        }
      }

      // 2. Fallback: If slice is empty but we have permissions in the user object (hydrated from cookie)
      // This prevents the "Restricted" flash on reload
      if (effectiveRoleId === user?.role.id && user?.role.permissions) {
        const matchingPerm = user.role.permissions.find(
          (p: any) =>
            p.module === module &&
            (p.permission === permission || p.permission === "ALL"),
        );
        return !!matchingPerm;
      }

      return false;
    },
    [byRole, effectiveRoleId, user],
  );

  const canCreate = useCallback(
    (module: Module) => can(module, "CREATE"),
    [can],
  );
  const canView = useCallback((module: Module) => can(module, "VIEW"), [can]);
  const canUpdate = useCallback(
    (module: Module) => can(module, "UPDATE"),
    [can],
  );
  const canDelete = useCallback(
    (module: Module) => can(module, "DELETE"),
    [can],
  );

  const refresh = useCallback(() => {
    if (!effectiveRoleId) return;
    dispatch(fetchPermissionsByRole(effectiveRoleId) as any);
  }, [dispatch, effectiveRoleId]);

  return {
    can,
    canCreate,
    canView,
    canUpdate,
    canDelete,
    permissionsForRole,
    loading,
    error,
    refresh,
  };
};
