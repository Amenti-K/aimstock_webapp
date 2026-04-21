import { IRole } from "../role/role.interface";
import { ISubscription } from "../subscription/subscription.interface";

export interface IUser {
  id: string;
  name: string;
  phoneNumber: string;
  companyId: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  userId: string;
  name: string;
  phoneNumber: string;
  role: IRole;
}

export interface CompanyInfo {
  id: string;
  name: string;
  setupStep: number;
  subscription: ISubscription | null;
}
