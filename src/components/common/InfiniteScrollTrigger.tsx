"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasNextPage: boolean;
}

export function InfiniteScrollTrigger({
  onIntersect,
  isLoading,
  hasNextPage,
}: InfiniteScrollTriggerProps) {
  const triggerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect, isLoading, hasNextPage]);

  if (!hasNextPage) return null;

  return (
    <div
      ref={triggerRef}
      className="flex w-full items-center justify-center p-8 mt-4"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading more records...</span>
        </div>
      ) : (
        <div className="h-2 w-full" /> 
      )}
    </div>
  );
}
