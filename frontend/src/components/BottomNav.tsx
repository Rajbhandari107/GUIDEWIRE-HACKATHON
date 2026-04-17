import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Screen = 'HOME' | 'POLICY' | 'CLAIMS' | 'ADMIN';

interface BottomNavProps {
  activeScreen: Screen;
  setScreen: (screen: Screen) => void;
  adminEnabled: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setScreen, adminEnabled }) => {
  const baseItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
    {
      id: 'HOME',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'POLICY',
      label: 'Policy',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      id: 'CLAIMS',
      label: 'Claims',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
  ];

  const adminItem: { id: Screen; label: string; icon: React.ReactNode } = {
    id: 'ADMIN',
    label: 'Admin',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };

  const items = adminEnabled ? [...baseItems, adminItem] : baseItems;

  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-start justify-around pt-2.5 flex-shrink-0 z-50">
      {items.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <div
            key={item.id}
            onClick={() => setScreen(item.id)}
            className="flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 relative"
          >
            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="w-6 h-[3px] rounded-full bg-[#1E3A8A] mb-0.5"
              />
            )}
            {/* Admin badge */}
            {item.id === 'ADMIN' && adminEnabled && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white" />
            )}
            <div className={isActive ? 'text-[#1E3A8A]' : 'text-gray-400'}>
              {item.icon}
            </div>
            <span className={`text-[10px] ${isActive ? 'text-[#1E3A8A] font-medium' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
