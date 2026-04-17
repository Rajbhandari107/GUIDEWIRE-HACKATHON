import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface User {
  id: number;
  location: string;
}

interface Policy {
  id: number;
  plan_name: string;
  current_premium: number;
  coverage: number;
  is_active: boolean;
  end_date: string;
}

interface PolicyScreenProps {
  user: User;
  policy?: Policy;
  onPurchase: (policy: Policy) => void;
}

export const PolicyScreen: React.FC<PolicyScreenProps> = ({ user, policy, onPurchase }) => {
  const [loading, setLoading] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [premiumError, setPremiumError] = useState(false);
  const [premiumData, setPremiumData] = useState<any>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  React.useEffect(() => {
    fetchPremium();
  }, []);

  const fetchPremium = async () => {
    setPremiumLoading(true);
    setPremiumError(false);
    try {
      const response = await axios.post(`${API_BASE}/policies/calculate-premium`, null, {
        params: { user_id: user.id, plan_name: "Standard" }
      });
      setPremiumData(response.data);
    } catch (err) {
      console.error("Failed to fetch premium:", err);
      // Deterministic pricing ensures availability during network instability
      setPremiumData({
        premium: 29,
        coverage: 800,
        breakdown: [
          { name: "Base Price",       value: 20 },
          { name: "Risk Adjustment",  value: 3  },
          { name: "Income Exposure",  value: 5  },
          { name: "Hours Exposure",   value: 1  },
        ],
        message: "Fallback pricing"
      });
      setPremiumError(true);
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!premiumData) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/policies/purchase`, {
        user_id: user.id,
        plan_name: "Standard",
        base_premium: 29,
        current_premium: premiumData.premium,
        coverage: premiumData.coverage
      });
      const activeResp = await axios.get(`${API_BASE}/policies/active/${user.id}`);
      if (activeResp.data) {
        onPurchase(activeResp.data);
      }
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-2.5 mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          <span className="text-[20px] font-bold text-gray-900">Your Weekly Plan</span>
        </div>

        {policy && policy.is_active ? (
          <div className="bg-[#1E3A8A] rounded-[28px] p-7 mb-6 relative overflow-hidden shadow-2xl shadow-blue-900/40 min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[14px] font-bold text-blue-100 uppercase tracking-widest">{policy.plan_name} Protection</span>
                <div className="bg-green-500/20 border border-green-500/30 text-[#4ADE80] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  Active
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[44px] font-black text-white leading-none tracking-tighter">₹{policy.current_premium}</div>
                <div className="text-[14px] text-blue-200/80 font-medium mt-1">per week billing</div>
              </div>

              <div className="text-[13px] text-white/70 font-medium italic underline decoration-white/20 underline-offset-4">
                Fully covered until {new Date(policy.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                <span className="text-[11px] text-white font-bold uppercase tracking-wide">Auto-renews Weekly</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#1E3A8A] rounded-[28px] p-7 mb-6 relative overflow-hidden shadow-2xl shadow-blue-900/40 min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[14px] font-bold text-blue-100 uppercase tracking-widest">Standard Protection</span>
                <span className="text-[10px] font-extrabold text-[#93C5FD] bg-blue-500/20 px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-500/20">Available</span>
              </div>

              <div className="mb-6">
                {premiumLoading ? (
                  <div className="h-12 w-32 bg-white/5 animate-pulse rounded-xl" />
                ) : (
                  <>
                    <div className="text-[44px] font-black text-white leading-none tracking-tighter">₹{premiumData?.premium || 29}</div>
                    <div className="text-[14px] text-blue-200/80 font-medium mt-1 text-opacity-70">per week billing</div>
                  </>
                )}
              </div>

              <div className="text-[13px] text-white/70 font-medium">
                Up to ₹{premiumData?.coverage || 1500} coverage exposure per week
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
              <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] text-[#93C5FD] font-bold uppercase tracking-wide">Instant Activation</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[16px] p-4 mb-3 shadow-sm">
          <div className="text-base font-semibold text-gray-900 mb-2">Pricing Breakdown</div>
          <div className="space-y-2">
            {premiumData?.breakdown.map((factor: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 last:pb-0">
                <span className="text-[13px] text-gray-600">{factor.name}</span>
                <span className="text-[13px] font-bold text-gray-900">₹{factor.value}</span>
              </div>
            ))}
            {premiumLoading && !premiumData && (
              <div className="flex items-center gap-2 py-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                <div className="text-[12px] text-gray-400 italic">Analyzing your profile...</div>
              </div>
            )}
            {premiumError && (
              <div className="flex items-center justify-between">
                <div className="text-[12px] text-orange-500">Using estimated pricing.</div>
                <button onClick={fetchPremium} className="text-[11px] text-blue-600 underline">Retry</button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-4 mb-3 shadow-sm">
          <div className="text-base font-semibold text-gray-900 mb-2">How It Works</div>
          {[
            { num: 1, text: "We detect a disruption in your area using live weather & AQI data" },
            { num: 2, text: "Claim is auto-validated — no paperwork or uploads needed" },
            { num: 3, text: "Payout is credited to your UPI within minutes" }
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex items-start gap-3 py-2">
                <div className="w-[26px] h-[26px] rounded-full bg-[#EFF6FF] border-[1.5px] border-[#BFDBFE] flex items-center justify-center text-[12px] font-extrabold text-[#1E3A8A] flex-shrink-0">{step.num}</div>
                <div className="text-[13px] text-gray-700 pt-1 leading-snug">{step.text}</div>
              </div>
              {i < 2 && <div className="w-[2px] h-3 bg-gray-200 ml-3" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-[#FEF9C3] rounded-xl p-3.5 mb-2 shadow-sm border border-yellow-200/50">
          <div className="text-[12px] font-bold text-[#92400E] mb-0.5 uppercase tracking-wide">No action needed</div>
          <div className="text-[12px] text-[#A16207] leading-relaxed">Everything is automatic. You'll get notified when a claim is triggered.</div>
        </div>
      </div>

      <div className="p-4 pt-3 pb-5 bg-[#F3F4F6]">
        {policy && policy.is_active ? (
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="w-full bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-sm"
          >
            Manage Plan
          </button>
        ) : (
          <button 
            onClick={handleActivate}
            disabled={loading}
            className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? "Activating..." : "Activate Weekly Protection"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isManageModalOpen && policy && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageModalOpen(false)}
              className="absolute inset-0 bg-black/60 z-[100] backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[101] shadow-2xl p-6 pb-10"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 opacity-50" />
              
              <div className="text-[20px] font-bold text-gray-900 mb-4">Manage Plan</div>
              
              <div className="bg-[#1E3A8A] rounded-[20px] p-5 mb-5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                 <div className="text-[13px] text-white/90 font-bold mb-1 flex items-center gap-2">
                    {policy.plan_name} Protection Active ✅
                 </div>
                 <div className="text-[28px] font-extrabold text-white my-0.5">₹{policy.current_premium}<span className="text-sm font-normal opacity-70">/week</span></div>
                 <div className="text-[13px] text-white/80">Coverage ₹{policy.coverage}</div>
                 <div className="text-[11px] text-blue-200 mt-2">Valid until {new Date(policy.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>

              <div className="space-y-3 pb-2">
                <button 
                  onClick={async () => {
                     try {
                       await axios.post(`${API_BASE}/policies/purchase`, {
                         user_id: user.id,
                         plan_name: policy.plan_name,
                         base_premium: policy.current_premium,
                         current_premium: policy.current_premium,
                         coverage: policy.coverage
                       });
                       const activeResp = await axios.get(`${API_BASE}/policies/active/${user.id}`);
                       if (activeResp.data) { onPurchase(activeResp.data); }
                     } catch (e) { console.error('Renew failed:', e); }
                     setIsManageModalOpen(false);
                  }}
                  className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-md"
                >
                  Renew Plan
                </button>
                <button 
                  onClick={() => {
                     setIsManageModalOpen(false);
                  }}
                  className="w-full bg-blue-50 text-[#1E3A8A] text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
                >
                  Upgrade Plan
                </button>
                <button 
                  onClick={() => setIsManageModalOpen(false)}
                  className="w-full bg-white text-gray-500 border border-gray-200 text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
