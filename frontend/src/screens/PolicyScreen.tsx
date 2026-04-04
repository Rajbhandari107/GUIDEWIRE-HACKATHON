import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
}

interface PolicyScreenProps {
  user: User;
  onPurchase: (policy: Policy) => void;
}

export const PolicyScreen: React.FC<PolicyScreenProps> = ({ user, onPurchase }) => {
  const [loading, setLoading] = useState(false);
  const [premiumData, setPremiumData] = useState<any>(null);

  React.useEffect(() => {
    fetchPremium();
  }, []);

  const fetchPremium = async () => {
    try {
      const response = await axios.post(`${API_BASE}/policies/calculate-premium`, null, {
        params: { user_id: user.id, plan_name: "Standard" }
      });
      setPremiumData(response.data);
    } catch (err) {
      console.error("Failed to fetch premium:", err);
    }
  };

  const handleActivate = async () => {
    if (!premiumData) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/policies/purchase`, {
        user_id: user.id,
        plan_name: "Standard",
        base_premium: 29,
        current_premium: premiumData.premium,
        coverage: premiumData.coverage
      });
      onPurchase(response.data);
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

        <div className="bg-[#1E3A8A] rounded-[20px] p-5.5 mb-4">
          <div className="text-[13px] text-white/70">Standard Protection</div>
          {premiumData ? (
            <div className="text-[32px] font-extrabold text-white my-0.5">₹{premiumData.premium}<span className="text-sm font-normal opacity-70">/week</span></div>
          ) : (
            <div className="h-10 w-24 bg-blue-400/30 animate-pulse rounded-lg my-1" />
          )}
          <div className="text-[13px] text-white/65">Up to ₹{premiumData?.coverage || 1500} coverage/week</div>
          <div className="inline-block bg-blue-500/30 text-[#93C5FD] text-[11px] px-2.5 py-1 rounded-full mt-2.5 font-medium">Auto-renews every Monday</div>
        </div>

        <div className="bg-white rounded-[16px] p-4 mb-3 shadow-sm">
          <div className="text-base font-semibold text-gray-900 mb-2">Pricing Breakdown</div>
          <div className="space-y-2">
            {premiumData?.breakdown.map((factor: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 last:pb-0">
                <span className="text-[13px] text-gray-600">{factor.name}</span>
                <span className="text-[13px] font-bold text-gray-900">₹{factor.value}</span>
              </div>
            ))}
            {!premiumData && <div className="text-[12px] text-gray-400 italic">Analyzing your profile...</div>}
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
        <button 
          onClick={handleActivate}
          disabled={loading}
          className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          {loading ? "Activating..." : "Activate Weekly Protection"}
        </button>
      </div>
    </motion.div>
  );
};
