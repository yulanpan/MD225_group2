"use client";

import { useEffect } from "react";

export function useInterfaceMotion(compositionSelector = ".control-composition") {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let composition = document.querySelector<HTMLElement>(compositionSelector);

    function setMousePosition(event: PointerEvent) {
      root.style.setProperty("--mx", `${event.clientX}px`);
      root.style.setProperty("--my", `${event.clientY}px`);
      composition = composition?.isConnected ? composition : document.querySelector<HTMLElement>(compositionSelector);
      if (!composition || reduceMotion) return;
      const rect = composition.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      composition.style.setProperty("--tilt-x", `${3 - y * 7}deg`);
      composition.style.setProperty("--tilt-y", `${-5 + x * 9}deg`);
      composition.style.setProperty("--tilt-move-x", `${x * 8}px`);
      composition.style.setProperty("--tilt-move-y", `${y * 8}px`);
      composition.style.setProperty("--tilt-card-x", `${x * 16}px`);
      composition.style.setProperty("--tilt-card-y", `${y * 16}px`);
      composition.style.setProperty("--tilt-card-x-neg", `${x * -14}px`);
      composition.style.setProperty("--tilt-card-y-neg", `${y * -14}px`);
    }

    function updateScrollProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll", max > 0 ? `${Math.min(1, window.scrollY / max)}` : "0");
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    nodes.forEach((node, index) => {
      node.classList.add("reveal");
      node.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    updateScrollProgress();
    window.addEventListener("pointermove", setMousePosition, { passive: true });
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("pointermove", setMousePosition);
      window.removeEventListener("scroll", updateScrollProgress);
      observer.disconnect();
    };
  }, [compositionSelector]);
}
