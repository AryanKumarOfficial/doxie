'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white/60">
      <div className="text-center">
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-16 h-16 mb-4">
            <motion.div
              className="absolute inset-0 border-t-4 border-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            ></motion.div>
          </div>
          <h2 className="text-xl font-medium text-blue-700">Loading...</h2>
          <p className="text-gray-500 mt-2">Please wait while we prepare your notes</p>
        </motion.div>
      </div>
    </div>
  );
}