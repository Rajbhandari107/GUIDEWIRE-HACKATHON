import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { API_BASE } from '../config';


interface User {
  id: number;
  name: string;
}

interface AdminScreenProps {
  user: User;
  onRefresh: () => void;
  onReturnHome: () => void;
}

interface RecentPayout {
  worker_name: string;
  claim_amount: number;
  risk_score: number;
  payment_id: string;
  paid_at: string;
}

// Replaced mock data with live state

export const AdminScreen: React.FC<AdminScreenProps> = ({ user, onRefresh, onReturnHome }) => {
  const [simulating, setSimulating] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [logs, setLogs] = useState<{ dot: string; text: string; time: string }[]>([]);
  const [recentPayouts, setRecentPayouts] = useState<RecentPayout[]>([]);
  const [lossData, setLossData] = useState<any[]>([]);
  const [fraudData, setFraudData] = useState<any[]>([]);
  const [cityWeathers, setCityWeathers] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchRecentPayouts();
    fetchStats();
    fetchAllWeather();
    const interval = setInterval(() => {
      fetchRecentPayouts();
      fetchStats();
    }, 5000);
    const wxInterval = setInterval(fetchAllWeather, 5 * 60 * 1000);
    return () => { clearInterval(interval); clearInterval(wxInterval); };
  }, []);

  const fetchRecentPayouts = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/api/payments/recent-payouts`);
      setRecentPayouts(resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/policies/admin/stats`);
      setLossData(resp.data.loss_data);
      setFraudData(resp.data.fraud_data);
    } catch (e) {
      console.error(e);
    }
  };

  const ADMIN_CITIES = ['Chennai', 'Bangalore', 'Mumbai'];

  const fetchAllWeather = async () => {
    const results: Record<string, any> = {};
    await Promise.allSettled(
      ADMIN_CITIES.map(async (city) => {
        try {
          const resp = await axios.get(`${API_BASE}/policies/weather/${encodeURIComponent(city)}`);
          results[city] = resp.data;
        } catch {
          // leave city missing; tile will show skeleton
        }
      })
    );
    setCityWeathers(results);
  };

  const CONDITION_EMOJI: Record<string, string> = {
    Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️',
    Clear: '☀️', Clouds: '⛅', Haze: '🌫️',
    Mist: '🌫️', Fog: '🌫️', Snow: '❄️',
  };

  const addLog = (text: string, color: string = '#3B82F6') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [{ dot: color, text, time }, ...prev].slice(0, 8));
  };

  const handleMassSimulate = async (endpoint: string, eventName: string) => {
    if (simulating) return;
    setSimulating(true);
    addLog(`Initiating ${eventName} in ${selectedCity}`, '#3B82F6');
    try {
      const resp = await axios.post(`${API_BASE}/policies/admin/simulate/${endpoint}?city=${selectedCity}`);
      const data = resp.data;
      
      setTimeout(() => addLog(`${data.impacted_count} workers impacted`, '#EA580C'), 600);
      setTimeout(() => addLog(`${data.approved_count} claims approved`, '#22C55E'), 1200);
      setTimeout(() => {
        addLog(`₹${data.total_payout} total payout queued`, '#22C55E');
        onRefresh();
        setSimulating(false);
      }, 1800);
      
    } catch (err) {
      console.error(err);
      addLog(`Failed to trigger ${eventName}`, '#EF4444');
      setSimulating(false);
    }
  };

  const simulateFraudCase = async (type: string) => {
    setSimulating(true);
    addLog(`Initiating fraud simulation: ${type.toUpperCase()}`, '#3B82F6');
    try {
      const response = await axios.post(`${API_BASE}/policies/simulate/fraud-case/${type}?user_id=${user.id}`);
      const claim = response.data.claim;
      
      addLog(`Claim Generated. AI Fraud Score: ${claim.fraud_score}`, claim.risk_level === 'low' ? '#22C55E' : '#EF4444');
      
      if (claim.risk_level === 'low') {
        addLog(`System action: APPROVED (Ready for Payout)`, '#22C55E');
      } else if (claim.risk_level === 'medium') {
        addLog(`System action: DELAYED - Risk Level: ${claim.risk_level.toUpperCase()}`, '#EA580C');
      } else {
        addLog(`System action: BLOCKED - Risk Level: ${claim.risk_level.toUpperCase()}`, '#EF4444');
      }
      onRefresh(); 
    } catch (err) {
      console.error("Simulation failed:", err);
      addLog(`Simulation failed: Check connection`, '#EF4444');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 bg-[#F8FAFC] min-h-full pb-20"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#1E3A8A] p-2 rounded-xl flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v20M2 12h20m-14 4h8m-8-8h8"/></svg>
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 leading-tight">Admin & Risk Desk</h2>
            <p className="text-[12px] text-gray-500">Live AI parametric insights</p>
          </div>
        </div>
        <button 
          onClick={onReturnHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Worker Mode
        </button>
      </div>

      {/* CITY WEATHER TILES */}
      <div className="mb-4">
        <div className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Live City Weather</div>
        <div className="grid grid-cols-3 gap-2">
          {ADMIN_CITIES.map((city) => {
            const w = cityWeathers[city];
            const isLive = w?.source === 'openweather';
            const emoji = w ? (CONDITION_EMOJI[w.condition] ?? '🌡️') : '…';
            return (
              <div key={city} className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-500 truncate">{city}</span>
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      isLive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isLive ? 'Live' : w ? 'Mock' : '…'}
                  </span>
                </div>
                {w ? (
                  <>
                    <div className="text-[16px]">{emoji}</div>
                    <div className="text-[13px] font-extrabold text-gray-900">{w.temperature}°C</div>
                    <div className="text-[10px] text-gray-500">{w.condition}</div>
                    {w.rainfall_mm > 0 && (
                      <div className="text-[9px] text-blue-500 font-medium">{w.rainfall_mm}mm rain</div>
                    )}
                  </>
                ) : (
                  <div className="h-10 bg-gray-100 animate-pulse rounded-lg mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CITY SELECTOR */}
      <div className="mb-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {['Chennai', 'Bangalore', 'Mumbai'].map(city => (
            <button
              key={city}
              onClick={() => !simulating && setSelectedCity(city)}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                selectedCity === city 
                  ? 'bg-[#1E3A8A] text-white shadow' 
                  : 'text-gray-500 hover:bg-gray-50'
              } ${simulating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* DISRUPTION SIMULATOR */}
      <div className="mb-5">
        <div className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Live Disruption Simulator</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button 
            onClick={() => handleMassSimulate('rain', 'Heavy Rain')}
            disabled={simulating}
            className="bg-white border border-blue-100 hover:border-blue-300 p-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-[13px] font-bold text-gray-800 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-lg">🌧️</span> Heavy Rain
          </button>
          <button 
            onClick={() => handleMassSimulate('flood', 'Flood Alert')}
            disabled={simulating}
            className="bg-white border border-blue-100 hover:border-blue-300 p-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-[13px] font-bold text-gray-800 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-lg">🌊</span> Flood Alert
          </button>
          <button 
            onClick={() => handleMassSimulate('heat', 'Extreme Heat')}
            disabled={simulating}
            className="bg-white border border-orange-100 hover:border-orange-300 p-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-[13px] font-bold text-gray-800 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-lg">☀️</span> Extreme Heat
          </button>
          <button 
            onClick={() => handleMassSimulate('aqi', 'AQI Hazardous')}
            disabled={simulating}
            className="bg-white border border-gray-200 hover:border-gray-400 p-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-[13px] font-bold text-gray-800 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-lg">😷</span> AQI Hazardous
          </button>
        </div>
        <button 
          onClick={() => handleMassSimulate('closure', 'Zone Closure')}
          disabled={simulating}
          className="w-full bg-white border border-red-100 hover:border-red-300 p-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-[13px] font-bold text-gray-800 disabled:opacity-50 cursor-pointer"
        >
          <span className="text-lg">🚧</span> Curfew / Zone Closure
        </button>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
           <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Loss Ratio (Weekly)</div>
           <div className="h-24 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={lossData}>
                 <defs>
                   <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="ratio" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRatio)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
           <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Fraud vs Genuine</div>
           <div className="h-24 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={fraudData}>
                 <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                 <Bar dataKey="count" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="text-[14px] font-bold text-gray-900 mb-3 ml-1">AI Fraud Scenario Testing</div>
      <div className="space-y-3 mb-5">
        <div 
          onClick={() => simulateFraudCase('normal')}
          className={`p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-between transition-all ${simulating ? 'opacity-50' : 'active:scale-95 cursor-pointer hover:border-[#1E3A8A]'}`}
        >
          <div>
            <div className="font-bold text-[14px] text-gray-800">1. Normal User Check</div>
            <div className="text-[11px] text-gray-500">Low risk -&gt; Instant Payout</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M5 12l5 5L20 7"/></svg>
          </div>
        </div>

        <div 
          onClick={() => simulateFraudCase('gps_spoof')}
          className={`p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-between transition-all ${simulating ? 'opacity-50' : 'active:scale-95 cursor-pointer hover:border-[#EF4444]'}`}
        >
          <div>
            <div className="font-bold text-[14px] text-gray-800">2. GPS Spoofing Attack</div>
            <div className="text-[11px] text-gray-500">High mismatch -&gt; Flagged Fraud</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
        </div>

        <div 
          onClick={() => simulateFraudCase('repeated')}
          className={`p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-between transition-all ${simulating ? 'opacity-50' : 'active:scale-95 cursor-pointer hover:border-[#EA580C]'}`}
        >
          <div>
            <div className="font-bold text-[14px] text-gray-800">3. Repeated Claims Pattern</div>
            <div className="text-[11px] text-gray-500">Medium risk -&gt; Delayed for review</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[20px] p-4 shadow-xl mb-4">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>Real-time Risk Log</span>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
        <div className="space-y-2 h-36 overflow-y-auto font-mono scrollbar-hide">
          {logs.length === 0 ? (
            <div className="text-[11px] text-gray-500 italic py-2">System initialized. Waiting for events...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 border-b border-white/5 last:border-0 pb-1.5 last:pb-0 font-medium">
                <span style={{ color: log.dot }}>&gt;</span>
                <span className="text-[11px] text-gray-300 leading-tight flex-1">{log.text}</span>
                <span className="text-[9px] text-gray-600 mt-0.5">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[14px] font-bold text-gray-900 mb-3 ml-1">Recent Payouts</div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 px-1 text-[11px] font-bold text-gray-400 uppercase">Worker</th>
                <th className="py-2 px-1 text-[11px] font-bold text-gray-400 uppercase">Amount</th>
                <th className="py-2 px-1 text-[11px] font-bold text-gray-400 uppercase">Risk</th>
                <th className="py-2 px-1 text-[11px] font-bold text-gray-400 uppercase">Pay ID</th>
                <th className="py-2 px-1 text-[11px] font-bold text-gray-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400 text-[11px]">No payouts yet.</td>
                </tr>
              ) : (
                recentPayouts.map((p, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-1 text-[12px] font-medium text-gray-800">{p.worker_name}</td>
                    <td className="py-2 px-1 text-[12px] font-bold text-green-600">₹{p.claim_amount}</td>
                    <td className="py-2 px-1 text-[12px] text-gray-500">{p.risk_score}</td>
                    <td className="py-2 px-1 text-[11px] text-blue-600 font-mono">{p.payment_id}</td>
                    <td className="py-2 px-1 text-[11px] text-gray-400">
                      {new Date(p.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
