import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const Toast = () => {
  const notification = useStore(state => state.notification);

  const typeStyles = {
    info: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: 'ℹ️'
    },
    success: {
      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
      icon: '✓'
    },
    warning: {
      background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      icon: '⚠'
    }
  };

  if (!notification) return null;

  const style = typeStyles[notification.type] || typeStyles.info;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: style.background,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '500px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <span style={{ fontSize: '18px' }}>{style.icon}</span>
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
