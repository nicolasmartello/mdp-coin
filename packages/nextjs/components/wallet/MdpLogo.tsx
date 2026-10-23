import { cn } from "~~/utils/ui";

/**
 * MdpCoin token mark. Uses `currentColor` for the glyph so it adapts to any background.
 */
export const MdpLogo = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-primary text-primary-content",
      className,
    )}
  >
    <svg viewBox="0 0 24 24" fill="none" className="size-[55%]" aria-hidden="true">
      <path
        d="M4 18V6l8 7 8-7v12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);
