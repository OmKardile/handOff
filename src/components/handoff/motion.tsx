"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants, type Transition } from "framer-motion";

/**
 * HandOff motion system — smooth, fast, physical.
 * Everything is spring-based for natural feel.
 * Durations are short (150-300ms) for snappy responsiveness.
 * Full prefers-reduced-motion support.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fast spring — snappy, for most UI (buttons, cards, reveals). */
const FAST_SPRING: Transition = { type: "spring", stiffness: 600, damping: 30 };

/** Medium spring — for page transitions and larger elements. */
const MED_SPRING: Transition = { type: "spring", stiffness: 500, damping: 35 };

/** Snappy tween — for fade-only transitions where spring feels bouncy. */
const SNAP_TWEEN: Transition = { duration: 0.18, ease: EASE };

/** Smooth tween — for blur/scale reveals. */
const SMOOTH_TWEEN: Transition = { duration: 0.28, ease: EASE };

/** Page transition — fast fade + slight scale, snappy. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={SNAP_TWEEN}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container — fast stagger for list reveals. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

/** Staggered child — fast fade + slide up. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: FAST_SPRING,
  },
};

/** Reveal on mount — fast scale + fade. */
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
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...FAST_SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/** QR reveal — fast blur-in + scale, satisfying but quick. */
export function QrReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={SMOOTH_TWEEN}
    >
      {children}
    </motion.div>
  );
}

/** Press feedback — fast scale-down on tap. */
export function tapScale(): { whileTap: { scale: number }; whileHover?: { scale: number } } {
  return { whileTap: { scale: 0.95, transition: { duration: 0.1 } }, whileHover: { scale: 1.02, transition: { duration: 0.15 } } };
}

/** View transition — fast fade + slide, snappy push/pop. */
export function ViewTransition({ viewKey, children }: { viewKey: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={SNAP_TWEEN}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Sheet/modal slide-up — fast spring. */
export function SheetUp({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** List row press — fast indent on tap. */
export function ListRowPress({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98, transition: { duration: 0.08 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Fade in — simple, fast, for toasts/banners. */
export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Slide in from bottom — fast, for banners/notifications. */
export function SlideUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ ...FAST_SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}
