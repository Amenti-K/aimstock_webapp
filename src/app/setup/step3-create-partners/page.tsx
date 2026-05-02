"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Users } from "lucide-react";

import { useCreateManyPartners } from "@/api/partner/api.partner";

import { useAppDispatch } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";
import { useLanguage } from "@/hooks/language.hook";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import TextField from "@/components/forms/fields/TextField";
import {
  partnerArrayFormValues,
  partnersArraySchema,
} from "@/components/schema/partner.schema";

export default function Step3PartnerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();

  const { mutateAsync: createManyPartners, isPending } =
    useCreateManyPartners();

  const form = useForm<partnerArrayFormValues>({
    resolver: zodResolver(partnersArraySchema),
    defaultValues: {
      partners: [{ name: "", phone: "", address: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partners",
  });

  const handleAdd = () => {
    append({ name: "", phone: "", address: "" });
  };

  const onSubmit = async (data: partnerArrayFormValues) => {
    await createManyPartners(data, {
      onSuccess: () => {
        dispatch(setCompanyStep(4));
        router.push("/setup/finished");
      },
    });
  };

  const handleSkip = async () => {
    await createManyPartners(
      { partners: [] },
      {
        onSuccess: () => {
          dispatch(setCompanyStep(4));
          router.push("/setup/finished");
        },
      },
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="mb-8 scale-in-center">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-primary">
            {t("setup.header.stepCount", { current: 3, total: 3 })}
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          {t("setup.step3.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("setup.step3.description")}
        </p>

        <div className="w-full h-2 bg-muted mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-full transition-all duration-700 ease-in-out" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              className="fade-in-up border-primary/20 bg-background shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] overflow-hidden"
            >
              <CardContent className="p-6 relative space-y-4">
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
                  {t("setup.step3.cardTitle", { index: index + 1 })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <TextField
                      name={`partners.${index}.name`}
                      control={form.control as any}
                      label={t("partners.form.name")}
                      placeholder="e.g. ABC Supply Co."
                    />
                  </div>

                  <TextField
                    name={`partners.${index}.phone`}
                    control={form.control as any}
                    label={t("partners.form.phoneNum")}
                    placeholder="e.g. 0912345678"
                  />

                  <TextField
                    name={`partners.${index}.address`}
                    control={form.control as any}
                    label={t("partners.form.address")}
                    placeholder="e.g. Mercato, Addis Ababa"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {form.formState.errors.partners && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.partners.message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="w-full sm:w-auto rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("setup.step3.addAnother")}
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-6"
                onClick={() => {
                  dispatch(setCompanyStep(4));
                  router.push("/setup/finished");
                }}
              >
                {t("common.skip")}
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
                  t("setup.step3.finish")
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
