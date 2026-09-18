import React, { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades/slides an element in the first time it scrolls into view. Returns a
 * ref + className to spread onto an EXISTING element — use this (instead of
 * the <Reveal> wrapper below) whenever adding an extra wrapper <div> would
 * disturb a flex/grid layout the target element participates in.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(prefersReducedMotion());

  useEffect(() => {
    if (visible) {
      return;
    }
    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, className: `reveal ${visible ? "reveal--visible" : ""}` };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Convenience wrapper around useReveal for the common case (no existing
 * layout constraints on the wrapped content).
 */
const Reveal: React.FC<RevealProps> = ({ children, className = "" }) => {
  const { ref, className: revealClassName } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`${revealClassName} ${className}`}>
      {children}
    </div>
  );
};

export default Reveal;
