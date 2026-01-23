import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="glass"
            style={{
                position: 'relative',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'
            }}
        >
            <motion.div
                initial={false}
                animate={{
                    rotate: isDark ? 0 : 180,
                    scale: isDark ? 1 : 0
                }}
                transition={{ duration: 0.4, type: 'spring' }}
                style={{ position: 'absolute' }}
            >
                <Moon size={24} color="#a0aec0" fill="#a0aec0" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    rotate: isDark ? -180 : 0,
                    scale: isDark ? 0 : 1
                }}
                transition={{ duration: 0.4, type: 'spring' }}
                style={{ position: 'absolute' }}
            >
                <Sun size={24} color="#f6ad55" fill="#f6ad55" />
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
