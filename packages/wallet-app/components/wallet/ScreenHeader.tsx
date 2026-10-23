"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { IconButton } from "~~/components/legacy-ui";

type ScreenHeaderProps = {
  title: ReactNode;
  // Where the back arrow goes; defaults to the home screen
  backHref?: string;
};

/**
 * Header for secondary screens: back arrow + centered title.
 */
export const ScreenHeader = ({ title, backHref = "/" }: ScreenHeaderProps) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 grid grid-cols-[2.5rem_1fr_2.5rem] items-center bg-base-100 px-2 py-2">
      <IconButton label="Volver" icon={<ArrowLeftIcon />} onClick={() => router.push(backHref)} />
      <h1 className="m-0 text-center text-base font-semibold">{title}</h1>
    </header>
  );
};
