import { type ButtonHTMLAttributes, type ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "~~/utils/ui";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-content hover:brightness-110",
  secondary: "border border-base-content/20 bg-transparent text-base-content hover:bg-base-200",
  ghost: "bg-transparent text-primary hover:bg-secondary",
  danger: "border border-error bg-transparent text-error hover:bg-error/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * Class builder shared by <Button> and <ButtonLink> so both always look the same.
 */
export const buttonClasses = ({ variant = "primary", size = "md", fullWidth }: ButtonStyleProps, className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:pointer-events-none disabled:opacity-40",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & {
    loading?: boolean;
    icon?: ReactNode;
  };

export const Button = ({
  variant,
  size,
  fullWidth,
  loading,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={buttonClasses({ variant, size, fullWidth }, className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <span className="loading loading-spinner loading-sm" /> : icon}
    {children}
  </button>
);

type ButtonLinkProps = LinkProps &
  ButtonStyleProps & {
    className?: string;
    children: ReactNode;
  };

export const ButtonLink = ({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) => (
  <Link className={buttonClasses({ variant, size, fullWidth }, className)} {...props} />
);
