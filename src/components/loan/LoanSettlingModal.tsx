"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFetchAccountSelector } from "@/api/account/api.account";
import { useCreateLoanTranx } from "@/api/loan/api.loan";
import { LoanTxType } from "@/components/interface/loan/loan.interface";
import {
  SettlingFormData,
  settlingSchema,
} from "@/components/forms/loan/loan.schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerName: string;
  balance: number;
}

export function LoanSettlingModal({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  balance,
}: Props) {
  const isReceiving = balance > 0;
  const maxAmount = Math.abs(balance);
  const addLoanTranx = useCreateLoanTranx();
  const { data: accountsRaw, isLoading: loadingAccounts } =
    useFetchAccountSelector();
  const accounts = accountsRaw?.data || [];

  const form = useForm<SettlingFormData>({
    resolver: zodResolver(settlingSchema),
    defaultValues: {
      txType: isReceiving ? LoanTxType.LOAN_RECEIPT : LoanTxType.LOAN_PAYMENT,
      accountId: "",
      amount: maxAmount,
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        txType: isReceiving ? LoanTxType.LOAN_RECEIPT : LoanTxType.LOAN_PAYMENT,
        accountId: "",
        amount: undefined as any,
        note: "",
      });
    }
  }, [open, isReceiving, form]);

  const onSubmit = (data: SettlingFormData) => {
    if (data.amount > maxAmount) {
      form.setError("amount", {
        message: `Amount cannot exceed balance of ${maxAmount.toLocaleString()}`,
      });
      return;
    }

    addLoanTranx.mutate(
      {
        partnerId,
        txType: data.txType,
        paymentItems: [{ accountId: data.accountId, amount: data.amount }],
        note: data.note,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Loan - {partnerName}</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Outstanding Balance:{" "}
            <span className="font-bold text-foreground">
              Br {maxAmount.toLocaleString()}
            </span>{" "}
            ({isReceiving ? "Owes You" : "You Owe"})
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="txType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={LoanTxType.LOAN_RECEIPT}>
                        Receive Payment
                      </SelectItem>
                      <SelectItem value={LoanTxType.LOAN_PAYMENT}>
                        Make Payment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={loadingAccounts}>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bank ?? "Cash"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addLoanTranx.isPending}>
                {addLoanTranx.isPending ? "Processing..." : "Settle Loan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
