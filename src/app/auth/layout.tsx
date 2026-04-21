"use client";

import { Package2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side Marketing Panel */}
      <div className="hidden w-1/2 lg:block relative overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-overlay dark:bg-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-10" />

        <div className="absolute top-10 left-10 z-20 flex items-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <Package2 className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">AIM Stock</span>
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-20 text-white p-8 rounded-2xl backdrop-blur-md border border-white/10 bg-white/5 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
            The simplest way to manage your growing business.
          </h2>
          <p className="text-lg text-white/80 leading-relaxed max-w-lg text-pretty font-light">
            Take control of your inventory, track sales, and monitor expenses
            from anywhere in the world. Engineered entirely to elevate African
            businesses.
          </p>
        </div>

        {/* Placeholder enterprise image */}
        <img
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
          alt="AIM Stock Warehouse"
          className="absolute inset-0 object-cover w-full h-full"
        />
      </div>

      {/* Right side Auth Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-32 relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-0 right-0 flex items-center justify-center gap-2 text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Package2 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            AIM Stock
          </span>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
