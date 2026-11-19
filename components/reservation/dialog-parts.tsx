"use client";

import { useId, type ReactNode } from "react";
import {
  Button,
  Dialog,
  ModalOverlay,
  Modal,
} from "react-aria-components";
import { X } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { useMessages } from "@/i18n/messages-context";

/** Building blocks shared by the widget dialogs: place, dates, start date, options. */

export function WidgetModal({
  open,
  onOpenChange,
  className,
  layer = "base",
  dismissable = true,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  /** `nested` stacks above another widget dialog, e.g. the hour list over the calendar. */
  layer?: "base" | "nested";
  /** False for a question that must be answered: a click outside and Escape do nothing. */
  dismissable?: boolean;
  children: ReactNode;
}) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable={dismissable}
      isKeyboardDismissDisabled={!dismissable}
      className={`pickup-overlay fixed inset-0 flex bg-blue-dark/40 backdrop-blur-[4px] ${layer === "nested" ? "z-[70]" : "z-50"}`}
    >
      <Modal className={`pickup-modal m-auto flex flex-col overflow-hidden bg-white text-blue-dark outline-none ${className}`}>
        {children}
      </Modal>
    </ModalOverlay>
  );
}

export function DialogHeader({
  titleId,
  title,
  className = "pt-4 pb-2",
}: {
  titleId: string;
  title: string;
  className?: string;
}) {
  const texts = useMessages().search;
  return (
    <div className={`relative shrink-0 px-12 ${className}`}>
      <h2 id={titleId} className="text-center text-lg font-bold">
        {title}
      </h2>
      <Button
        slot="close"
        aria-label={texts.close}
        className="absolute top-3.5 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted-light text-muted-dark transition-colors duration-200 ease-out hover:bg-muted motion-reduce:transition-none"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

/** Primary dialog action, e.g. "Zatwierdź wybór". */
export function ConfirmButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={buttonClass("primary", "md", "md:px-8")}>
      {children}
    </button>
  );
}

/**
 * The cancel/confirm pair at the bottom of a question dialog. Full width and
 * stacked on phones (confirm on top), side by side from `sm`.
 */
export function DialogActions({
  cancel,
  confirm,
  onCancel,
  onConfirm,
}: {
  cancel: ReactNode;
  confirm: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row">
      <button type="button" onClick={onCancel} className={buttonClass("secondary", "md", "w-full sm:w-auto sm:flex-1")}>
        {cancel}
      </button>
      <button type="button" onClick={onConfirm} className={buttonClass("primary", "md", "w-full sm:w-auto sm:flex-1")}>
        {confirm}
      </button>
    </div>
  );
}

/**
 * A yes/no question before a change to the booking, e.g. "Czy chcesz zmienić
 * klasę auta?". Closing it with × or a click outside counts as no.
 */
export function ConfirmQuestion({
  open,
  title,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  /** What "yes" does, e.g. "Tak, zmień auto"; "Tak, zmień" when left out. "Zostaw jak jest" is the same for all. */
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useMessages().upsell;
  const titleId = useId();
  return (
    <WidgetModal
      open={open}
      onOpenChange={(next) => (next ? undefined : onCancel())}
      className="w-[min(30rem,calc(100%-1.5rem))] rounded-card shadow-float"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader titleId={titleId} title={title} className="pt-4 pb-4" />
        <div className="px-5 pb-5">
          <DialogActions cancel={t.cancel} confirm={confirmLabel ?? t.confirm} onCancel={onCancel} onConfirm={onConfirm} />
        </div>
      </Dialog>
    </WidgetModal>
  );
}
