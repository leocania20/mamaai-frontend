import React from 'react';
import { motion } from "framer-motion";

const colors = ["#E0F7FA", "#FCE4EC", "#E1F5FE", "#F3E5F5", "#E8F5E9", "#FFF3E0"];

function LoadingScreen() {
  return (
    <motion.div
      className="w-screen h-screen flex items-center justify-center fixed top-0 left-0 z-50"
      animate={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }} // Cor aleatória
      transition={{ duration: 1 }}
    >
      <img
        src="/mamaai-logo.png"
        alt="MamaAI"
        className="w-200 h-200 object-contain"
      />
    </motion.div>
  );
}

export default LoadingScreen;