"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetPartnersInfinite } from "@/api/partner/api.partner";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ChevronRight,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IPartner } from "@/components/interface/partner/partner.interfacce";

export default function PartnerPage() {
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("PARTNERS");
  const hasCreateAccess = canCreate("PARTNERS");
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetPartnersInfinite({}, hasViewAccess);

  const partners = useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  if (!hasViewAccess) return <AccessDeniedView moduleName="Partners" />;
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Partners</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers and suppliers you do business with.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm"
            onClick={() => router.push("/app/partner/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Partner
          </Button>
        )}
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <User className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              No partners found.
            </p>
          </div>
        ) : (
          partners.map((partner: IPartner) => (
            <PartnerMobileCard
              key={partner.id}
              partner={partner}
              onClick={() => router.push(`/app/partner/${partner.id}`)}
            />
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Partner</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">
                Address / Location
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No partners found.
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner: IPartner) => (
                <TableRow
                  key={partner.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => router.push(`/app/partner/${partner.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg border-2 border-background shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">
                        {partner.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary/70" />
                      {partner.phone || "No contact"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[300px] truncate">
                      <MapPin className="h-3 w-3" />
                      {partner.address || "No address"}
                    </div>
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
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-primary font-medium hover:bg-primary/5 rounded-full"
          >
            {isFetchingNextPage ? "Loading more..." : "Show more partners"}
          </Button>
        </div>
      )}
    </div>
  );
}

function PartnerMobileCard({
  partner,
  onClick,
}: {
  partner: IPartner;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm border-none flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-lg leading-none">{partner.name}</h3>
            <span className="text-xs text-muted-foreground mt-1.5 font-medium">
              Business Partner
            </span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      <div className="grid grid-cols-1 gap-2 mt-1">
        <div className="flex items-center gap-3 text-sm font-semibold p-3 rounded-xl bg-primary/5 text-primary/80 border border-primary/10">
          <Phone className="h-4 w-4" />
          <span>{partner.phone || "No phone number"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-muted/50">
          <MapPin className="h-4 w-4 text-primary/60" />
          <span className="truncate">
            {partner.address || "No address provided"}
          </span>
        </div>
      </div>
    </div>
  );
}
