import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: {
    name: string;
    phone: string;
    location: string;
    platform: string;
    avg_daily_income: number;
  };
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({ isOpen, onClose, onLogout, user }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-[100] backdrop-blur-[2px]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[101] shadow-2xl p-6 pb-10"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 opacity-50" />

            {/* Profile Info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-900/20">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{user.name}</div>
                <div className="text-[13px] text-gray-500 font-medium">#{user.phone}</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Location</span>
                </div>
                <span className="text-sm font-bold text-gray-900 uppercase">{user.location}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Earnings Mode</span>
                </div>
                <span className="text-sm font-bold text-teal-600 uppercase">{user.platform}</span>
              </div>
            </div>

            <div className="w-full h-[1px] bg-gray-100 mb-8" />

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 active:bg-red-100 transition-colors border border-red-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              <span className="text-[15px] font-bold text-red-600">Logout of GigInsure</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
