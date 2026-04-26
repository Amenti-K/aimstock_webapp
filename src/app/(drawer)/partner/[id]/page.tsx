"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  HandCoins,
  ArrowUpRight,
  TrendingUp,
  History,
} from "lucide-react";
import {
  useDeletePartner,
  useFetchPartnerById,
} from "@/api/partner/api.partner";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ISale } from "@/components/interface/sales/interface.sale";
import LastAudit from "@/components/audit/LastAudit";

export default function PartnerDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const partnerId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = React.useState(false);
  const { data, isLoading, isError, refetch } = useFetchPartnerById(
    partnerId,
    canView("PARTNERS"),
  );
  const deletePartner = useDeletePartner();

  // Actual calculations from data - Moved up for Rules of Hooks compliance
  const totals = useMemo(() => {
    if (!data?.data) return { sales: 0, purchases: 0, loans: 0 };
    const partner = data.data;

    const sales =
      partner.sale?.reduce(
        (acc: number, s: ISale) => acc + (Number(s.total) || 0),
        0,
      ) || 0;
    const purchases =
      partner.purchases?.reduce(
        (acc: number, p: any) => acc + (Number(p.total) || 0),
        0,
      ) || 0;
    const loans =
      partner.loans?.reduce(
        (acc: number, l: any) => acc + (Number(l.amount) || 0),
        0,
      ) || 0;

    return { sales, purchases, loans };
  }, [data?.data]);

  if (!canView("PARTNERS")) return <AccessDeniedView moduleName="Partners" />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const partner = data.data;
  const {
    sales: totalSales,
    purchases: totalPurchases,
    loans: totalLoans,
  } = totals;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-2xl border-2 border-background shadow-md">
              <AvatarFallback className="bg-primary/5 text-primary">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {partner.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap mt-0.5">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {partner.phone || "No phone number"}
                </p>
                <LastAudit
                  lastAudit={partner.lastAuditLog}
                  className="opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate("PARTNERS") && (
            <Button
              variant="outline"
              onClick={() => router.push(`/partner/${partnerId}/edit`)}
              className="rounded-full shadow-sm"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canDelete("PARTNERS") && (
            <Button
              variant="destructive"
              onClick={() => setOpenDelete(true)}
              className="rounded-full shadow-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Top Overview: Next to each other on desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden font-medium">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Partner Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Address / Location
              </span>
              <div className="flex items-start gap-2 text-sm leading-tight text-foreground/80 bg-muted/20 p-3 rounded-xl border border-dashed">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {partner.address || "No address provided for this partner."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Last Interaction
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <History className="h-4 w-4 opacity-50" />
                  {partner.lastAuditLog
                    ? formatDate(partner.lastAuditLog.createdAt)
                    : "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl font-medium">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-50">
                  Total Trading Volume
                </span>
                <span className="text-2xl font-black">
                  {formatCurrency(totalSales + totalPurchases)}
                </span>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 uppercase font-black text-[9px] tracking-tighter">
              <div className="flex flex-col gap-1">
                <span className="opacity-50">Sales</span>
                <span className="text-green-400 text-base">
                  {formatCurrency(totalSales)}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/10 pl-2">
                <span className="opacity-50">Purchases</span>
                <span className="text-blue-400 text-base">
                  {formatCurrency(totalPurchases)}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/10 pl-2">
                <span className="opacity-50">Loans</span>
                <span className="text-yellow-400 text-base">
                  {formatCurrency(totalLoans)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Tabs widening the whole width */}
      <div className="w-full">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-2xl mb-4 h-12 w-full max-w-md border border-muted-foreground/10">
            <TabsTrigger
              value="sales"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger
              value="purchases"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Purchases
            </TabsTrigger>
            <TabsTrigger
              value="loans"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <HandCoins className="h-4 w-4" />
              Loans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase opacity-60">
                        Date
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase opacity-60">
                        Description
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase opacity-60 text-right">
                        Total Amount
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(partner.sale ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-64 text-center text-muted-foreground font-medium"
                        >
                          No sales recorded for this partner
                        </TableCell>
                      </TableRow>
                    ) : (
                      partner.sale.map((s: any) => (
                        <TableRow
                          key={s.id}
                          className="cursor-pointer hover:bg-muted/50 group"
                          onClick={() => router.push(`/sales/${s.id}`)}
                        >
                          <TableCell className="font-semibold text-sm">
                            {formatDate(s.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {s.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right font-black text-primary">
                            {formatCurrency(s.total)}
                          </TableCell>
                          <TableCell>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase opacity-60">
                        Date
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase opacity-60">
                        Description
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase opacity-60 text-right">
                        Total Amount
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(partner.purchases ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-64 text-center text-muted-foreground font-medium"
                        >
                          No purchases recorded for this partner
                        </TableCell>
                      </TableRow>
                    ) : (
                      partner.purchases.map((p: any) => (
                        <TableRow
                          key={p.id}
                          className="cursor-pointer hover:bg-muted/50 group"
                          onClick={() => router.push(`/purchase/${p.id}`)}
                        >
                          <TableCell className="font-semibold text-sm">
                            {formatDate(p.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {p.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right font-black text-primary">
                            {formatCurrency(p.total)}
                          </TableCell>
                          <TableCell>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="loans">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase opacity-60">
                        Date
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase opacity-60">
                        Transaction Type
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase opacity-60 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(partner.loans ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-64 text-center text-muted-foreground font-medium"
                        >
                          No loan transactions recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      partner.loans.map((l: any) => (
                        <TableRow
                          key={l.id}
                          className="cursor-pointer hover:bg-muted/50 group"
                          onClick={() => router.push(`/loan/${l.partnerId}`)}
                        >
                          <TableCell className="font-semibold text-sm">
                            {formatDate(l.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-black uppercase rounded-full"
                            >
                              {l.txType.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-black text-primary">
                            {formatCurrency(l.amount)}
                          </TableCell>
                          <TableCell>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All transaction history with this
              partner will remain but will be disassociated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={() =>
                deletePartner.mutate({ id: partnerId } as any, {
                  onSuccess: () => router.push("/partner"),
                })
              }
            >
              Delete Partner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
