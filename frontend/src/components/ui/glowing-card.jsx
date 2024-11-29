import React, {useContext} from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

import { cn } from "../../lib/utils"; 
import {DarkModeContext} from "../../context/DarkMode";

const GlowingCard = ({ className = "", width = 256, height = 160, children }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const {darkMode, setDarkMode} = useContext(DarkModeContext);

  const handleMouseMove = (event) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const lightBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `
      radial-gradient(
        circle at ${x}px ${y}px,
        
        rgba(0, 0, 0, 1.3) 0%,
        rgba(255, 255, 255, 0) 90%
      ),
      linear-gradient(to right, #e2e8f0, #cbd5e0)
    `
  );

  const darkBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `
      radial-gradient(
        circle at ${x}px ${y}px,
        rgba(255, 255, 255, 0.3) 0%,
        rgba(255, 255, 255, 0) 70%
      ),
      linear-gradient(to right, #282C31FF, #35393EFF)
    `
  );

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn(
          "rounded-lg cursor-input relative overflow-hidden",
          "transition-shadow duration-300"
        )}
        style={{
          width,
          height,
          background: darkMode ? darkBackground : lightBackground,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{
          background:
                    darkMode
              ? "linear-gradient(to right, #664A68FF, #2d3748)"
              : "linear-gradient(to right, #e2e8f0, #B273B7FF)",
        }}
        
        whileHover={{ scale: 1.02 }}
        transition={{ 
          duration: 0.2, 
          ease: "easeOut",
          scale: {
            type: "spring",
            damping: 15,
            stiffness: 300
          }
        }}
      >
        <motion.div
          className={cn(
            "absolute inset-[1px] rounded-[7px] p-4 flex flex-col justify-between",
            darkMode ? "bg-background" : "bg-gray-100"
          )}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GlowingCard;
