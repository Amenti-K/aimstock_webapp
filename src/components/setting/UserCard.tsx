"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building, Phone } from "lucide-react";
import { CompanyInfo, UserInfo } from "../interface/user/user.interface";

interface UserCardProps {
  user: UserInfo | null;
  company: CompanyInfo | null;
}

export const UserCard = ({ user, company }: UserCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm mb-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
            {user?.name?.substring(0, 2).toUpperCase() || "US"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight">
            {user?.name || "User Name"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{user?.role.name || "Member"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{company?.name || "Company Name"}</span>
          </div>
          {user?.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
