import React, { useState, useEffect } from 'react';
import { MobileContainer } from './components/MobileContainer';
import { RegistrationScreen } from './screens/RegistrationScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { PolicyScreen } from './screens/PolicyScreen';
import { ClaimsScreen } from './screens/ClaimsScreen';
import { AdminScreen } from './screens/AdminScreen';
import { BottomNav } from './components/BottomNav';
import { ProfileSheet } from './components/ProfileSheet';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

type Screen = 'HOME' | 'POLICY' | 'CLAIMS' | 'ADMIN';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>('HOME');
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // State-based admin mode toggle — no name-based detection
  const [adminEnabled, setAdminEnabled] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('giginsure_user');
    const savedPolicy = localStorage.getItem('giginsure_policy');
    
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      if (savedPolicy) {
        setPolicy(JSON.parse(savedPolicy));
        setActiveScreen('HOME');
      } else {
        checkActivePolicy(u.id);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        checkActivePolicy(user.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkActivePolicy = async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/policies/active/${userId}`);
      if (response.data) {
        setPolicy(response.data);
        localStorage.setItem('giginsure_policy', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error("No active policy found");
    }
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    localStorage.setItem('giginsure_user', JSON.stringify(userData));
    setActiveScreen('POLICY');
  };

  const handlePurchase = (policyData: any) => {
    setPolicy(policyData);
    localStorage.setItem('giginsure_policy', JSON.stringify(policyData));
    setActiveScreen('HOME');
  };

  const handleRefresh = () => {
    if (user) checkActivePolicy(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('giginsure_user');
    localStorage.removeItem('giginsure_policy');
    // Keep giginsure_last_phone so returning users get the quick sign-in banner
    setUser(null);
    setPolicy(null);
    setIsProfileOpen(false);
    setAdminEnabled(false);
    setActiveScreen('HOME');
  };

  const handleAdminEnabled = () => {
    setAdminEnabled(true);
    setIsProfileOpen(false);
    setActiveScreen('ADMIN');
  };

  const handleAdminDisabled = () => {
    setAdminEnabled(false);
    setActiveScreen('HOME');
  };

  if (loading) return null;

  if (!user) {
    return (
      <MobileContainer>
        <RegistrationScreen onRegister={handleRegister} />
      </MobileContainer>
    );
  }

  let currentScreen = (!policy && activeScreen !== 'ADMIN') ? 'POLICY' : activeScreen;
  // Guard: if admin tab is somehow active but mode was disabled, go home
  if (currentScreen === 'ADMIN' && !adminEnabled) {
    currentScreen = 'HOME';
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <DashboardScreen 
          user={user} 
          policy={policy} 
          onOpenProfile={() => setIsProfileOpen(true)} 
        />;
      case 'POLICY':
        return <PolicyScreen user={user} policy={policy} onPurchase={handlePurchase} />;
      case 'CLAIMS':
        return <ClaimsScreen user={user} />;
      case 'ADMIN':
        return <AdminScreen user={user} onRefresh={handleRefresh} onReturnHome={handleAdminDisabled} />;
      default:
        return <DashboardScreen user={user} policy={policy} />;
    }
  };

  return (
    <MobileContainer>
       <div className="flex flex-col h-full bg-[#F3F4F6]">
        <div className="flex-1 overflow-y-auto">
          {renderScreen()}
        </div>
        <BottomNav 
          activeScreen={currentScreen} 
          setScreen={setActiveScreen}
          adminEnabled={adminEnabled}
        />
        
        <ProfileSheet 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          onLogout={handleLogout}
          onAdminEnabled={handleAdminEnabled}
          onAdminDisabled={handleAdminDisabled}
          adminEnabled={adminEnabled}
          user={user}
        />
      </div>
    </MobileContainer>
  );
};

export default App;
