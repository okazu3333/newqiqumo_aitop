import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden rounded-md bg-muted", className)}
    {...props}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
));
Skeleton.displayName = "Skeleton";

export { Skeleton }; 