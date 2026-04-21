"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetWarehousesInfinite } from "@/api/warehouse/api.warehouse";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Warehouse,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Globe,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IWarehouse } from "@/components/interface/warehouse/warehouse.interface";

export default function WarehousePage() {
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("WAREHOUSES");
  const hasCreateAccess = canCreate("WAREHOUSES");
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetWarehousesInfinite({}, hasViewAccess);

  const warehouses = useMemo(
    () => data?.pages?.flatMap((page) => (page as any).data) ?? [],
    [data],
  );

  if (!hasViewAccess) return <AccessDeniedView moduleName="Warehouses" />;
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Warehouse className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your storage locations and inventory distribution.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm"
            onClick={() => router.push("/warehouse/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        )}
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <Warehouse className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              No warehouses found.
            </p>
          </div>
        ) : (
          warehouses.map((warehouse: IWarehouse) => (
            <WarehouseMobileCard
              key={warehouse.id}
              warehouse={warehouse}
              onClick={() => router.push(`/warehouse/${warehouse.id}`)}
            />
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Warehouse</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No warehouses found.
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((warehouse: IWarehouse) => (
                <TableRow
                  key={warehouse.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => router.push(`/warehouse/${warehouse.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <Warehouse className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm">
                        {warehouse.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {warehouse.isInternal ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-none rounded-full px-3 text-[10px] font-bold"
                      >
                        INTERNAL
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground border-muted-foreground/20 rounded-full px-3 text-[10px] font-bold"
                      >
                        EXTERNAL
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {warehouse.location || "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary/70" />
                      {warehouse.contactPhone || "No contact"}
                    </div>
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
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-primary font-medium hover:bg-primary/5 rounded-full"
          >
            {isFetchingNextPage ? "Loading more..." : "Show more warehouses"}
          </Button>
        </div>
      )}
    </div>
  );
}

function WarehouseMobileCard({
  warehouse,
  onClick,
}: {
  warehouse: IWarehouse;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm border-none flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Warehouse className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-base leading-none">
              {warehouse.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              {warehouse.isInternal ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                  <ShieldCheck className="h-3 w-3" />
                  Internal
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                  <Globe className="h-3 w-3" />
                  External
                </div>
              )}
            </div>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      <div className="grid grid-cols-1 gap-2 mt-1">
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-muted/50">
          <MapPin className="h-4 w-4 text-primary/60" />
          <span className="truncate">
            {warehouse.location || "No location specified"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold p-2.5 rounded-xl bg-primary/5 text-primary/80 border border-primary/10">
          <Phone className="h-4 w-4" />
          <span>{warehouse.contactPhone || "No contact phone"}</span>
        </div>
      </div>
    </div>
  );
}
