import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "~~/utils/ui";

type ListItemProps = {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailingTitle?: ReactNode;
  trailingSubtitle?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * Two-column row (avatar + title/subtitle on the left, values on the right),
 * the building block of token and activity lists.
 */
export const ListItem = ({
  leading,
  title,
  subtitle,
  trailingTitle,
  trailingSubtitle,
  href,
  onClick,
  className,
}: ListItemProps) => {
  const content = (
    <>
      {leading}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{title}</span>
        {subtitle && <span className="truncate text-sm text-base-content/60">{subtitle}</span>}
      </div>
      {(trailingTitle || trailingSubtitle) && (
        <div className="flex shrink-0 flex-col items-end">
          {trailingTitle && <span className="font-medium tabular-nums">{trailingTitle}</span>}
          {trailingSubtitle && <span className="text-sm text-base-content/60 tabular-nums">{trailingSubtitle}</span>}
        </div>
      )}
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-3 px-4 py-3 text-left",
    (href || onClick) && "transition hover:bg-base-200",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
};
