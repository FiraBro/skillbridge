import { useLocation, useNavigationType } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export const PageTransition = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  const isBackNavigation = navigationType === "POP";

  // Professional Easing Curves
  const smoothEase = [0.4, 0.0, 0.2, 1];
  const customEase = [0.65, 0, 0.35, 1];

  // Logic: Handle Progress Bar & Loading State
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    // Increment progress automatically
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval.current);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    // Simulate Page Completion
    const timer = setTimeout(() => {
      setIsLoading(false);
      setProgress(100);
      clearInterval(progressInterval.current);
    }, 700);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval.current);
    };
  }, [location.pathname]);

  // Page Animation Variants
  const pageVariants = {
    initial: (isBack) => ({
      opacity: 0,
      y: isBack ? -8 : 8,
      scale: 0.99,
    }),
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: smoothEase,
        when: "beforeChildren",
      },
    },
    exit: (isBack) => ({
      opacity: 0,
      y: isBack ? 8 : -8,
      transition: {
        duration: 0.3,
        ease: customEase,
      },
    }),
  };

  return (
    <>
      {/* 1. TOP PROGRESS BAR (Consistency with Spinner) */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-0.5 z-[10000]"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LOADING OVERLAY (White Glassmorphism) */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 bg-white/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Blue Professional Spinner */}
              <div className="relative w-12 h-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-full h-full border-[3px] border-blue-50 border-t-blue-600 rounded-full shadow-sm"
                />
              </div>

              {/* Status & Percentage */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/70">
                  Loading
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                    {Math.round(progress)}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. ACTUAL PAGE CONTENT */}
      <AnimatePresence mode="wait" custom={isBackNavigation}>
        <motion.div
          key={location.pathname}
          custom={isBackNavigation}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-white relative"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
