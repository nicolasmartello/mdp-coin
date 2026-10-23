import { type HTMLAttributes } from "react";
import { cn } from "~~/utils/ui";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-card bg-base-200 p-4", className)} {...props} />
);
