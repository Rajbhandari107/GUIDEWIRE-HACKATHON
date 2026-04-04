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
    setUser(null);
    setPolicy(null);
    setIsProfileOpen(false);
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

  const currentScreen = (!policy && activeScreen !== 'ADMIN') ? 'POLICY' : activeScreen;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <DashboardScreen 
          user={user} 
          policy={policy} 
          onOpenProfile={() => setIsProfileOpen(true)} 
        />;
      case 'POLICY':
        return <PolicyScreen user={user} onPurchase={handlePurchase} />;
      case 'CLAIMS':
        return <ClaimsScreen user={user} />;
      case 'ADMIN':
        return <AdminScreen user={user} onRefresh={handleRefresh} />;
      default:
        return <DashboardScreen user={user} policy={policy} />;
    }
  };

  return (
    <MobileContainer>
       <div className="flex flex-col h-full bg-[#F3F4F6]">
        <div className="flex-1 overflow-hidden">
          {renderScreen()}
        </div>
        <BottomNav 
          activeScreen={currentScreen} 
          setScreen={setActiveScreen} 
        />
        
        <ProfileSheet 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          onLogout={handleLogout}
          user={user}
        />
      </div>
    </MobileContainer>
  );
};

export default App;
