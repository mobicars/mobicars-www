import type { EmblaCarouselType } from "embla-carousel";

/** Embla's own drag threshold (px): below it a touch is a tap. */
const DRAG_THRESHOLD = 10;

/**
 * Tells React Aria a drag is not a press, the way the browser does for a
 * native scroll. A finger that starts on a React Aria card or button and
 * swipes the carousel leaves that element "pressed": React Aria waits for the
 * click, Embla rightly swallows it, and the next tap is lost. With native
 * scrolling the browser sends `pointercancel` as the swipe starts; Embla moves
 * the row itself, so nothing does. This sends it once the finger has moved
 * past Embla's threshold, so the press ends as cancelled and a later tap
 * works. Returns the cleanup.
 */
export function cancelPressOnDrag(embla: EmblaCarouselType, root: HTMLElement): () => void {
  let down: { id: number; type: string; x: number; target: EventTarget | null } | null = null;
  const onDown = (event: PointerEvent) => {
    down = { id: event.pointerId, type: event.pointerType, x: event.clientX, target: event.target };
  };
  const onMove = (event: PointerEvent) => {
    if (!down || event.pointerId !== down.id || Math.abs(event.clientX - down.x) <= DRAG_THRESHOLD) return;
    if (!embla.internalEngine().dragHandler.pointerDown()) return;
    const { id, type, target } = down;
    down = null;
    target?.dispatchEvent(new PointerEvent("pointercancel", { pointerId: id, pointerType: type, isPrimary: true, bubbles: true }));
  };
  const onEnd = () => {
    down = null;
  };
  root.addEventListener("pointerdown", onDown, true);
  root.addEventListener("pointermove", onMove, true);
  root.addEventListener("pointerup", onEnd, true);
  return () => {
    root.removeEventListener("pointerdown", onDown, true);
    root.removeEventListener("pointermove", onMove, true);
    root.removeEventListener("pointerup", onEnd, true);
  };
}
