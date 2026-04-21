import { Module, Permission } from "@/components/schema/role.schema";

export interface INewRole {
  name: string;
  permissions: INewPermission[];
}

export interface INewPermission {
  module: Module;
  permission: Permission;
}

export interface IRoleFormProps {
  selectedPRoleId?: string | undefined | null;
  onEdit?: (value: any) => void;
  item?: any | null;
}

export interface IPermission {
  id: string;
  module: Module;
  permission: Permission;
  roleId: string;
}

export interface IRole {
  id: string;
  name: string;
  permissions: IPermission[];
}

export interface IRoleResponse {
  data: IRole[];
}
