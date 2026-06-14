"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  Receipt,
  Calculator,
  Building2,
  UserPlus,
} from "lucide-react";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SelectField from "@/components/forms/fields/SelectField";
import SelectSearchField from "@/components/forms/fields/SelectSearchField";
import NumericField from "@/components/forms/fields/NumericField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PartnerForm from "@/components/forms/partner/PartnerForm";
import {
  useFetchPartnerSelector,
  useCreatePartner,
} from "@/api/partner/api.partner";
import {
  useFetchInventorySelector,
  useGetInventoriesInfinite,
} from "@/api/inventory/api.inventory";
import { useFetchAccountSelector } from "@/api/account/api.account";
import { formatCurrency } from "@/lib/formatter";
import { useLanguage } from "@/hooks/language.hook";
import {
  INewPurchase,
  IPurchaseView,
} from "../../interface/purchase/purchase.interface";
import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import { PartnerFormValues } from "@/components/forms/partner/partner.schema";
import InventoryForm from "@/components/forms/inventory/InventoryForm";
import { useCreateInventory } from "@/api/inventory/api.inventory";
import {
  inventoryFormValues,
  QuickInventoryFormValues,
} from "@/components/schema/inventory.schema";
import { usePermissions } from "@/hooks/permission.hook";
import InventoryQuickForm from "../inventory/InventoryQuickForm";

type PurchaseFormValues = {
  partnerId: string;
  description: string;
  purchaseItems: Array<{
    inventoryId: string;
    warehouseId: string;
    quantity: number;
    unitPrice: number;
  }>;
  purchasePayments: Array<{
    accountId: string;
    amount: number;
  }>;
  purchaseCashPayment: {
    amount: number;
  };
};

interface PurchaseFormProps {
  initialData?: IPurchaseView | null;
  onSubmit: (payload: INewPurchase) => void;
  isLoading?: boolean;
}

/** Build form values from initialData (used for both defaultValues and reset) */
function buildFormValues(
  initialData: IPurchaseView | null | undefined,
): PurchaseFormValues {
  if (!initialData) {
    return {
      partnerId: "",
      description: "",
      purchaseItems: [
        { inventoryId: "", warehouseId: "", quantity: 0, unitPrice: 0 },
      ],
      purchasePayments: [],
      purchaseCashPayment: { amount: 0 },
    };
  }
  return {
    partnerId: initialData.partnerId
      ? String(initialData.partnerId)
      : initialData.partner?.id
        ? String(initialData.partner.id)
        : "",
    description: initialData.description || "",
    purchaseItems: initialData.purchaseItems?.map((item: any) => ({
      inventoryId: item.inventory?.id || item.inventoryId || "",
      warehouseId: item.warehouse?.id || item.warehouseId || "",
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    })) ?? [{ inventoryId: "", warehouseId: "", quantity: 0, unitPrice: 0 }],
    purchasePayments:
      initialData.purchasePayments?.map((payment: any) => ({
        accountId: payment.account?.id || payment.accountId || "",
        amount: Number(payment.amount) || 0,
      })) ?? [],
    purchaseCashPayment: {
      amount: Number(initialData.purchaseCashPayment?.amount) || 0,
    },
  };
}

