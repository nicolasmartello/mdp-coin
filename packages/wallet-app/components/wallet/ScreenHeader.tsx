import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ScreenHeaderProps = {
  title: ReactNode;
  backHref?: string;
};

/**
 * Header for focused screens (Send, Receive): back link + centered title.
 */
export const ScreenHeader = ({ title, backHref = "/" }: ScreenHeaderProps) => (
  <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center px-2 py-3">
    <Link
      href={backHref}
      aria-label="Back"
      className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
    >
      <ArrowLeft className="size-5" aria-hidden />
    </Link>
    <h1 className="text-center text-base font-semibold">{title}</h1>
  </header>
);
