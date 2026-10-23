import { cn } from "~~/utils/ui";

export const Skeleton = ({ className }: { className?: string }) => (
  <span className={cn("block animate-pulse rounded-field bg-base-300", className)} />
);
