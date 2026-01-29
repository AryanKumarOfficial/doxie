"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "../../lib/utils";

interface MotionDivProps extends Omit<React.ComponentProps<typeof motion.div>, 'variants'> {
  children?: React.ReactNode; // Changed from required to optional
  delay?: number;
  duration?: number;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale" | "fadeInScale" | "bounce" | "rotate" | "slideBounce" | "pulsate";
  once?: boolean;
}

export const MotionDiv = ({
  children,
  delay = 0,
  duration = 0.5,
  animation = "fadeIn",
  once = true,
  className,
  ...props
}: MotionDivProps) => {
  // Animation variants
  const variants: Record<string, Variants> = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
    fadeInScale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      },
    },
    bounce: {
      hidden: { y: -20, opacity: 0 },
      visible: { 
        y: 0, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 10
        }
      },
    },
    rotate: {
      hidden: { opacity: 0, rotateZ: -5 },
      visible: { 
        opacity: 1, 
        rotateZ: 0,
        transition: {
          type: "spring",
          stiffness: 150,
          damping: 20
        }
      },
    },
    slideBounce: {
      hidden: { opacity: 0, x: -40 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 12
        }
      },
    },
    pulsate: {
      hidden: { opacity: 0, scale: 1 },
      visible: { 
        opacity: 1,
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.8,
          times: [0, 0.5, 1],
          ease: "easeInOut"
        }
      },
    }
  };

  // Fixed the transition property check
  const hasCustomTransition = Object.prototype.hasOwnProperty.call(
    variants[animation].visible, 
    'transition'
  );

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={variants[animation]}
      transition={!hasCustomTransition ? { duration, delay } : { delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};