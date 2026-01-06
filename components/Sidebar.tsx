import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { signOut } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const tabs = [
        { label: 'Painel', icon: 'dashboard', path: '/dashboard' },
        { label: 'Equipe', icon: 'groups', path: '/collaborators' },
        { label: 'Perfil', icon: 'person', path: '/profile' }
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-white/10 z-50">
            <div className="p-6">
                <h1 className="text-2xl font-display font-bold text-primary">HLH <span className="text-slate-900 dark:text-white">Engenharia</span></h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className={`flex items-center w-full px-4 py-3 rounded-xl transition-all group ${currentPath === tab.path
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-500 dark:text-[#baab9c] hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <span className={`material-symbols-outlined mr-3 text-[20px] ${currentPath === tab.path ? 'filled-icon' : ''}`}>
                            {tab.icon}
                        </span>
                        <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-1">
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center w-full px-4 py-3 rounded-xl text-gray-500 dark:text-[#baab9c] hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                    <span className="material-symbols-outlined mr-3 text-[20px]">
                        {darkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                    <span className="font-medium text-sm">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
                </button>

                <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                    <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
                    <span className="font-medium text-sm">Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
