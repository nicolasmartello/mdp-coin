import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "~~/utils/ui";

type ActionButtonProps = {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * Round icon + label, the main call-to-action style of the home screen.
 */
export const ActionButton = ({ icon, label, href, onClick, loading, disabled }: ActionButtonProps) => {
  const content = (
    <>
      <span className="inline-flex size-12 items-center justify-center rounded-pill bg-primary text-primary-content transition group-hover:brightness-110 [&>svg]:size-6">
        {loading ? <span className="loading loading-spinner loading-sm" /> : icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </>
  );
  const classes = cn(
    "group flex w-16 flex-col items-center gap-1.5",
    (disabled || loading) && "pointer-events-none opacity-40",
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={classes}>
      {content}
    </button>
  );
};

export const ActionBar = ({ children }: { children: ReactNode }) => (
  <nav className="flex justify-center gap-6 px-4 py-4" aria-label="Acciones">
    {children}
  </nav>
);
