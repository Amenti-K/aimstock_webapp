"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useGetExpensesInfinite,
  useGetExpenseTemplatesInfinite,
  useCreateExpenseTemplate,
} from "@/api/expense/api.expense";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, ReceiptText, ChevronRight, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/formatter";
import SelectField from "@/components/forms/fields/SelectField";
import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().optional(),
  description: z.string().optional(),
});

function TemplateDropdownWithModal({
  templates,
  hasCreateAccess,
  t,
  router,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const { control: selectControl, reset: resetSelect } = useForm({
    defaultValues: { templateId: "" },
  });

  const {
    control: modalControl,
    handleSubmit,
    reset: resetModal,
  } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", amount: 0, description: "" },
  });

  const createTemplate = useCreateExpenseTemplate();

  const handleTemplateSelect = (val: string) => {
    if (!val || val === "__add_new__") return;
    const selected = templates.find((tmp: any) => tmp.id === val);
    if (selected) {
      const params = new URLSearchParams();
      params.set("templateId", selected.id);
      params.set("templateName", selected.name);
      if (selected.description) params.set("description", selected.description);
      if (selected.amount) params.set("amount", String(selected.amount));
      router.push(`/expense/new?${params.toString()}`);
    }
    resetSelect({ templateId: "" });
  };

  const onSubmit = (data: any) => {
    createTemplate.mutate(data, {
      onSuccess: (res: any) => {
        setIsOpen(false);
        resetModal();
        // Since React Query handles caching, we can safely just pre-fill assuming standard response holds .data
        const newTemplate = res?.data ?? data;

        const params = new URLSearchParams();
        if (newTemplate.id) params.set("templateId", newTemplate.id);
        if (newTemplate.name) params.set("templateName", newTemplate.name);
        if (newTemplate.description)
          params.set("description", newTemplate.description);
        if (newTemplate.amount)
          params.set("amount", String(newTemplate.amount));

        router.push(`/expense/new?${params.toString()}`);
      },
    });
  };

  return (
    <>
      <div className="w-[200px] sm:w-[250px]">
        <SelectField
          name="templateId"
          control={selectControl as any}
          placeholder={t(
            "expense.form.addCommonExpense",
            "Select common expense...",
          )}
          options={templates.map((tmp: any) => ({
            value: tmp.id,
            label: tmp.amount
              ? `${tmp.name} (${formatCurrency(tmp.amount)})`
              : tmp.name,
          }))}
          onValueChange={handleTemplateSelect}
          canAdd={hasCreateAccess}
          addLabel={t("expense.form.createNewTemplate", "Create New Template")}
          onAddClick={() => setIsOpen(true)}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("expense.form.createNewTemplate", "Create New Template")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="name"
              control={modalControl as any}
              label={t("expense.form.templateName", "Template Name")}
            />
            <NumericField
              name="amount"
              control={modalControl as any}
              label={t("expense.card.amount", "Amount (Optional)")}
              placeholder="0.00"
            />
            <TextAreaField
              name="description"
              control={modalControl as any}
              label={t("expense.card.description", "Description (Optional)")}
            />
            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <SubmitButton
                title={t("common.save", "Save")}
                loading={createTemplate.isPending}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ExpensePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("EXPENSE");
  const hasCreateAccess = canCreate("EXPENSE");

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetExpensesInfinite({}, hasViewAccess);

  const { data: templatesData } = useGetExpenseTemplatesInfinite(
    {},
    hasCreateAccess,
  );

  const expenses = useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  const templates = useMemo(() => {
    return templatesData?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [templatesData]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("expense.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="relative min-h-[calc(100vh-200px)] space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-1">
        <div className="flex flex-col w-full overflow-hidden">
          <div className="flex flex-row gap-2 justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ReceiptText className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("expense.moduleName")}
              </h1>
            </div>

            {/* Mobile Actions Overlay */}
            {hasCreateAccess && (
              <div className="sm:hidden flex items-center gap-2">
                <TemplateDropdownWithModal
                  templates={templates}
                  hasCreateAccess={hasCreateAccess}
                  t={t}
                  router={router}
                />
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("expense.emptyExpense")}
          </p>
        </div>

        {/* Desktop Actions */}
        {hasCreateAccess && (
          <div className="hidden sm:flex gap-4 items-end">
            <TemplateDropdownWithModal
              templates={templates}
              hasCreateAccess={hasCreateAccess}
              t={t}
              router={router}
            />

            <Button
              className="bg-primary hover:bg-primary/90 shadow-sm h-[40px] px-4 shrink-0 transition-transform active:scale-95"
              onClick={() => router.push("/expense/new")}
            >
              <Plus className="mr-2 h-4 w-4" /> {t("expense.form.addExpense")}
            </Button>
          </div>
        )}
      </div>

      {hasCreateAccess && (
        <Button
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden z-50 bg-primary hover:bg-primary/90 transition-transform active:scale-95"
          size="icon"
          onClick={() => router.push("/expense/new")}
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <ReceiptText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              {t("expense.emptyExpense")}
            </p>
          </div>
        ) : (
          expenses.map((exp: any) => (
            <ExpenseMobileCard
              key={exp.id}
              expense={exp}
              onClick={() => router.push(`/expense/${exp.id}`)}
              t={t}
            />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">
                {t("common.date")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("expense.card.template", "Template")}
              </TableHead>
              <TableHead className="font-semibold w-[400px]">
                {t("expense.card.description")}
              </TableHead>
              <TableHead className="font-semibold text-right px-6">
                {t("expense.card.amount")}
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("expense.emptyExpense")}
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((exp: any) => (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => router.push(`/expense/${exp.id}`)}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <ReceiptText className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground/80">
                        {formatDate(exp.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {exp.expenseTemplate ? (
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                        {exp.expenseTemplate.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 max-w-[400px]">
                      <span className="text-sm font-medium leading-none text-foreground/90 truncate">
                        {exp.description || t("expense.detail.unknownBank")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6 whitespace-nowrap">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(exp.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            variant="ghost"
            className="text-primary font-medium hover:bg-primary/5 rounded-full shadow-none"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t("common.loading") : t("common.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}

function ExpenseMobileCard({
  expense,
  onClick,
  t,
}: {
  expense: any;
  onClick: () => void;
  t: any;
}) {
  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm border-none flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group border border-border/50"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <ReceiptText className="h-8 w-8" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-lg leading-none truncate max-w-[150px]">
              {expense.description || t("expense.moduleName")}
            </h3>
            <span className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-2">
              {expense.expenseTemplate ? (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm max-w-[80px] truncate text-[10px]">
                  {expense.expenseTemplate.name}
                </span>
              ) : null}
              <span>{formatDate(expense.createdAt)}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-black text-lg text-red-600 dark:text-red-400">
            {formatCurrency(expense.amount)}
          </span>
          <ArrowRight className="h-5 w-5 mt-1 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
