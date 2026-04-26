import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import {
  IPartner,
  IPartnerResponse,
  IPartnerDetail,
  INewPartner,
  IPartnerSelectorResponse,
} from "@/components/interface/partner/partner.interfacce";
import { IResponse } from "@/components/interface/common.interface";

interface BulkPartner {
  partners: Array<INewPartner>;
}

const onErrorNotification = (error: any) => {
  toast.error(
    error.response?.data?.message ||
      error.response?.data?.msg ||
      "An error occurred",
  );
};

const onSuccessNotification = (data: any) => {
  toast.success(data?.message || data?.msg || "Success!");
};

export const useCreatePartner = () => {
  return useMutate<IPartner>(endpoints.PARTNER, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.partners.root,
  });
};

export const useCreateManyPartners = () => {
  return useMutate<BulkPartner>(endpoints.PARTNER + "/bulk", "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.partners.root,
  });
};

export const useUpdatePartner = (id: string) => {
  return useMutate<IPartner>(endpoints.PARTNER + "/" + id, "patch", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.partners.root,
  });
};

export const useFetchPartnerById = (id: string, enabled?: boolean) => {
  return useFetch<IResponse<IPartnerDetail>>(endpoints.PARTNER + "/" + id, {
    queryKey: queryKeys.partners.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useFetchPartnerSelector = () => {
  return useFetch<IPartnerSelectorResponse>(endpoints.PARTNER + "/select", {
    queryKey: queryKeys.partners.selector(),
  });
};

export const useDeletePartner = () => {
  return useMutate((data: any) => `${endpoints.PARTNER}/${data.id}`, "delete", {
    onError: onErrorNotification,
    onSuccess: () => toast.success("Partner Deleted successfully!"),
    queryKey: queryKeys.partners.root,
  });
};

export const useGetPartnersInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<IPartnerResponse>(endpoints.PARTNER, {
    queryKey: queryKeys.partners.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};
