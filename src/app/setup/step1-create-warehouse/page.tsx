"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Building2 } from "lucide-react";

import { useCreateManyWarehouses } from "@/api/warehouse/api.warehouse";
import { warehousesArraySchema, FormWarehousesArrayValues } from "@/components/schema/warehouse.schema";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function Step1WarehousePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { company } = useAppSelector((state) => state.userAuth);

  const maxWarehouses = 2; // Can be based on subscription plan later
  
  const { mutateAsync: createManyWarehouses, isPending } = useCreateManyWarehouses();

  const form = useForm<FormWarehousesArrayValues>({
    resolver: zodResolver(warehousesArraySchema),
    defaultValues: {
      warehouses: [
        {
          name: "",
          location: "",
          contactPhone: "",
          description: "",
          isInternal: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "warehouses",
  });

  const isLimitReached = fields.length >= maxWarehouses;

  const handleAdd = () => {
    if (isLimitReached) return;
    append({
      name: "",
      location: "",
      contactPhone: "",
      description: "",
      isInternal: false,
    });
  };

  const onSubmit = async (data: FormWarehousesArrayValues) => {
    try {
      const payload = {
        warehouses: data.warehouses.map((w) => ({
          name: w.name,
          location: w.location || "",
          contactPhone: w.contactPhone || "",
          description: w.description || "",
          isInternal: w.isInternal ?? true,
        })),
      };

      await createManyWarehouses(payload);

      dispatch(setCompanyStep(2));
      router.push("/app/setup/step2-create-inventory");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="mb-8 scale-in-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          Step 1: Setup Warehouses
        </h1>
        <p className="text-muted-foreground mt-2">
          Add your initial warehouses or store locations to start tracking inventory. 
          You can add more later.
        </p>
        
        {/* Progress bar logic could go here */}
        <div className="w-full h-2 bg-muted mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/4 transition-all duration-500 ease-out" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="fade-in-up border-primary/20 bg-background shadow-sm">
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

                <h3 className="text-lg font-semibold mb-4">Warehouse #{index + 1}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`warehouses.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Main Store" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`warehouses.${index}.contactPhone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 0912345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`warehouses.${index}.location`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Location / Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Bole, Addis Ababa" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`warehouses.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Short description..." className="resize-none h-20" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`warehouses.${index}.isInternal`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md md:col-span-2 bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Is this an internal warehouse?
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Check this if this location is strictly internal and not open for direct customer sales.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {form.formState.errors.warehouses && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.warehouses.message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={isLimitReached}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLimitReached ? `Limit Reached (${maxWarehouses})` : "Add Another Warehouse"}
            </Button>

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto px-8">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Next Step"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
