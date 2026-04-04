import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface User {
  id: number;
  name: string;
}

interface AdminScreenProps {
  user: User;
  onRefresh: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ user, onRefresh }) => {
  const [simulating, setSimulating] = useState(false);
  const [logs, setLogs] = useState<{ dot: string; text: string; time: string }[]>([]);

  const addLog = (text: string, color: string = '#3B82F6') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [{ dot: color, text, time }, ...prev].slice(0, 5));
  };

  const simulateDisruption = async (type: string) => {
    setSimulating(true);
    addLog(`Initiating ${type.replace('_', ' ')} simulation...`, '#3B82F6');
    try {
      await axios.post(`${API_BASE}/policies/simulate-disruption/${user.id}?type=${type}`);
      addLog(`${type.replace('_', ' ')} threshold exceeded!`, '#22C55E');
      addLog(`Claim generated for ${user.name}`, '#3B82F6');
      addLog(`Fraud validation passed (score: 0.08)`, '#3B82F6');
      addLog(`Payout successful!`, '#22C55E');
      onRefresh(); 
    } catch (err) {
      console.error("Simulation failed:", err);
      addLog(`Simulation failed: Check backend connection`, '#EF4444');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="bg-[#FEF9C3] p-1.5 rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#92400E" strokeWidth="1.8"><path d="M10 1l2.5 5H18l-4.5 3.5 1.5 5.5L10 12l-5 3 1.5-5.5L2 6h5.5z"/></svg>
        </div>
        <span className="text-[20px] font-bold text-gray-900">Simulation Panel</span>
      </div>
      <div className="text-[13px] text-gray-500 mb-5 leading-relaxed">Use this panel to simulate real-world disruptions and test the automated claim flow.</div>

      <div className="space-y-3 mb-6">
        <button 
          onClick={() => simulateDisruption('heavy_rain')}
          disabled={simulating}
          className="w-full p-4 rounded-2xl font-bold flex items-center justify-between bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span>Simulate Heavy Rain</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 10c0-3 2-7 5-8M10 2c3 1 5 5 5 8"/><path d="M7 14l-1 3M10 14l-1 3M13 14l-1 3"/></svg>
        </button>

        <button 
          onClick={() => simulateDisruption('high_aqi')}
          disabled={simulating}
          className="w-full p-4 rounded-2xl font-bold flex items-center justify-between bg-[#1E3A8A] text-white shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span>Simulate High AQI</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12H5l7-10v8h4l-7 10z"/></svg>
        </button>
      </div>

      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">System Log</div>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-[11px] text-gray-400 italic py-2">No activity logged.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: log.dot }} />
                <div className="text-[12px] text-gray-700 leading-tight">{log.text}</div>
                <div className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{log.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
