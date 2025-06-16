import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import HomePage from '@/pages/HomePage';
import MeasurementPage from '@/pages/MeasurementPage';
import ArthritisInfoPage from '@/pages/ArthritisInfoPage';
import { Layout } from '@/components/Layout';

const App = () => {
  const { toast } = useToast();
  const [romValue, setRomValue] = useState(
    () => JSON.parse(localStorage.getItem('romValue')) || null
  );
  const [strengthValue, setStrengthValue] = useState(
    () => JSON.parse(localStorage.getItem('strengthValue')) || null
  );
  const [recommendations, setRecommendations] = useState(
    () => JSON.parse(localStorage.getItem('recommendations')) || []
  );
  const [isConnected, setIsConnected] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  useEffect(() => {
    localStorage.setItem('romValue', JSON.stringify(romValue));
  }, [romValue]);

  useEffect(() => {
    localStorage.setItem('strengthValue', JSON.stringify(strengthValue));
  }, [strengthValue]);

  useEffect(() => {
    localStorage.setItem('recommendations', JSON.stringify(recommendations));
  }, [recommendations]);


  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleConnectDevice = () => {
    setIsConnected(prev => {
      const newConnectionState = !prev;
      toast({
        title: newConnectionState ? "Device Connected (Simulated)" : "Device Disconnected",
        description: newConnectionState ? "🚧 Bluetooth connection to Arduino is complex. This is a simulated connection. Full BLE functionality can be requested! 🚀" : "You have disconnected from The Right Angle.",
        variant: "default",
        duration: 5000,
      });
      return newConnectionState;
    });
  };
  
  const updateResults = (newRom, newStrength, newRecommendations) => {
    setRomValue(newRom);
    setStrengthValue(newStrength);
    setRecommendations(newRecommendations);
  };

  return (
    <>
      <Toaster />
      <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                handleConnectDevice={handleConnectDevice}
                isConnected={isConnected}
                romValue={romValue}
                strengthValue={strengthValue}
                recommendations={recommendations}
              />
            } 
          />
          <Route 
            path="/measure" 
            element={
              <MeasurementPage updateResults={updateResults} />
            } 
          />
          <Route
            path="/learn/arthritis"
            element={<ArthritisInfoPage />}
          />
        </Routes>
      </Layout>
    </>
  );
};

export default App;