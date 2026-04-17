import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../config';


interface User {
  id: number;
  name: string;
  location: string;
  avg_daily_income: number;
}

interface Policy {
  id: number;
  plan_name: string;
  current_premium: number;
  coverage: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface Claim {
  id: number;
  trigger_type: string;
  amount: number;
  status: string;
  fraud_score: number;
  risk_level: string;
  created_at: string;
  paid_at?: string;
}

interface DashboardScreenProps {
  user: User;
  policy: Policy;
  onOpenProfile: () => void;
}

interface WeatherData {
  city: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  rainfall_mm: number;
  wind_speed: number;
  condition: string;
  description: string;
  aqi: number;
  source: string;
}

const CONDITION_EMOJI: Record<string, string> = {
  Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️',
  Clear: '☀️', Clouds: '⛅', Haze: '🌫️',
  Mist: '🌫️', Fog: '🌫️', Snow: '❄️',
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, policy, onOpenProfile }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchClaims();
    const claimInterval = setInterval(fetchClaims, 3000);
    return () => clearInterval(claimInterval);
  }, []);

  useEffect(() => {
    fetchWeather();
    const wxInterval = setInterval(fetchWeather, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(wxInterval);
  }, [user.location]);

  const fetchClaims = async () => {
    try {
      const response = await axios.get(`${API_BASE}/policies/claims/${user.id}`);
      setClaims(response.data);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    }
  };

  const fetchWeather = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/policies/weather/${encodeURIComponent(user.location)}`);
      setWeather(resp.data);
    } catch (err) {
      console.error('Weather fetch failed:', err);
    }
  };

  const getWeatherRisk = (w: WeatherData) => {
    if (w.rainfall_mm > 30 || w.temperature > 42 || w.aqi > 300)
      return { level: 'High', color: '#EF4444', bg: '#FEE2E2' };
    if (w.rainfall_mm > 15 || w.temperature > 38 || w.aqi > 200)
      return { level: 'Medium', color: '#F59E0B', bg: '#FEF3C7' };
    return { level: 'Low', color: '#22C55E', bg: '#DCFCE7' };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!policy) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse" />
        <div className="text-gray-400 text-sm">Loading coverage...</div>
      </div>
    );
  }

  const activeClaimsCount = claims.filter(c => ['pending', 'approved', 'delayed'].includes(c.status)).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[22px] font-bold text-gray-900">Hi {user.name.split(' ')[0]} 👋</div>
        <div 
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-sm font-semibold text-white cursor-pointer active:scale-95 transition-transform"
        >
          {getInitials(user.name)}
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#166534] text-xs font-medium px-3.5 py-1.5 rounded-full mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        Protected This Week
      </div>

      <div className="bg-[#1E3A8A] rounded-[28px] p-7 mb-6 relative overflow-hidden shadow-2xl shadow-blue-900/40 min-h-[200px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[14px] font-bold text-blue-100 uppercase tracking-widest">Weekly Coverage</span>
            <div className="bg-green-500/20 border border-green-500/30 text-[#4ADE80] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-tighter">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              Active
            </div>
          </div>
          <div className="text-[44px] font-black text-white leading-none tracking-tighter mb-2">₹{policy.coverage}</div>
          <div className="text-[14px] text-blue-200/70 font-medium">Total income protection active</div>
        </div>

        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center gap-6">
           <div className="flex-1">
             <div className="text-[10px] text-blue-200/50 font-bold mb-1 uppercase tracking-wider">Daily Income</div>
             <div className="text-[16px] text-white font-black tracking-tight">₹{user.avg_daily_income}</div>
           </div>
           <div className="w-[1px] h-8 bg-white/10" />
           <div className="flex-1">
             <div className="text-[10px] text-blue-200/50 font-bold mb-1 uppercase tracking-wider">Est. Payout</div>
             <div className="text-[16px] text-white font-black tracking-tight">₹{Math.round(user.avg_daily_income * 0.6)}/day</div>
           </div>
        </div>
      </div>

      {/* ── Coverage Calendar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-bold text-gray-900">
            Protected until: {policy.end_date ? new Date(policy.end_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/20"></div><span className="text-[10px] text-gray-500 font-bold uppercase">Active</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"></div><span className="text-[10px] text-gray-500 font-bold uppercase">Payout</span></div>
            </div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-500/30"></div><span className="text-[10px] text-gray-500 font-bold uppercase">Due</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-[11px] font-bold text-center text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {(() => {
            const todayDate = new Date();
            const year = todayDate.getFullYear();
            const month = todayDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayIndex = new Date(year, month, 1).getDay();
            
            const startD = new Date(policy.start_date);
            const endD = new Date(policy.end_date);
            
            // Collect days that have a paid claim
            const paidDays = new Set(
              claims
                .filter(c => c.status === 'paid' && c.paid_at)
                .map(c => new Date(c.paid_at!).getDate())
            );

            const cells = [];
            
            // Empty slots for previous month days
            for (let i = 0; i < firstDayIndex; i++) {
              cells.push(<div key={`empty-${i}`} className="h-8 w-full flex items-center justify-center opacity-0" />);
            }
            
            for (let i = 1; i <= daysInMonth; i++) {
              const cellDate = new Date(year, month, i);
              const isToday = i === todayDate.getDate();
              
              const dTime = new Date(cellDate.toDateString()).getTime();
              const sTime = new Date(startD.toDateString()).getTime();
              const eTime = new Date(endD.toDateString()).getTime();
              
              let isActive = dTime >= sTime && dTime <= eTime;
              let isDue = isActive && dTime === eTime; 
              let isPaidOut = paidDays.has(i);
              
              let bgClass = "bg-gray-50 text-gray-400 border border-gray-100"; // Inactive
              
              if (isPaidOut) {
                bgClass = "bg-[#3B82F6] text-white shadow-md shadow-blue-500/30 border border-blue-600";
              } else if (isDue) {
                bgClass = "bg-[#F97316] text-white shadow-md shadow-orange-500/30 border border-orange-600";
              } else if (isActive) {
                bgClass = "bg-[#22C55E] text-white shadow-md shadow-green-500/20 border border-green-600";
              }
              
              if (isToday) {
                bgClass += " ring-2 ring-blue-900 ring-offset-1";
              }

              cells.push(
                <div 
                  key={i} 
                  className={`h-8 w-full rounded-[8px] flex items-center justify-center text-[12px] font-bold transition-all ${bgClass}`}
                >
                  {i}
                </div>
              );
            }
            return cells;
          })()}
        </div>
      </div>

      {/* ── Live Weather Card ─────────────────────────────────────────── */}
      {weather && (() => {
        const risk = getWeatherRisk(weather);
        const emoji = CONDITION_EMOJI[weather.condition] ?? '🌡️';
        return (
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 mb-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {weather.city} Weather {emoji}
                </div>
                <div className="text-[20px] font-extrabold text-gray-900 leading-tight">
                  {weather.temperature}°C{' '}
                  <span className="text-[13px] font-medium text-gray-500">{weather.condition}</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap gap-x-3">
                  <span>💧 {weather.humidity}%</span>
                  <span>💨 {weather.wind_speed} m/s</span>
                  {weather.rainfall_mm > 0 && <span>🌧️ {weather.rainfall_mm}mm</span>}
                  <span>AQI {weather.aqi}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                <div
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: risk.bg, color: risk.color }}
                >
                  Risk: {risk.level}
                </div>
                <div
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                    weather.source === 'openweather'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {weather.source === 'openweather' ? '● Live' : '○ Fallback'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex gap-2.5 mb-5">
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#1E3A8A" strokeWidth="1.8"><path d="M10 2v16M6 6h6a2 2 0 010 4H6M6 10h7a2 2 0 010 4H6"/></svg>
          </div>
          <div className="text-[10px] text-gray-500 mb-0.5">Weekly Premium</div>
          <div className="text-base font-bold text-gray-900">₹{policy.current_premium}</div>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-yellow-100/50 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#92400E" strokeWidth="1.8"><path d="M9 12H5l7-10v8h4l-7 10z"/></svg>
          </div>
          <div className="text-[10px] text-gray-500 mb-0.5">Active Claims</div>
          <div className="text-base font-bold text-[#92400E]">{activeClaimsCount}</div>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#166534" strokeWidth="1.8"><path d="M3 10a7 7 0 1014 0A7 7 0 003 10z"/><path d="M7 10l2 2 4-4"/></svg>
          </div>
          <div className="text-[10px] text-gray-500 mb-0.5">Coverage</div>
          <div className="text-base font-bold text-[#166534]">₹{policy.coverage}</div>
        </div>
      </div>

      {/* ── Peak Volatility Insight Card (DYNAMIC) ────────────────────────── */}
      {(() => {
        const hour = new Date().getHours();
        let band = "Off Peak";
        let range = "10 AM – 4 PM";
        let mult = "0.8x";
        let color = "blue";

        if (6 <= hour && hour < 10) { band="Morning Rush"; range="6 AM – 10 AM"; mult="1.3x"; color="indigo"; }
        else if (16 <= hour && hour < 22) { band="Prime Rush"; range="4 PM – 10 PM"; mult="1.6x"; color="orange"; }
        else if (22 <= hour || hour < 1) { band="Late Peak"; range="10 PM – 1 AM"; mult="1.2x"; color="indigo"; }
        else if (1 <= hour && hour < 6) { band="Low Activity"; range="1 AM – 6 AM"; mult="0.6x"; color="gray"; }

        return (
          <div className={`bg-gradient-to-br from-${color}-50 to-white rounded-2xl p-4 shadow-sm border border-${color}-100 mb-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="relative z-10">
              <div className={`text-[10px] font-extrabold text-${color}-600 uppercase tracking-widest mb-1`}>{band} Today</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[18px] font-black text-gray-900">{range}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[12px] font-bold text-green-700">Protected Coverage Active</span>
                  </div>
                </div>
                <div className={`bg-${color}-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm shadow-${color}-200`}>{mult} Payout</div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="text-base font-semibold text-gray-900 mb-3">Recent Activity</div>
      <div className="space-y-2 pb-4">
        {claims.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">No recent activity</div>
        ) : (
          claims.slice(0, 3).map((claim, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-50">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${claim.status === 'paid' ? 'bg-blue-50' : claim.status === 'flagged_fraud' ? 'bg-red-50' : 'bg-orange-50'}`}>
                 {claim.status === 'paid' ? (
                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#1E3A8A" strokeWidth="1.8"><path d="M10 2v16M6 6h6a2 2 0 010 4H6M6 10h7a2 2 0 010 4H6"/></svg>
                 ) : claim.status === 'flagged_fraud' ? (
                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EF4444" strokeWidth="1.8"><path d="M10 2l8 16H2L10 2z"/><path d="M10 8v4m0 4h.01"/></svg>
                 ) : (
                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EA580C" strokeWidth="1.8"><circle cx="10" cy="10" r="8"/><polyline points="10 6 10 10 13 13"/></svg>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-900 truncate flex items-center justify-between">
                  <span>
                    {claim.status === 'paid' && `Payout Completed (₹${claim.amount})`}
                    {claim.status === 'flagged_fraud' && `Fraud Block: ${claim.trigger_type.replace('_', ' ')}`}
                    {claim.status === 'delayed' && `Under Review: ${claim.trigger_type.replace('_', ' ')}`}
                    {!['paid','flagged_fraud','delayed'].includes(claim.status) && `${claim.trigger_type.replace('_', ' ')} detected`}
                  </span>
                  {claim.status === 'paid' && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">PAID</span>}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 flex gap-2 items-center">
                  <span>{new Date(claim.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
                  {claim.risk_level && (
                    <>
                      <span>•</span>
                      <span className={`uppercase text-[9px] font-bold px-1.5 rounded-sm ${claim.risk_level === 'low' ? 'bg-green-100 text-green-700' : claim.risk_level === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        RISK: {claim.risk_level} ({claim.fraud_score})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
