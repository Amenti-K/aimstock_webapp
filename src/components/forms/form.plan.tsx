import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { planSchema, PlanFormValues } from "@/components/schema/plan.schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  BillingInterval,
  FeatureKey,
  IPlan,
  LimitMetric,
} from "@/components/interface/subscription/subscription.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import TextField from "./fields/TextField";
import TextAreaField from "./fields/TextAreaField";
import CheckboxField from "./fields/CheckboxField";
import SimpleCheckboxField from "./fields/SimpleCheckboxField";
import SelectField from "./fields/SelectField";
import SubmitButton from "./fields/SubmitButton";

interface PlanFormProps {
  initialData?: IPlan; // If provided, we are in Edit mode
  onSubmit: (data: PlanFormValues) => void;
  isLoading?: boolean;
}

export function PlanForm({ initialData, onSubmit, isLoading }: PlanFormProps) {
  const defaultValues: PlanFormValues = {
    name: "",
    description: "",
    isEnterprise: false,
    limits: [],
    features: Object.values(FeatureKey).map((key) => ({
      feature: key,
      enabled: false,
    })),
    prices: [],
  };

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues,
  });

  const { control, handleSubmit, reset, getValues } = form;

  const {
    fields: limitFields,
    append: appendLimit,
    remove: removeLimit,
  } = useFieldArray({
    control,
    name: "limits",
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control,
    name: "prices",
  });

  const { fields: featureFields } = useFieldArray({
    control,
    name: "features",
  });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      // Merge initial data features with ALL possible features to ensure toggles exist
      const mergedFeatures = Object.values(FeatureKey).map((key) => {
        const existing = initialData.features.find((f) => f.feature === key);
        return {
          feature: key,
          enabled: existing ? existing.enabled : false,
        };
      });

      reset({
        name: initialData.name,
        description: initialData.description || "",
        isEnterprise: initialData.isEnterprise,
        limits: initialData.limits || [],
        prices: initialData.prices || [],
        features: mergedFeatures,
      });
    }
  }, [initialData, reset]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                control={control}
                name="name"
                label="Plan Name"
                placeholder="e.g. Pro Plan"
              />

              <TextAreaField
                control={control}
                name="description"
                label="Description"
                placeholder="Short description of the plan"
              />

              <CheckboxField
                control={control}
                name="isEnterprise"
                label="Enterprise Plan"
                description="Mark this if it is a custom enterprise plan."
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pricing</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendPrice({
                    amount: 0,
                    currency: "ETB",
                    interval: BillingInterval.MONTHLY,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Add Price
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {priceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-4 border p-4 rounded-md"
                >
                  <div className="flex-1">
                    <TextField
                      control={control}
                      name={`prices.${index}.amount`}
                      label="Amount"
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="w-24">
                    <TextField
                      control={control}
                      name={`prices.${index}.currency`}
                      label="Currency"
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <SelectField
                      control={control}
                      name={`prices.${index}.interval`}
                      label="Interval"
                      placeholder="Select interval"
                      options={Object.values(BillingInterval).map(
                        (interval) => ({
                          label: interval,
                          value: interval,
                        }),
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive mb-2"
                    onClick={() => removePrice(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {featureFields.map((field, index) => (
                <SimpleCheckboxField
                  key={field.id}
                  control={control}
                  name={`features.${index}.enabled`}
                  label={getValues(`features.${index}.feature`)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Limits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Limits</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendLimit({
                    metric: "" as LimitMetric,
                    value: 0,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Add Limit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {limitFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-2 border p-2 rounded-md"
                >
                  <div className="flex-1">
                    <SelectField
                      control={control}
                      name={`limits.${index}.metric`}
                      label="Metric"
                      placeholder="Metric"
                      options={Object.values(LimitMetric).map((metric) => ({
                        label: metric,
                        value: metric,
                      }))}
                    />
                  </div>
                  <div className="w-24">
                    <TextField
                      control={control}
                      name={`limits.${index}.value`}
                      label="Value"
                      type="number"
                      placeholder="∞"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive mb-2"
                    onClick={() => removeLimit(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <SubmitButton
            title={initialData ? "Update Plan" : "Create Plan"}
            loading={isLoading}
            className="w-auto"
          />
        </div>
      </form>
    </Form>
  );
}
