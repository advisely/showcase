import { motion, AnimatePresence } from 'framer-motion';

interface OrientationModalProps {
  isOpen: boolean;
  onSelect: (orientation: 'landscape' | 'portrait') => void;
  onCancel: () => void;
}

export default function OrientationModal({ isOpen, onSelect, onCancel }: OrientationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Select Card Orientation</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <button
                onClick={() => onSelect('landscape')}
                className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-slate-700 hover:bg-blue-600 transition-all transform hover:scale-105"
              >
                <div className="w-32 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow" />
                <span className="font-medium text-lg">Landscape</span>
              </button>

              <button
                onClick={() => onSelect('portrait')}
                className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-slate-700 hover:bg-blue-600 transition-all transform hover:scale-105"
              >
                <div className="w-20 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow" />
                <span className="font-medium text-lg">Portrait</span>
              </button>
            </div>

            <button
              onClick={onCancel}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
