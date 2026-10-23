import { type ReactNode } from "react";
import { cn } from "~~/utils/ui";

type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "size-6 text-xs [&>svg]:size-3.5",
  md: "size-10 text-sm [&>svg]:size-5",
  lg: "size-16 text-xl [&>svg]:size-8",
};

type AvatarProps = {
  size?: AvatarSize;
  className?: string;
  // An icon or initials; falls back to the first letter of `label`
  children?: ReactNode;
  label?: string;
};

/**
 * Round placeholder used for tokens, transactions and accounts.
 */
export const Avatar = ({ size = "md", className, children, label }: AvatarProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center justify-center rounded-pill font-semibold",
      "bg-secondary text-secondary-content",
      SIZE_CLASSES[size],
      className,
    )}
  >
    {children ?? label?.charAt(0).toUpperCase()}
  </span>
);
