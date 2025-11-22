import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './MobileMenu.module.css';

const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'Calendar', icon: '📅', path: '/calendar' },
    { name: 'AI Chat', icon: '💬', path: '/messages' },
    { name: 'Healthy Menu', icon: '🥗', path: '/healthy-menu' },
    { name: 'Meal Plan', icon: '📝', path: '/meal-plan' },
    { name: 'Food Diary', icon: '📔', path: '/food-diary' },
    { name: 'Progress', icon: '📈', path: '/progress' },
    { name: 'Exercises', icon: '🏋️', path: '/exercises' },
    { name: 'Health Insights', icon: '💡', path: '/health-insights' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
];

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/login');
    };

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-out drawer */}
            <aside
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
                aria-label="Mobile navigation menu"
            >
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🍃</div>
                        <span className={styles.logoText}>Nutrigo</span>
                    </div>
                    <button
                        onClick={onClose}
                        className={styles.closeBtn}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navText}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <span className={styles.logoutIcon}>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

// Hamburger button component
export function HamburgerButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={styles.hamburger}
            aria-label="Open menu"
            aria-expanded="false"
        >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
        </button>
    );
}