export default function PurchaseForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PurchaseFormProps) {
  const { t } = useLanguage();
  const { canCreate } = usePermissions();
  const canCreateInventory = canCreate("INVENTORY");

  const form = useForm<PurchaseFormValues>({
    defaultValues: buildFormValues(initialData),
  });
  const { control, handleSubmit, setError, reset, setValue } = form;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (x: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: x,
        behavior: "smooth",
      });
    }
  };

  // Re-sync whenever initialData reference changes (e.g., after async fetch)
  useEffect(() => {
    reset(buildFormValues(initialData));
  }, [initialData, reset]);

  // ── Field arrays ─────────────────────────────────────────────────────────
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: "purchaseItems" });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({ control, name: "purchasePayments" });

  // ── Partner quick-add state ───────────────────────────────────────────────
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    data: partnersData,
    isLoading: partnersLoading,
    refetch: refetchPartners,
  } = useFetchPartnerSelector();

  const { mutate: createPartner, isPending: creatingPartner } =
    useCreatePartner();

  const {
    data: inventoriesData,
    isLoading: inventoriesLoading,
    refetch: refetchInventories,
  } = useFetchInventorySelector(canCreateInventory);

  const { mutate: createInventory, isPending: creatingInventory } =
    useCreateInventory();
  const { data: accountsData, isLoading: accountsLoading } =
    useFetchAccountSelector();
  const { data: warehouses, isLoading: warehousesLoading } =
    useFetchWarehouseSelector();

  const allInventories = useMemo(
    () => inventoriesData?.data ?? [],
    [inventoriesData],
  );

  // ── Select options ────────────────────────────────────────────────────────
  const partnerOptions = useMemo(
    () =>
      (partnersData?.data ?? [])
        .filter((partner: any) => !!partner.id)
        .map((partner: any) => ({
          label: partner.name,
          value: String(partner.id),
        })),
    [partnersData],
  );

  const inventoryOptions = useMemo(
    () =>
      allInventories.map((inventory: any) => ({
        label: inventory.name,
        value: inventory.id,
      })),
    [allInventories],
  );

  const accountOptions = useMemo(() => {
    // Determine if data is nested in .data property or is the array itself
    const list = Array.isArray(accountsData)
      ? accountsData
      : Array.isArray(accountsData?.data)
        ? accountsData.data
        : [];

    return list.map((account: any) => ({
      label: `${account.name} (${account.bank}) (${formatCurrency(account.balance ?? 0)})`,
      value: String(account.id),
    }));
  }, [accountsData]);

  const warehouseOptions = useMemo(() => {
    if (!Array.isArray(warehouses?.data)) return [];
    return warehouses.data.map((w: any) => ({ value: w.id, label: w.name }));
  }, [warehouses]);

  // ── Quick-add handlers ─────────────────────────────────────────────────────
  const handlePartnerCreated = (values: PartnerFormValues) => {
    createPartner(values as any, {
      onSuccess: (data: any) => {
        const newId = data?.data?.id ?? data?.id;
        refetchPartners().then(() => {
          if (newId) setValue("partnerId", String(newId));
        });
        setShowAddPartner(false);
      },
    });
  };

  const handleInventoryCreated = (values: inventoryFormValues) => {
    createInventory(values as any, {
      onSuccess: () => {
        refetchInventories();
        setShowAddInventory(false);
      },
    });
  };

  // ── Financial calculations ────────────────────────────────────────────────
  const watchedItems = useWatch({ control, name: "purchaseItems" });
  const watchedBankPayments = useWatch({ control, name: "purchasePayments" });
  const watchedCashPayment = useWatch({ control, name: "purchaseCashPayment" });

  const grandTotal = (watchedItems ?? []).reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );

  const totalPaid =
    (watchedBankPayments ?? []).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    ) + Number(watchedCashPayment?.amount || 0);

  const outstandingBalance = Math.max(0, grandTotal - totalPaid);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleFormSubmit = (values: PurchaseFormValues) => {
    const sanitizedItems = values.purchaseItems.filter(
      (item) => item.inventoryId && Number(item.quantity) > 0,
    );
    if (sanitizedItems.length === 0) {
      setError("purchaseItems", {
        type: "manual",
        message: "At least one valid item is required.",
      });
      return;
    }

    const sanitizedPayments = values.purchasePayments
      .filter((payment) => payment.accountId && Number(payment.amount) > 0)
      .map((payment) => ({
        accountId: payment.accountId,
        amount: Number(payment.amount),
      }));

    onSubmit({
      partnerId: values.partnerId,
      description: values.description?.trim() || undefined,
      purchaseItems: sanitizedItems.map((item) => ({
        inventoryId: item.inventoryId,
        warehouseId: item.warehouseId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        id: "",
      })),
      paymentItems: sanitizedPayments,
      purchaseCashPayment:
        Number(values.purchaseCashPayment.amount) > 0
          ? { amount: Number(values.purchaseCashPayment.amount) }
          : undefined,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-w-7xl mx-auto pb-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── Left Column: Form Details ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Information */}
              <Card className="shadow-sm border-primary/10">
                <CardHeader className="border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    {t("purchase.detail.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Supplier select — with quick-add */}
                  <SelectField
                    name="partnerId"
                    control={control as any}
                    label={t("purchase.form.supplier")}
                    placeholder={
                      partnersLoading
                        ? t("common.loading")
                        : t("purchase.form.selectPartner")
                    }
                    options={partnerOptions}
                    canAdd
                    addLabel={t("partners.form.addNewPar")}
                    onAddClick={() => setShowAddPartner(true)}
                  />
                  <TextAreaField
                    name="description"
                    control={control as any}
                    label={t("purchase.form.description")}
                    placeholder={t("purchase.form.description")}
                  />
                </CardContent>
              </Card>

              {/* Items Section */}
              <Card className="shadow-sm border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                  <CardTitle className="text-base whitespace-nowrap flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    {t("purchase.form.items.title")}
                  </CardTitle>
                  <div className="flex flex-row flex-noWrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-primary text-primary hover:bg-primary/5"
                      onClick={() =>
                        appendItem({
                          inventoryId: "",
                          warehouseId: "",
                          quantity: 0,
                          unitPrice: 0,
                        })
                      }
                    >
                      {t("purchase.form.items.addItem")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-primary text-primary hover:bg-primary/5"
                      onClick={() => setShowAddInventory(true)}
                    >
                      {t("purchase.form.items.createItem")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent
                  ref={scrollContainerRef}
                  className="overflow-x-auto scroll-smooth"
                >
                  <div className="min-w-[750px] space-y-3">
                    {/* Header Row */}
                    <div className="grid grid-cols-15 gap-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="col-span-4">
                        {t("purchase.form.items.item")}
                      </div>
                      <div className="col-span-2">
                        {t("purchase.form.items.qty")}
                      </div>
                      <div className="col-span-2">
                        {t("purchase.form.items.unitPrice")}
                      </div>
                      <div className="col-span-4">
                        {t("purchase.form.items.warehouse")}
                      </div>
                      <div className="col-span-2">
                        {t("purchase.form.items.subTotal")}
                      </div>
                      <div className="col-span-1 text-center" />
                    </div>

                    {itemFields.map((field, index) => {
                      const itemTotal =
                        Number(watchedItems?.[index]?.quantity || 0) *
                        Number(watchedItems?.[index]?.unitPrice || 0);

                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-15 gap-3 items-start p-2 rounded-lg border hover:border-primary/30 transition-colors"
                        >
                          {/* Item — searchable select */}
                          <div className="col-span-4 min-w-[180px]">
                            <SelectSearchField
                              name={`purchaseItems.${index}.inventoryId`}
                              control={control as any}
                              placeholder={
                                inventoriesLoading
                                  ? t("common.loading")
                                  : t("purchase.form.items.selectItem")
                              }
                              options={inventoryOptions}
                              searchPlaceholder={t("common.search")}
                              emptyMessage={t("common.noResults")}
                              onValueChange={(val) => {
                                const item = allInventories.find(
                                  (it: any) => it.id === val,
                                );
                                if (item) {
                                  setValue(
                                    `purchaseItems.${index}.unitPrice`,
                                    Number(item.boughtPrice) || 0,
                                  );
                                  if (item.warehouseInventories?.length === 1) {
                                    setValue(
                                      `purchaseItems.${index}.warehouseId`,
                                      item.warehouseInventories[0].warehouseId,
                                    );
                                  } else {
                                    setValue(
                                      `purchaseItems.${index}.warehouseId`,
                                      "",
                                    );
                                  }
                                  handleScroll(150);
                                }
                              }}
                            />
                          </div>

                          {/* Quantity */}
                          <div className="col-span-2 min-w-[50px]">
                            <NumericField
                              name={`purchaseItems.${index}.quantity`}
                              control={control as any}
                              placeholder="0"
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="col-span-2 min-w-[80px]">
                            <NumericField
                              name={`purchaseItems.${index}.unitPrice`}
                              control={control as any}
                              placeholder="0"
                            />
                          </div>

                          {/* Warehouse */}
                          <div className="col-span-4 min-w-[180px]">
                            <SelectField
                              name={`purchaseItems.${index}.warehouseId`}
                              control={control as any}
                              placeholder={
                                warehousesLoading
                                  ? t("common.loading")
                                  : t("purchase.form.items.selectWarehouse")
                              }
                              options={warehouseOptions}
                              onValueChange={() => handleScroll(600)}
                            />
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-2 min-w-[80px]">
                            <div className="h-9 flex items-center px-3 rounded-md bg-muted/50 border text-sm font-bold text-primary">
                              {formatCurrency(itemTotal, true, 0)}
                            </div>
                          </div>

                          {/* Remove */}
                          <div className="col-span-1 flex justify-center min-w-[20px]">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:bg-destructive/10"
                              onClick={() => removeItem(index)}
                              disabled={itemFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Consolidated Payment Section */}
              <Card className="shadow-sm border-primary/10">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    {t("purchase.detail.accordion.payments")}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Cash Payment Row */}
                  <div className="flex justify-between items-center gap-2 space-x-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      <Banknote className="h-5 w-5" />
                      {t("purchase.form.cashPay.title")}
                    </div>
                    <div className="w-[40%]">
                      <NumericField
                        name="purchaseCashPayment.amount"
                        control={control as any}
                        placeholder={t("purchase.form.cashPay.amount")}
                      />
                    </div>
                  </div>

                  <div className="border-t border-dashed pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                        <Building2 className="h-5 w-5" />
                        {t("purchase.form.bankPay.title")}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[12px] border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() =>
                          appendPayment({ accountId: "", amount: 0 })
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t("purchase.form.bankPay.addPayment")}
                      </Button>
                    </div>

                    {paymentFields.length === 0 && (
                      <div className="py-6 text-center text-muted-foreground text-[10px] font-medium border border-dashed rounded-lg bg-muted/20">
                        {t("common.formHints.noBankPayments")}
                      </div>
                    )}

                    <div className="space-y-3">
                      {paymentFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-2 group"
                        >
                          <div className="flex flex-1 items-start gap-2">
                            <div className="w-[60%] shrink-0">
                              <SelectField
                                name={`purchasePayments.${index}.accountId`}
                                control={control as any}
                                placeholder={
                                  accountsLoading
                                    ? t("common.loading")
                                    : t("purchase.form.bankPay.selectAcc")
                                }
                                options={accountOptions}
                              />
                            </div>
                            <div className="w-[40%] shrink-0">
                              <NumericField
                                name={`purchasePayments.${index}.amount`}
                                control={control as any}
                                placeholder={t("purchase.form.bankPay.amount")}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10"
                            onClick={() => removePayment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column: Summary & Submit (Sticky) ───────────────── */}
            <div className="lg:fixed lg:top-24 lg:right-8 space-y-6">
              <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    {t("purchase.detail.payment.total")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("purchase.form.total.grand")}
                    </div>
                    <div className="text-2xl font-black text-primary">
                      {formatCurrency(grandTotal)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        {t("purchase.form.total.paid")}
                      </span>
                      <span className="text-lg font-bold text-emerald-700">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>

                    <div
                      className={`flex justify-between items-center p-3 rounded-lg border ${
                        outstandingBalance > 0
                          ? "bg-rose-50 border-rose-100"
                          : "bg-muted/50 border-muted-foreground/10"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          outstandingBalance > 0
                            ? "text-rose-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t("purchase.form.total.loan")}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          outstandingBalance > 0
                            ? "text-rose-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatCurrency(outstandingBalance)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <SubmitButton
                      title={
                        initialData
                          ? t("purchase.form.editPur")
                          : t("purchase.form.addPur")
                      }
                      loading={isLoading}
                      className="w-full py-5 text-base font-bold shadow-md shadow-primary/10"
                    />
                    <p className="text-[10px] text-center text-muted-foreground leading-tight px-4">
                      {t("common.formHints.balanceUpdateWarning")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* ── Quick-Add Partner Dialog ────────────────────────────────────── */}
      <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {t("partners.form.addNewPar")}
            </DialogTitle>
          </DialogHeader>
          <PartnerForm
            onSubmit={handlePartnerCreated}
            onCancel={() => setShowAddPartner(false)}
            isPending={creatingPartner}
          />
        </DialogContent>
      </Dialog>

      {/* ── Quick-Add Inventory Dialog ──────────────────────────────────── */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("inventory.form.add")}</DialogTitle>
            <DialogDescription>
              {t("inventory.form.inventoryInfoDesc")}
            </DialogDescription>
          </DialogHeader>
          <InventoryQuickForm
            onSubmit={handleInventoryCreated}
            onCancel={() => setShowAddInventory(false)}
            isLoading={creatingInventory}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
