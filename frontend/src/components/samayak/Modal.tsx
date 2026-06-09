import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-[min(560px,calc(100vw-2rem))] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-card border border-line bg-white/95 backdrop-blur-xl p-5 sm:p-8 shadow-lg animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-ink">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
