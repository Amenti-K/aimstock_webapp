"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateExpense } from "@/api/expense/api.expense";
import ExpenseForm from "@/components/forms/expense/ExpenseForm";
import { ExpenseFormValues } from "@/components/forms/expense/expense.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function NewExpensePage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const createExpense = useCreateExpense();
  if (!canCreate("EXPENSE")) return <AccessDeniedView moduleName="Expenses" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-sm text-muted-foreground">Record a new expense.</p>
        </div>
      </div>
      <ExpenseForm
        isPending={createExpense.isPending}
        submitLabel="Save expense"
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
