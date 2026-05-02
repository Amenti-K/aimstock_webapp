"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Building2 } from "lucide-react";

import { useCreateManyWarehouses } from "@/api/warehouse/api.warehouse";
import {
  warehousesArraySchema,
  FormWarehousesArrayValues,
} from "@/components/schema/warehouse.schema";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";
import { useLanguage } from "@/hooks/language.hook";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import TextField from "@/components/forms/fields/TextField";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SwitchField from "@/components/forms/fields/SwitchField";

export default function Step1WarehousePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { company } = useAppSelector((state) => state.userAuth);

  const maxWarehouses = 2; // Can be based on subscription plan later

  const { mutateAsync: createManyWarehouses, isPending } =
    useCreateManyWarehouses();

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
      router.push("/setup/step2-create-inventory");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="mb-8 scale-in-center">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-primary">
            {t("setup.header.stepCount", { current: 1, total: 3 })}
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          {t("setup.step1.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("setup.step1.description")}
        </p>

        <div className="w-full h-2 bg-muted mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3 transition-all duration-700 ease-in-out" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              className="fade-in-up border-primary/20 bg-background shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] overflow-hidden"
            >
              <CardContent className="relative space-y-4">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 hover:text-destructive z-10"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                <h3 className="text-lg font-semibold mb-4 text-primary">
                  {t("setup.step1.cardTitle", { index: index + 1 })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    name={`warehouses.${index}.name`}
                    control={form.control as any}
                    label={t("warehouse.form.name")}
                    placeholder={t("warehouse.form.name")}
                  />

                  <TextField
                    name={`warehouses.${index}.contactPhone`}
                    control={form.control as any}
                    label={t("warehouse.form.contactPhone")}
                    placeholder="0911xxxxxx"
                  />

                  <div className="md:col-span-2">
                    <TextField
                      name={`warehouses.${index}.location`}
                      control={form.control as any}
                      label={t("warehouse.form.location")}
                      placeholder={t("warehouse.form.location")}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TextAreaField
                      name={`warehouses.${index}.description`}
                      control={form.control as any}
                      label={t("warehouse.form.description")}
                      placeholder={t("warehouse.form.description")}
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <SwitchField
                      name={`warehouses.${index}.isInternal`}
                      control={form.control as any}
                      label={t("warehouse.form.isInternal")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("setup.step1.internalHint")}
                    </p>
                  </div>
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
              className="w-full sm:w-auto rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLimitReached
                ? t("setup.step1.limitReached", { count: maxWarehouses })
                : t("setup.step1.addAnother")}
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-10 rounded-full shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("setup.step1.nextStep")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
