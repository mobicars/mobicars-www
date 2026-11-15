import type { ReactNode } from "react";

import { Container, Section, type SectionBackdrop, type SectionTone } from "@/components/ui/section";
import type { OrnamentKind } from "@/components/ui/surface";
import type { SectionStyle } from "@/lib/strapi";

/**
 * A CMS block's section from its `SectionStyle`: the band (`tone`), the
 * rhythm (`spacing`), the width (`page`, `reading`, or `full` with only the
 * gutter) and an optional `#anchor` target. Every block that carries
 * `section` renders through this, so the editor's choice means the same in
 * each of them.
 */
export function SectionFrame({
  style,
  labelledBy,
  children,
  defaultTone,
}: {
  style: SectionStyle;
  labelledBy?: string;
  children: ReactNode;
  /** The block's own look when the editor left the band at its default (white): FAQ glows. */
  defaultTone?: SectionTone;
}) {
  const tone = defaultTone && style.tone === "canvas" ? defaultTone : style.tone;
  return (
    <Section tone={tone} backdrop={backdropOf(style)} spacing={style.spacing} anchor={style.anchor} labelledBy={labelledBy}>
      <Container width={style.width}>{children}</Container>
    </Section>
  );
}

/**
 * The backdrop fields the CMS section carries (catalog C1). Read loosely until
 * every entry has them: a section without `background` keeps its plain tone,
 * and `photo` without an image falls back to it too.
 */
type BackdropFields = {
  background?: "none" | "wash" | "photo" | "brand" | null;
  backgroundImage?: { url: string } | null;
  backgroundImageMobile?: { url: string } | null;
  ornament?: OrnamentKind | "none" | null;
};

function backdropOf(style: SectionStyle): SectionBackdrop | undefined {
  const fields = style as SectionStyle & BackdropFields;
  const ornament = fields.ornament && fields.ornament !== "none" ? fields.ornament : null;
  switch (fields.background) {
    case "wash":
      return { kind: "wash" };
    case "brand":
      return { kind: "brand", ornament: ornament ?? "road" };
    case "photo":
      return fields.backgroundImage ? { kind: "photo", image: fields.backgroundImage, imageMobile: fields.backgroundImageMobile ?? null } : undefined;
    default:
      return undefined;
  }
}
