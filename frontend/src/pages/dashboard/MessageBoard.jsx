import React, { useEffect, useState, useRef } from "react";
import messagesData from "../../assets/messages.json";
import { AnimatePresence, motion } from "framer-motion";

export default function MessageBoard({ interval = 4000 }) {
  const messages = messagesData.messages || [];
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, interval);
    return () => clearTimeout(timeoutRef.current);
  }, [index, interval, messages.length]);

  if (!messages.length) return null;

 
  return (
    <div className="w-full max-w-xl mx-auto my-4">
      <div className="relative  p-2 flex flex-col items-center min-h-[30px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            <span
  className="text-[#2c5f63] text-base md:text-lg font-medium text-center min-w-[250px] max-w-[360px] w-full block truncate"
>
  {messages[index].message}
</span>
            <span className="text-xs text-[#A67C52]/70 mt-1">{messages[index].timeAgo}</span>
          </motion.div>
        </AnimatePresence>
    
       
      </div>
    </div>
  );
}
