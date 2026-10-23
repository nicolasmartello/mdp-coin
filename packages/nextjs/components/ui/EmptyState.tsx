import { type ReactNode } from "react";
import { cn } from "~~/utils/ui";

type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
    {icon && <div className="mb-2 text-base-content/40 [&>svg]:size-10">{icon}</div>}
    <p className="font-semibold">{title}</p>
    {description && <p className="text-sm text-base-content/60">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
