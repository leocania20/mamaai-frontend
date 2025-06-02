import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const colors = ["#E0F7FA", "#FCE4EC", "#E1F5FE", "#F3E5F5", "#E8F5E9", "#FFF3E0"];

export default function LoadingScreen() {
  const [colorIndex, setColorIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 1500);

    const timeout = setTimeout(() => {
      clearInterval(colorInterval);
      navigate("/login");
    }, 10000);

    return () => {
      clearInterval(colorInterval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <motion.div
      className="w-screen h-screen flex items-center justify-center fixed top-0 left-0"
      animate={{ backgroundColor: colors[colorIndex] }}
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
