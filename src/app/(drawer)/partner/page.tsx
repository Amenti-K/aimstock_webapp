"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetPartnersInfinite } from "@/api/partner/api.partner";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IPartner } from "@/components/interface/partner/partner.interfacce";

export default function PartnerPage() {
  const { t } = useTranslation();
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

  if (!hasViewAccess)
    return <AccessDeniedView moduleName={t("partners.moduleName")} />;
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="relative min-h-[calc(100vh-200px)] space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("partners.moduleName")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("partners.description")}
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="hidden sm:flex bg-primary hover:bg-primary/90 shadow-sm"
            onClick={() => router.push("/partner/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("partners.form.addPartner")}
          </Button>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {hasCreateAccess && (
        <Button
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden z-50 bg-primary hover:bg-primary/90"
          size="icon"
          onClick={() => router.push("/partner/new")}
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <User className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              {t("partners.emptyPartner")}
            </p>
          </div>
        ) : (
          partners.map((partner: IPartner) => (
            <PartnerMobileCard
              key={partner.id}
              partner={partner}
              onClick={() => router.push(`/partner/${partner.id}`)}
              t={t}
            />
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">
                {t("partners.moduleName")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("partners.card.phoneNum")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("partners.card.address")}
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
                  {t("partners.emptyPartner")}
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner: IPartner) => (
                <TableRow
                  key={partner.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => router.push(`/partner/${partner.id}`)}
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
                      {partner?.phone || "---------"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[300px] truncate">
                      <MapPin className="h-3 w-3" />
                      {partner?.address || "--------"}
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
            {isFetchingNextPage ? t("common.loading") : t("common.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}

function PartnerMobileCard({
  partner,
  onClick,
  t,
}: {
  partner: IPartner;
  onClick: () => void;
  t: any;
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
              {t("partners.moduleName")}
            </span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      {(partner?.phone || partner?.address) && (
        <div className="grid grid-cols-1 gap-2 mt-1">
          {partner.phone && (
            <div className="flex items-center gap-3 text-sm font-semibold p-3 rounded-xl bg-primary/5 text-primary/80 border border-primary/10">
              <Phone className="h-4 w-4" />
              <span>{partner.phone || t("common.noContact")}</span>
            </div>
          )}
          {partner.address && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-muted/50">
              <MapPin className="h-4 w-4 text-primary/60" />
              <span className="truncate">
                {partner.address || t("partners.card.address")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
