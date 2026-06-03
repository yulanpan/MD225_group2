"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}>
      {children}
    </MotionConfig>
  );
}
