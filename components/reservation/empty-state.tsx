import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** A results area with nothing to show: an icon, what happened, and what to do next. */
export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-10 text-center text-blue-dark shadow-sm">
      <span className="flex size-16 items-center justify-center rounded-full bg-blue-light text-blue-medium">
        <Icon className="size-8" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
