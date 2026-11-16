import { getImageProps } from "next/image";

import { isDarkBackground, type ImageSection } from "@/lib/strapi";

import { pictureSizes } from "./image-sizes";
import { SectionShell } from "./section-shell";

/**
 * Image (`sections.image`): one image whole, in its own proportions, the
 * content's width or narrow (48rem) in the middle, rounded like the cards,
 * with an optional caption. Another crop on phones when the CMS has one. The
 * width and height (each crop's own) reserve the space, so nothing shifts;
 * the file loads lazily, at the site's top quality, so text in a graphic stays
 * sharp. No heading or buttons: the sections around it carry those.
 */
export function ImageBlock({ section }: { section: ImageSection }) {
  const dark = isDarkBackground(section.background);
  const sizes = pictureSizes(section.size);
  const common = { sizes, quality: 75 };
  const { image, imageMobile } = section;
  const { props: desktop } = getImageProps({ ...common, src: image.url, alt: image.alt, width: image.width ?? 1600, height: image.height ?? 900 });
  const mobile = imageMobile ? getImageProps({ ...common, src: imageMobile.url, alt: imageMobile.alt, width: imageMobile.width ?? 768, height: imageMobile.height ?? 1024 }).props : null;
  return (
    <SectionShell background={section.background} spacing={section.spacing}>
      <figure className={`mx-auto flex flex-col gap-3 ${section.size === "narrow" ? "max-w-3xl" : ""}`}>
        <picture>
          {mobile ? <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} width={mobile.width} height={mobile.height} /> : null}
          <img {...desktop} alt={image.alt} className="block h-auto w-full rounded-card" />
        </picture>
        {section.caption ? <figcaption className={`text-center text-sm text-pretty ${dark ? "text-white/85" : "text-blue-dark/75"}`}>{section.caption}</figcaption> : null}
      </figure>
    </SectionShell>
  );
}
