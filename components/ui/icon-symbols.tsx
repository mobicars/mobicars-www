import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * An icon repeated many times on a page (review stars, pickup point kinds)
 * drawn once as an SVG `<symbol>` and reused with `<use>`: every Lucide icon
 * is ~600 bytes of markup, and a page with a hundred of them pays for it in
 * HTML (PageSpeed on phones). Server-rendered, no JavaScript.
 *
 * `IconSymbols` goes once in the block (ids must be unique on the page, so
 * prefix them with the block id); `UseIcon` draws one. The icon keeps its
 * colour from `currentColor` of the `UseIcon`; pass `fill="inherit"` in
 * `props` for an icon whose fill a class switches (`fill-current`).
 */
export function IconSymbols({
  prefix,
  icons,
  props,
}: {
  prefix: string;
  icons: Record<string, LucideIcon>;
  props?: LucideProps;
}) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
      {Object.entries(icons).map(([name, Icon]) => (
        <symbol key={name} id={`${prefix}-${name}`} viewBox="0 0 24 24">
          <Icon {...props} />
        </symbol>
      ))}
    </svg>
  );
}

export function UseIcon({ prefix, name, className }: { prefix: string; name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <use href={`#${prefix}-${name}`} />
    </svg>
  );
}
