import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const tabs = [
        { label: 'Painel', icon: 'dashboard', path: '/dashboard' },
        { label: 'Equipe', icon: 'groups', path: '/collaborators' },
        { label: 'Perfil', icon: 'person', path: '/profile' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16 w-full mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentPath === tab.path ? 'text-primary' : 'text-gray-400 dark:text-[#baab9c]'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${currentPath === tab.path ? 'filled-icon' : ''}`}>
                            {tab.icon}
                        </span>
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
