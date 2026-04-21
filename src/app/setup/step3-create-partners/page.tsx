"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Users } from "lucide-react";

import { useCreateManyPartners } from "@/api/partner/api.partner";
import {
  partnersArraySchema,
  partnerArrayFormValues,
} from "@/components/schema/partner.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function Step3PartnersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mutateAsync: createBulkPartners, isPending } =
    useCreateManyPartners();

  const form = useForm<partnerArrayFormValues>({
    resolver: zodResolver(partnersArraySchema),
    defaultValues: {
      partners: [
        {
          name: "",
          phone: "",
          address: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partners",
  });

  const handleAdd = () => {
    append({
      name: "",
      phone: "",
      address: "",
    });
  };

  const onSubmit = async (data: partnerArrayFormValues) => {
    try {
      await createBulkPartners(data as any);
      dispatch(setCompanyStep(4));
      router.push("/app/setup/finished");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="mb-8 scale-in-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Step 3: Add Partners
        </h1>
        <p className="text-muted-foreground mt-2">
          Add your initial partners (suppliers or clients) so you can start
          creating transactions immediately.
        </p>

        <div className="w-full h-2 bg-muted mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-3/4 transition-all duration-500 ease-out" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              className="fade-in-up border-primary/20 bg-background shadow-sm"
            >
              <CardContent className="p-6 relative">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                <h3 className="text-lg font-semibold mb-4 text-primary">
                  Partner #{index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`partners.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Partner/Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ABC Supply Co." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`partners.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 0912345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`partners.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Mercato, Addis Ababa"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {form.formState.errors.partners?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.partners.root.message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Partner
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  // Skip logic
                  dispatch(setCompanyStep(4));
                  router.push("/app/setup/finished");
                }}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="px-8 flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Finish Setup"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
