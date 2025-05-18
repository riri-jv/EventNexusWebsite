import { Variants } from 'framer-motion';

export const staggerContainer = (staggerChildren?: number, delayChildren?: number): Variants => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren || 0.1,
        delayChildren: delayChildren || 0,
      },
    },
  };
};

export const fadeIn = (
  direction: 'up' | 'down' | 'left' | 'right',
  type: string,
  delay: number,
  duration: number
): Variants => {
  return {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: 'easeOut',
      },
    },
  };
};

export const slideIn = (
  direction: 'up' | 'down' | 'left' | 'right',
  type: string,
  delay: number,
  duration: number
): Variants => {
  return {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
      x: direction === 'left' ? '100%' : direction === 'right' ? '-100%' : 0,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: 'easeOut',
      },
    },
  };
};