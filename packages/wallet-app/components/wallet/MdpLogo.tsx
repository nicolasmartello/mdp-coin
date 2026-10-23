import Image from "next/image";
import { cn } from "~~/lib/utils";

type MdpLogoProps = {
  className?: string;
  // Decorative copies (e.g. the balance card watermark) are hidden from assistive tech
  decorative?: boolean;
};

/**
 * MdpCoin token mark: the Punta Mogotes lighthouse of Mar del Plata.
 * Single source of truth is public/mdp-logo.svg (also used as favicon and in the manifest).
 */
export const MdpLogo = ({ className, decorative }: MdpLogoProps) => (
  <span className={cn("relative inline-flex size-10 shrink-0", className)}>
    <Image src="/mdp-logo.svg" alt={decorative ? "" : "MdpCoin"} fill unoptimized />
  </span>
);
