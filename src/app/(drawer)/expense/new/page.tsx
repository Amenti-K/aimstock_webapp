"use client";

import { Suspense, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateExpense } from "@/api/expense/api.expense";
import ExpenseForm from "@/components/forms/expense/ExpenseForm";
import { ExpenseFormValues } from "@/components/forms/expense/expense.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/language.hook";
import { LoadingView } from "@/components/common/StateView";

function NewExpenseContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canCreate } = usePermissions();
  const createExpense = useCreateExpense();

  const templateId = searchParams.get("templateId");
  const templateName = searchParams.get("templateName");
  const description = searchParams.get("description");
  const amountStr = searchParams.get("amount");

  const initialData = useMemo(() => {
    const data: Partial<ExpenseFormValues> = {
      description: description ?? "",
      expenseTemplateId: templateId ?? undefined,
      paymentItems: [],
      cashItem: { amount: 0 },
    };
    return data;
  }, [description, templateId, amountStr]);

  if (!canCreate("EXPENSE"))
    return <AccessDeniedView moduleName={t("expense.moduleName")} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("expense.form.addExpense")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("expense.moduleName")}
          </p>
        </div>
      </div>
      <ExpenseForm
        initialData={initialData}
        templateName={templateName}
        isPending={createExpense.isPending}
        submitLabel={t("expense.form.addExpense")}
        onSubmit={(values: ExpenseFormValues) =>
          createExpense.mutate(values as any, {
            onSuccess: () => router.push("/expense"),
          })
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <NewExpenseContent />
    </Suspense>
  );
}
