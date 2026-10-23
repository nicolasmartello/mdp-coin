import Image from "next/image";
import { cn } from "~~/utils/ui";

/**
 * MdpCoin token mark: the Punta Mogotes lighthouse of Mar del Plata.
 * Single source of truth is public/mdp-logo.svg (also used as favicon and in the manifest).
 */
export const MdpLogo = ({ className }: { className?: string }) => (
  <span className={cn("relative inline-flex size-10 shrink-0", className)}>
    <Image src="/mdp-logo.svg" alt="MdpCoin" fill unoptimized />
  </span>
);
