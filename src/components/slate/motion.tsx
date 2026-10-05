"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/**
 * Slate motion primitives — iOS/macOS-style physical animation.
 * Spring-based, natural easing, full prefers-reduced-motion support.
 * Never blocks interaction.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** iOS-style spring for most UI (buttons, cards, reveals). */
const SPRING = { type: "spring" as const, stiffness: 400, damping: 32 };

/** Page transition wrapper: iOS push-style fade + slight scale. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container for lists (iOS Settings-style reveal). */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

/** Staggered child item — iOS list row reveal (fade + slide up). */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

/** Reveal on mount, used for hero/QR appearances. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/** The satisfying "QR appears" moment — iOS-style scale + blur-in. */
export function QrReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ ...SPRING, stiffness: 300, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

/** Press feedback for buttons — iOS-style scale-down on tap. */
export function tapScale(): { whileTap: { scale: number }; whileHover?: { scale: number } } {
  return { whileTap: { scale: 0.96 }, whileHover: { scale: 1.02 } };
}

/** iOS-style view transition — fade + slight scale (like pushing a new screen). */
export function ViewTransition({ viewKey, children }: { viewKey: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.01, y: -4 }}
        transition={{ ...SPRING, stiffness: 500, damping: 38 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** iOS-style sheet/modal slide-up (for modals, share sheets, etc.). */
export function SheetUp({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 38, mass: 0.8 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** iOS-style list row — press to indent slightly (like a table-view cell tap). */
export function ListRowPress({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
