import { useMutate } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

export interface ContactMessage {
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
}

export const useSendMessage = (options?: { onSuccess?: (data: any) => void }) => {
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to send message",
      variant: "destructive",
    });
  };

  const onSuccess = (data: any) => {
    toast({
      title: "Success",
      description: data?.message || "Message sent successfully",
    });
    options?.onSuccess?.(data);
  };

  return useMutate<ContactMessage>(endpoints.MAILCONTACT, "post", {
    onSuccess,
    onError,
  });
};
