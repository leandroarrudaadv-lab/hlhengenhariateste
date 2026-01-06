import React from 'react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <Sidebar />

            <main className="md:ml-64 w-full md:w-auto min-h-screen relative pb-20 md:pb-0 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default Layout;
