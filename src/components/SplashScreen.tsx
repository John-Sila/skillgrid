import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../shared/components/Logo';

export const SplashScreen = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F19]">

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Logo />
      </motion.div>

    </div>
  );
};
