import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function RestrictionPopup({
  open,
  onClose,
  message = "Cannot proceed via Net Banking. Please try using Mobile Banking.",
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-fed-blue text-white px-5 py-3 flex items-center gap-2 border-b-4 border-fed-orange">
              <AlertTriangle size={18} /> <span className="font-semibold">FED BIZ Notice</span>
            </div>
            <div className="p-6 text-sm text-foreground">{message}</div>
            <div className="px-5 pb-5 flex justify-end">
              <button
                onClick={onClose}
                className="bg-fed-blue text-white text-sm px-5 py-2 rounded hover:bg-fed-blue-dark"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}