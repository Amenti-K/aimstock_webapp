import { IUser } from "../user/user.interface";
import { ISubscription, IUsage } from "../subscription/subscription.interface";

export interface ICompanyList {
  id: string;
  name: string;
  setupStep: number;
  createdAt: string;
  subscription: ISubscription | null;
  owner: IUser | null;
}

export interface ICompany extends ICompanyList {
  usages: IUsage[] | null;
}

export interface ICompanyFilterDto {
  page: number;
  limit: number;
  name?: string;
  ownerPhone?: string;
}
