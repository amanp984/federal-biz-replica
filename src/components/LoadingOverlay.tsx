import { AnimatePresence, motion } from "framer-motion";
import { FEDERAL_LOGO_FULL } from "@/lib/logos";
import { useRouterState } from "@tanstack/react-router";

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
          <div className="flex flex-col items-center gap-4">
            <motion.img
              src={FEDERAL_LOGO_FULL}
              alt="FED BUSINESS"
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-40 h-auto drop-shadow"
            />
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fed-blue animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-fed-orange animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="w-2 h-2 rounded-full bg-fed-blue animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
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

/** Shows loading whenever the route pathname changes. */
export function useRouteLoading(duration = 700) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), duration);
    return () => clearTimeout(t);
  }, [pathname, duration]);
  return loading;
}