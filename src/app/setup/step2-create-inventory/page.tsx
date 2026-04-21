"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Package } from "lucide-react";

import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import { useCreateBulkInventory } from "@/api/inventory/api.inventory";
import {
  inventoriesArraySchema,
  inventoriesArrayFormValues,
} from "@/components/schema/inventory.schema";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Step2InventoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Fetch warehouses for distribution of initial quantities
  const { data: warehousesResponse, isLoading: loadingWarehouses } =
    useFetchWarehouseSelector();
  const warehouses = warehousesResponse?.data || [];

  const { mutateAsync: createBulkInventory, isPending } =
    useCreateBulkInventory();

  // If there are warehouses, we default each product to have warehouse inventories initialized
  const defaultWarehouseInventories = warehouses.map((w) => ({
    warehouseId: w.id,
    quantity: 0,
    reorderQuantity: 0,
  }));

  const form = useForm<inventoriesArrayFormValues>({
    resolver: zodResolver(inventoriesArraySchema),
    defaultValues: {
      inventories: [
        {
          name: "",
          sku: "",
          unit: "pcs",
          brand: "",
          boughtPrice: 0,
          sellingPrice: 0,
          initialQuantity: 0,
          warehouseInventories: defaultWarehouseInventories,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventories",
  });

  // Re-populate if warehouses load late
  React.useEffect(() => {
    if (
      warehouses.length > 0 &&
      fields.length > 0 &&
      fields[0].warehouseInventories.length === 0
    ) {
      form.setValue(
        "inventories.0.warehouseInventories",
        warehouses.map((w) => ({
          warehouseId: w.id,
          quantity: 0,
          reorderQuantity: 0,
        })),
      );
    }
  }, [warehouses, fields, form]);

  const handleAdd = () => {
    append({
      name: "",
      sku: "",
      unit: "pcs",
      brand: "",
      boughtPrice: 0,
      sellingPrice: 0,
      initialQuantity: 0,
      warehouseInventories: warehouses.map((w) => ({
        warehouseId: w.id,
        quantity: 0,
        reorderQuantity: 0,
      })),
    });
  };

  const onSubmit = async (data: inventoriesArrayFormValues) => {
    try {
      await createBulkInventory(data as any);
      dispatch(setCompanyStep(3));
      router.push("/setup/step3-create-partners");
    } catch (error) {
      console.error(error);
    }
  };

  if (loadingWarehouses) {
    return (
      <div className="flex w-full min-h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="mb-8 scale-in-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Package className="w-8 h-8 text-primary" />
          Step 2: Add Initial Products
        </h1>
        <p className="text-muted-foreground mt-2">
          Let's add some initial inventory to your system. You can specify
          prices, quantities and distribute them across your warehouses.
        </p>

        <div className="w-full h-2 bg-muted mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-2/4 transition-all duration-500 ease-out" />
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
                  Product #{index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name={`inventories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. iPhone 15 Pro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inventories.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="IPH-15-PRO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inventories.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="pcs, kg, box" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inventories.${index}.boughtPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bought Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inventories.${index}.sellingPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inventories.${index}.initialQuantity`}
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Total Initial Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="warehouses" className="border-none">
                    <AccordionTrigger className="bg-muted/50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/70 transition-colors">
                      Distribute Quantity Across Warehouses
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 space-y-4">
                      {form
                        .watch(`inventories.${index}.warehouseInventories`)
                        ?.map((wi, wIndex) => {
                          const warehouse = warehouses.find(
                            (w) => w.id === wi.warehouseId,
                          );
                          return (
                            <div
                              key={wIndex}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-background border rounded-lg p-3"
                            >
                              <span className="font-semibold text-sm">
                                {warehouse?.name || "Unknown Warehouse"}
                              </span>
                              <div className="flex space-x-2">
                                <FormField
                                  control={form.control}
                                  name={`inventories.${index}.warehouseInventories.${wIndex}.quantity`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel className="text-xs">
                                        Quantity
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 0,
                                            )
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`inventories.${index}.warehouseInventories.${wIndex}.reorderQuantity`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel className="text-xs">
                                        Reorder At
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 0,
                                            )
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {form.formState.errors?.inventories?.[index]
                  ?.initialQuantity && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {
                      form.formState.errors.inventories[index]?.initialQuantity
                        ?.message
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {form.formState.errors.inventories?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.inventories.root.message}
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
              Add Another Product
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  // Skip logic
                  dispatch(setCompanyStep(3));
                  router.push("/setup/step3-create-partners");
                }}
              >
                Skip for now
              </Button>
              <Button type="submit" disabled={isPending} className="px-8">
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
          </div>
        </form>
      </Form>
    </div>
  );
}
