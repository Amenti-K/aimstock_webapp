"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Package, Warehouse } from "lucide-react";

import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import { useCreateBulkInventory } from "@/api/inventory/api.inventory";
import {
  inventoriesArraySchema,
  inventoriesArrayFormValues,
} from "@/components/schema/inventory.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";
import { useLanguage } from "@/hooks/language.hook";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";

export default function Step2InventoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();

  // Fetch warehouses for distribution of initial quantities
  const { data: warehousesResponse, isLoading: loadingWarehouses } =
    useFetchWarehouseSelector();
  const warehouses = warehousesResponse?.data || [];

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.name}${warehouse.isInternal ? ` (${t("warehouse.card.isInternal")})` : ""}`,
      })),
    [warehouses, t],
  );

  const { mutateAsync: createBulkInventory, isPending } =
    useCreateBulkInventory();

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
          warehouseInventories: [
            { warehouseId: "", quantity: 0, reorderQuantity: 0 },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventories",
  });

  const handleAdd = () => {
    append({
      name: "",
      sku: "",
      unit: "pcs",
      brand: "",
      boughtPrice: 0,
      sellingPrice: 0,
      initialQuantity: 0,
      warehouseInventories: [
        { warehouseId: "", quantity: 0, reorderQuantity: 0 },
      ],
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-primary">
            {t("setup.header.stepCount", { current: 2, total: 3 })}
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Package className="w-8 h-8 text-primary" />
          {t("setup.step2.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("setup.step2.description")}
        </p>

        <div className="w-full h-2 bg-muted mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-2/3 transition-all duration-700 ease-in-out" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              className="fade-in-up border-primary/20 bg-background shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] overflow-hidden relative"
            >
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 hover:text-destructive z-20"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <div className="flex px-6 pb-4 items-center gap-3 border-b">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    {t("setup.step2.cardTitle", { index: index + 1 })}
                  </CardTitle>
                  <CardDescription>
                    {t("inventory.form.inventoryInfoDesc")}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="space-y-8">
                {/* Product Information Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <TextField
                    name={`inventories.${index}.name`}
                    control={form.control as any}
                    label={t("inventory.form.name")}
                    placeholder={t("inventory.card.name")}
                  />
                  <TextField
                    name={`inventories.${index}.sku`}
                    control={form.control as any}
                    label={t("inventory.form.sku")}
                    placeholder="CRN-0001"
                  />
                  <NumericField
                    name={`inventories.${index}.boughtPrice`}
                    control={form.control as any}
                    label={t("inventory.form.boughtPrice")}
                    placeholder="0"
                  />
                  <NumericField
                    name={`inventories.${index}.sellingPrice`}
                    control={form.control as any}
                    label={t("inventory.form.sellingPrice")}
                    placeholder="0"
                  />
                  <TextField
                    name={`inventories.${index}.unit`}
                    control={form.control as any}
                    label={t("inventory.form.unit")}
                    placeholder="pcs, kg, etc."
                  />
                  <NumericField
                    name={`inventories.${index}.initialQuantity`}
                    control={form.control as any}
                    label={t("inventory.form.initialQty")}
                    placeholder="0"
                  />
                </div>

                {/* Warehouse Distribution Section */}
                <div className="pt-8 border-t space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Warehouse className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold">
                        {t("inventory.form.wareInv.title")}
                      </h4>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full h-8 text-xs"
                      onClick={() => {
                        const currentWares = form.getValues(
                          `inventories.${index}.warehouseInventories`,
                        );
                        form.setValue(
                          `inventories.${index}.warehouseInventories`,
                          [
                            ...currentWares,
                            {
                              warehouseId: "",
                              quantity: 0,
                              reorderQuantity: 0,
                            },
                          ],
                        );
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {t("inventory.form.wareInv.addWare")}
                    </Button>
                  </div>

                  <WarehouseDistribution
                    index={index}
                    control={form.control}
                    warehouseOptions={warehouseOptions}
                    t={t}
                    form={form}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="w-full sm:w-auto rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("setup.step2.addAnother")}
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="px-10 rounded-full shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("setup.step2.nextStep")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function WarehouseDistribution({
  index,
  control,
  warehouseOptions,
  t,
  form,
}: any) {
  const { fields, remove } = useFieldArray({
    control,
    name: `inventories.${index}.warehouseInventories`,
  });

  const watchedWarehouses = form.watch(
    `inventories.${index}.warehouseInventories`,
  );

  const optionsForRow = (wIndex: number) => {
    const selectedIds = (watchedWarehouses ?? [])
      .map((w: any) => w?.warehouseId)
      .filter(Boolean);
    const currentId = watchedWarehouses?.[wIndex]?.warehouseId;
    return warehouseOptions.filter((option: any) => {
      if (option.value === currentId) return true;
      return !selectedIds.includes(option.value);
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, wIndex) => (
        <div className="overflow-x-auto grid grid-cols-16 gap-4 items-start">
          <div className="col-span-8">
            <SelectField
              name={`inventories.${index}.warehouseInventories.${wIndex}.warehouseId`}
              control={control as any}
              label={t("inventory.form.wareInv.ware")}
              placeholder={t("inventory.form.wareInv.selectWare")}
              options={optionsForRow(wIndex)}
            />
          </div>
          <div className="col-span-3 whitespace-nowrap">
            <NumericField
              name={`inventories.${index}.warehouseInventories.${wIndex}.quantity`}
              control={control as any}
              label={t("inventory.form.wareInv.qty")}
              placeholder="0"
            />
          </div>
          <div className="col-span-3 whitespace-nowrap">
            <NumericField
              name={`inventories.${index}.warehouseInventories.${wIndex}.reorderQuantity`}
              control={control as any}
              label={t("inventory.form.wareInv.reorderQty")}
              placeholder="0"
            />
          </div>
          <div className="col-span-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl mb-[2px]"
              onClick={() => remove(wIndex)}
              disabled={fields.length === 1}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
