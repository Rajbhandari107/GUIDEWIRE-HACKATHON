import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onAdminEnabled: () => void;
  onAdminDisabled: () => void;
  adminEnabled: boolean;
  user: {
    name: string;
    phone: string;
    location: string;
    platform: string;
    avg_daily_income: number;
  };
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  isOpen,
  onClose,
  onLogout,
  onAdminEnabled,
  onAdminDisabled,
  adminEnabled,
  user,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const handleToggle = () => {
    if (adminEnabled) {
      // Turning OFF — immediate
      onAdminDisabled();
    } else {
      // Turning ON — show PIN modal
      setPin('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = () => {
    if (pin === '1234') {
      setPinLoading(true);
      setTimeout(() => {
        setShowPinModal(false);
        setPinLoading(false);
        setPin('');
        setPinError('');
        onAdminEnabled();
      }, 500);
    } else {
      setPinError('Incorrect PIN. Try 1234.');
      setPin('');
    }
  };

  const handlePinKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePinSubmit();
  };

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

            <div className="w-full h-[1px] bg-gray-100 mb-6" />

            {/* Admin Mode Toggle Card */}
            <div
              className={`w-full flex items-center justify-between p-4 mb-4 rounded-2xl border transition-all ${
                adminEnabled
                  ? 'bg-[#1E3A8A] border-[#1E3A8A]'
                  : 'bg-blue-50/50 border-blue-100/50 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${adminEnabled ? 'bg-white/20' : 'bg-blue-100'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={adminEnabled ? 'white' : '#1E3A8A'} strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className={`text-[15px] font-bold ${adminEnabled ? 'text-white' : 'text-blue-900'}`}>🛡 Admin Mode</div>
                  <div className={`text-[12px] font-medium ${adminEnabled ? 'text-blue-200' : 'text-blue-600/70'}`}>
                    {adminEnabled ? 'Insurer dashboard active' : 'Enable insurer dashboard access'}
                  </div>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={handleToggle}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                  adminEnabled ? 'bg-green-400' : 'bg-gray-200'
                }`}
              >
                <motion.div
                  animate={{ x: adminEnabled ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 active:bg-red-100 transition-colors border border-red-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              <span className="text-[15px] font-bold text-red-600">Logout of GigInsure</span>
            </button>
          </motion.div>

          {/* ─── IN-APP PIN MODAL ─── */}
          <AnimatePresence>
            {showPinModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 z-[200] backdrop-blur-sm"
                  onClick={() => { setShowPinModal(false); setPin(''); setPinError(''); }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 40 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                  className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-[28px] z-[201] shadow-2xl p-7 flex flex-col items-center"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-5 shadow-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="text-[20px] font-extrabold text-gray-900 mb-1 tracking-tight">Enter Admin PIN</div>
                  <div className="text-[13px] text-gray-500 mb-6 text-center">Access the insurer control center</div>

                  {/* PIN Input */}
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={e => { setPin(e.target.value); setPinError(''); }}
                    onKeyDown={handlePinKey}
                    autoFocus
                    placeholder="● ● ● ●"
                    className="w-full text-center text-[22px] font-bold tracking-[0.5em] border-2 border-gray-200 focus:border-[#1E3A8A] rounded-2xl py-3 mb-3 outline-none transition-colors bg-gray-50 placeholder:text-gray-300"
                  />

                  {/* Inline error */}
                  <AnimatePresence>
                    {pinError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[13px] font-semibold text-red-500 mb-3 flex items-center gap-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                        {pinError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm button */}
                  <button
                    onClick={handlePinSubmit}
                    disabled={pin.length < 4 || pinLoading}
                    className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-3.5 rounded-2xl mb-3 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-40 active:scale-[0.98]"
                  >
                    {pinLoading ? 'Verifying...' : 'Confirm PIN'}
                  </button>
                  <button
                    onClick={() => { setShowPinModal(false); setPin(''); setPinError(''); }}
                    className="text-[13px] text-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};
