import { RefObject, useEffect, useState } from "react";

export type HeaderTheme = "light" | "dark";

const DARK_SELECTOR = '[data-header-theme="dark"]';

/**
 * Tracks which page section is currently scrolled directly behind the
 * (sticky) header and returns "dark" while that section is marked
 * data-header-theme="dark", "light" otherwise.
 *
 * Driven by a MutationObserver on the routed-content container rather than
 * route/location changes, since Header never unmounts across navigation but
 * lazy-loaded page chunks resolve asynchronously — reacting only to the
 * route would race against content that hasn't mounted yet.
 */
export function useHeaderTheme(headerRef: RefObject<HTMLElement | null>, contentContainerId: string): HeaderTheme {
  const [theme, setTheme] = useState<HeaderTheme>("light");

  useEffect(() => {
    const headerEl = headerRef.current;
    const contentEl = document.getElementById(contentContainerId);
    if (!headerEl || !contentEl) return;

    let observer: IntersectionObserver | null = null;
    let currentTargets: Element[] = [];
    const activeDark = new Set<Element>();

    const sameElements = (a: Element[], b: Element[]) =>
      a.length === b.length && a.every((el, i) => el === b[i]);

    const buildObserver = (headerHeight: number) => {
      observer?.disconnect();
      const topOffset = Math.max(0, Math.round(headerHeight));
      const bottomOffset = Math.max(0, window.innerHeight - topOffset - 1);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activeDark.add(entry.target);
            } else {
              activeDark.delete(entry.target);
            }
          });
          setTheme(activeDark.size > 0 ? "dark" : "light");
        },
        { rootMargin: `-${topOffset}px 0px -${bottomOffset}px 0px`, threshold: 0 }
      );

      currentTargets.forEach((el) => observer!.observe(el));
    };

    const rescan = () => {
      const targets = Array.from(contentEl.querySelectorAll(DARK_SELECTOR));
      if (sameElements(targets, currentTargets)) return;

      currentTargets = targets;
      activeDark.clear();
      buildObserver(headerEl.getBoundingClientRect().height);
      if (targets.length === 0) {
        setTheme("light");
      }
    };

    rescan();

    // Rebuild the trigger line when the header's own height changes
    // (e.g. the mobile menu expanding/collapsing).
    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height != null) {
        buildObserver(height);
      }
    });
    resizeObserver.observe(headerEl);

    // Re-scan whenever routed content mounts/unmounts (route changes,
    // Suspense resolving a lazy chunk after the initial scan found nothing).
    const mutationObserver = new MutationObserver(rescan);
    mutationObserver.observe(contentEl, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [headerRef, contentContainerId]);

  return theme;
}
