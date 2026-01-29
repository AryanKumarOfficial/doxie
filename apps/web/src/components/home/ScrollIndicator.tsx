"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScrollIndicator() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.scrollHeight;
      const totalScroll = docHeight - windowHeight;
      const percentage = (scrollTop / totalScroll) * 100;
      setScrollPercentage(percentage);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 z-50"
      style={{ width: `${scrollPercentage}%` }}
      initial={{ width: "0%" }}
      animate={{ width: `${scrollPercentage}%` }}
      transition={{ duration: 0.1 }}
    />
  );
}