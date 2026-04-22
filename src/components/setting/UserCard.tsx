"use client";

import React from "react";
import { UserInfo, CompanyInfo } from "@/redux/slices/userAuthSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building } from "lucide-react";

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
          <h2 className="text-xl font-bold tracking-tight">{user?.name || "User Name"}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{user?.role.name || "Member"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{company?.name || "Company Name"}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
        <Badge variant="outline" className="bg-secondary/50">
          ID: {user?.id.substring(0, 8)}...
        </Badge>
        {user?.phoneNumber && (
          <Badge variant="outline" className="bg-secondary/50">
            {user.phoneNumber}
          </Badge>
        )}
      </div>
    </div>
  );
};
