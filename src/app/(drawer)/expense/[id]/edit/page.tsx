"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFetchExpenseById, useUpdateExpense } from "@/api/expense/api.expense";
import ExpenseForm from "@/components/forms/expense/ExpenseForm";
import { ExpenseFormValues } from "@/components/forms/expense/expense.schema";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function EditExpensePage() {
  const router = useRouter();
  const { id } = useParams();
  const expenseId = id as string;
  const { canUpdate } = usePermissions();
  if (!canUpdate("EXPENSE")) return <AccessDeniedView moduleName="Expenses" />;

  const { data, isLoading, isError, refetch } = useFetchExpenseById(expenseId, true);
  const updateExpense = useUpdateExpense(expenseId);
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const payload: any = {
    description: data.data.description || "",
    paymentItems: data.data.expensePayments?.map((item: any) => ({ accountId: item.accountId, amount: Number(item.amount) })) ?? [],
    cashItem: { amount: Number(data.data.expenseCashPayment?.amount || 0) },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Edit Expense</h1><p className="text-sm text-muted-foreground">Update expense information.</p></div>
      </div>
      <ExpenseForm
        initialData={payload}
        isPending={updateExpense.isPending}
        submitLabel="Save changes"
        onSubmit={(values: ExpenseFormValues) => updateExpense.mutate(values as any, { onSuccess: () => router.push(`/app/expense/${expenseId}`) })}
        onCancel={() => router.back()}
      />
    </div>
  );
}
