import { useFetch, useInfiniteFetch, useMutate } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import {
  IPaginatedResponse,
  IResponse,
} from "@/components/interface/common.interface";
import {
  ICompany,
  ICompanyList,
} from "@/components/interface/company/company.interface";

export const useFetchCompanies = (
  limit: number = 10,
  name?: string,
  ownerPhone?: string,
) => {
  return useInfiniteFetch<IPaginatedResponse<ICompanyList>>(endpoints.COMPANY, {
    queryKey: ["companies", name, ownerPhone],
    params: {
      limit,
      name,
      ownerPhone,
    },
  });
};

export const useFetchCompany = (id: string) => {
  return useFetch<IResponse<ICompany>>(endpoints.COMPANY + `/${id}`, {
    queryKey: ["company", id],
  });
};

export const useAttachCashAccount = () => {
  return useMutate<JSON>(endpoints.ADMIN + "/accounts", "patch", {
    queryKey: ["accounts"],
  });
};
