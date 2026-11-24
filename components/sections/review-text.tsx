const EMOJI = /(\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\uFE0F|\u200D\p{Extended_Pictographic})*)/u;
const EMOJI_FONTS = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/**
 * Review text with each emoji in the system emoji font. Left in Poppins, the
 * zero-width joiner inside "🙋‍♂️" falls in the range of Poppins' Devanagari
 * file, so the browser fetches 39 KB of font (at top priority, beside the
 * hero photo) for one invisible character.
 */
export function ReviewText({ text }: { text: string }) {
  return text.split(EMOJI).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} style={{ fontFamily: EMOJI_FONTS }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
