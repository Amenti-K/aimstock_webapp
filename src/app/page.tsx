"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export default function AppEntry() {
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.userAuth);

  useEffect(() => {
    if (accessToken) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [accessToken, router]);

  return null;
}
