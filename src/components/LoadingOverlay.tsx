import { AnimatePresence, motion } from "framer-motion";
import { FEDERAL_LOGO_FULL } from "@/lib/logos";

export function LoadingOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-white/60"
        >
          <motion.img
            src={FEDERAL_LOGO_FULL}
            alt="Federal Bank"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-40 h-auto drop-shadow"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useState } from "react";

export function usePageLoading(duration = 250) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  return loading;
}