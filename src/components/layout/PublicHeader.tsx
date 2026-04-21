"use client";

import logo from "@/../public/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AIMSTOCK_DATA } from "@/lib/data";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export const PublicHeader = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    [
      "rgba(255, 255, 255, 0)",
      isDark ? "rgba(9, 9, 11, 0.8)" : "rgba(255, 255, 255, 0.8)",
    ],
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    [
      "rgba(255, 255, 255, 0)",
      isDark ? "rgba(39, 39, 42, 0.5)" : "rgba(229, 231, 235, 0.5)",
    ],
  );

  const shadow = useTransform(
    scrollY,
    [0, 50],
    ["none", "0 4px 6px -1px rgb(0 0 0 / 0.1)"],
  );

  return (
    <motion.header
      style={{
        backgroundColor: headerBg,
        borderColor: headerBorder,
        boxShadow: shadow,
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image src={logo} alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              AIM <span className="text-primary">Stock</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-20 left-0 right-0 bg-background/95 backdrop-blur-xl border-b p-6 space-y-6 shadow-2xl"
        >
          <div className="flex flex-col space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-lg font-medium transition-colors",
                  pathname === item.href ? "text-primary" : "text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col space-y-3 pt-6 border-t">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">
                Appearance
              </span>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};
