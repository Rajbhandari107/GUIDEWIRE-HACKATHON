import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 sm:p-4">
      {/* Mobile Frame (iPhone 13 size 390x844 on desktop, full screen on mobile) */}
      <div className="relative w-full h-screen sm:w-[390px] sm:h-[844px] bg-[#F3F4F6] sm:rounded-[44px] shadow-2xl overflow-hidden sm:border-2 sm:border-gray-300 flex flex-col">
        {/* Status Bar - Only on Desktop view to maintain the "mockup" feel */}
        <div className="hidden sm:flex h-11 bg-white items-center justify-between px-6 flex-shrink-0 z-50">
          <span className="text-[15px] font-semibold text-gray-900">9:41</span>
          <div className="flex gap-1.5 items-center">
            <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#111827"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill="#111827"/><rect x="9" y="0" width="3" height="12" rx="1" fill="#111827"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#D1D5DB"/></svg>
            <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5C9.5 0.5 12.5 0.5 14 2L7.5 8.5L1 2C2.5 0.5 5.5 0.5 7.5 2.5Z" fill="#111827" stroke="#111827" stroke-width="0.5"/><circle cx="7.5" cy="10.5" r="1.5" fill="#111827"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="#111827" stroke-width="1.2" fill="none"/><rect x="1.5" y="2.5" width="15" height="7" rx="2" fill="#111827"/><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#111827"/></svg>
          </div>
        </div>
        
        {/* Content Area */}
        <div id="screen" className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
