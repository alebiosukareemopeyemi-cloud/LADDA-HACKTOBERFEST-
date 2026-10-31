import type { Transition, Variants } from "framer-motion";

// Shared motion rules. Every animated thing in Ladda pulls from here.
export const dur = { micro: 0.15, standard: 0.3, big: 0.7 } as const;
export const stagger = 0.06;

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const spring: Transition = { type: "spring", stiffness: 260, damping: 24 };
export const springSoft: Transition = { type: "spring", stiffness: 120, damping: 20 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: dur.standard, ease } },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: spring },
};

export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1.4, ease: "easeInOut" } },
};

export const unlockBurst: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { scale: [0.8, 1.25, 1], opacity: 1, transition: { duration: 0.6, ease } },
};

// Active-node pulse: spread these onto a motion element.
export const pulseAnimate = { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] };
export const pulseTransition: Transition = { duration: 1.8, repeat: Infinity, ease: "easeInOut" };

// Parent that staggers its children (list of pins, cards, chips).
export const container = (delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

// Buttons and cards: lift on hover, shrink on press.
export const hoverLift = {
  whileHover: { y: -3, scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: spring,
};