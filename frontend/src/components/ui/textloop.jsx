'use client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, Children } from 'react';

export function TextLoop({
  children,
  className,
  direction = 'up',
  isHovered,
}) {
  const items = Children.toArray(children);
  const currentIndex = isHovered ? 1 : 0;

  const variants = {
    enter: (direction) => ({
      y: direction === 'up' ? 20 : -20,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction) => ({
      y: direction === 'up' ? -20 : 20,
      opacity: 0
    })
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "tween", duration: 0.15 },
            opacity: { duration: 0.1 }
          }}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
