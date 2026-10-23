"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton } from "~~/components/ui/IconButton";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
};

/**
 * Bottom sheet on mobile, centered modal from `sm` up.
 * Built on the native <dialog> element, so focus trapping and Esc-to-close come for free.
 */
export const Sheet = ({ open, onClose, title, children }: SheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box rounded-t-card bg-base-100 p-0 shadow-sheet sm:rounded-card">
        {/* Drag handle: a visual cue that this is a sheet */}
        <div className="mx-auto mt-2 h-1 w-10 rounded-pill bg-base-300 sm:hidden" />
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <IconButton label="Cerrar" icon={<XMarkIcon />} onClick={onClose} />
        </div>
        <div className="pb-6">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Cerrar">close</button>
      </form>
    </dialog>
  );
};
