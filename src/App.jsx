
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Bluetooth, Activity, BarChart3, Zap, Moon, Sun, ArrowLeft, PlayCircle, StopCircle, CheckCircle, AlertTriangle, ListChecks, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = ({ isDarkMode, toggleDarkMode, handleConnectDevice, simulateDataFetch, isConnected, romValue, strengthValue, recommendations }) => {
  const navigate = useNavigate();
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  useEffect(() => {
    document.title = "The Right Angle - Home";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 dark:from-slate-900 dark:to-blue-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-8 transition-colors duration-300">
      <header className="w-full max-w-5xl mb-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "circOut" }}
          className="absolute top-0 right-0 m-4"
        >
          <Button variant="outline" size="icon" onClick={toggleDarkMode} className="bg-opacity-50 backdrop-blur-md">
            {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </motion.div>
        <motion.h1 
          className="text-5xl sm:text-6xl font-extrabold tracking-tight hero-gradient text-white py-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
        >
          The Right Angle
        </motion.h1>
        <motion.p 
          className="mt-2 text-lg sm:text-xl text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          Precision Measurement for Optimal Recovery
        </motion.p>
      </header>

      <motion.div 
        className="w-full max-w-5xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-blue-200 dark:border-blue-700">
          <CardHeader className="items-center">
            <CardTitle>Device Control & Measurement</CardTitle>
            <CardDescription>Connect to your Right Angle device and start your measurement session.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              onClick={handleConnectDevice} 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Bluetooth className="mr-2 h-5 w-5" /> Connect to Device
            </Button>
            <Button 
              onClick={() => navigate('/measure')}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Start Measurement
            </Button>
          </CardContent>
          <CardFooter className="text-center justify-center">
            <p className={`text-sm ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Device Status: {isConnected ? 'Connected' : 'Disconnected (Simulated)'}
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="section-gradient dark:section-gradient shadow-lg h-full">
            <CardHeader>
              <div className="flex items-center">
                <Activity className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                <CardTitle>Range of Motion (ROM)</CardTitle>
              </div>
              <CardDescription>Last recorded ROM measurement.</CardDescription>
            </CardHeader>
            <CardContent>
              {romValue !== null ? (
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">{romValue}°</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No data yet. Complete a measurement.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="section-gradient dark:section-gradient shadow-lg h-full">
            <CardHeader>
              <div className="flex items-center">
                <BarChart3 className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                <CardTitle>Strength Test</CardTitle>
              </div>
              <CardDescription>Last recorded strength test value.</CardDescription>
            </CardHeader>
            <CardContent>
              {strengthValue !== null ? (
                <p className="text-5xl font-bold text-green-700 dark:text-green-300">{strengthValue} <span className="text-xl">units</span></p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No data yet. Complete a measurement.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="md:col-span-2 lg:col-span-1">
          <Card className="section-gradient dark:section-gradient shadow-lg h-full">
            <CardHeader>
              <div className="flex items-center">
                <ListChecks className="mr-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                <CardTitle>Exercise Recommendations</CardTitle>
              </div>
              <CardDescription>Personalized exercises based on your data.</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  {recommendations.map((rec, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">Recommendations will appear here after measurement.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.footer 
        className="w-full max-w-5xl mt-12 pt-8 border-t border-slate-300 dark:border-slate-700 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} The Right Angle. All rights reserved.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          Empowering recovery through innovative technology.
        </p>
      </motion.footer>
    </div>
  );
};

const MeasurementPage = ({ isDarkMode, toggleDarkMode, updateResults }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(3);
  const [strengthTestActive, setStrengthTestActive] = useState(false);

  useEffect(() => {
    document.title = "The Right Angle - Measurement";
  }, []);

  useEffect(() => {
    let interval;
    if (strengthTestActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (strengthTestActive && timer === 0) {
      setStrengthTestActive(false);
      setStep(4); // Move to next step after strength test
      toast({ title: "Strength Test Complete", description: "Unlock the brace and continue ROM." });
    }
    return () => clearInterval(interval);
  }, [strengthTestActive, timer, toast]);

  const handleNextStep = () => {
    if (step === 2) { // Reached 90 degrees
      setStep(3); // Lock brace and push
      setStrengthTestActive(true);
      setTimer(3); // Reset timer for strength test
    } else if (step < 5) {
      setStep(prev => prev + 1);
    }
  };

  const handleEndTest = () => {
    // Simulate data generation
    const finalRom = Math.floor(Math.random() * 90) + 90; // ROM between 90-180
    const finalStrength = Math.floor(Math.random() * 70) + 30; // Strength between 30-100
    const finalRecommendations = [
      `Based on ROM (${finalRom}°) and Strength (${finalStrength} units):`,
      "Perform gentle active-assisted ROM exercises twice daily.",
      "Isometric strengthening for 10-second holds, 10 repetitions.",
      "Consider applying heat pack before exercises."
    ];
    updateResults(finalRom, finalStrength, finalRecommendations);
    toast({
      title: "Test Ended!",
      description: "Your results are now available on the home page.",
      duration: 5000,
    });
    navigate('/');
  };

  const instructions = [
    { title: "Step 1: Preparation", text: "Start with your arm fully extended. Ensure the device is securely and comfortably fitted.", icon: <PlayCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" /> },
    { title: "Step 2: Initial ROM", text: "Slowly start bending your arm. Continue until you reach approximately a 90-degree angle.", icon: <Activity className="w-12 h-12 text-blue-500 dark:text-blue-400" /> },
    { title: "Step 3: Strength Test", text: `STOP at 90 degrees. Lock the brace. Now, PUSH against the brace as if trying to extend your arm. Hold for ${timer} seconds.`, icon: <Zap className="w-12 h-12 text-green-500 dark:text-green-400" /> },
    { title: "Step 4: Continue ROM", text: "Unlock the brace. Continue bending your arm as far as you comfortably can to complete the Range of Motion measurement.", icon: <Repeat className="w-12 h-12 text-blue-500 dark:text-blue-400" /> },
    { title: "Step 5: End Test", text: "When you are unable to bend your arm any further, press the 'End Test' button.", icon: <StopCircle className="w-12 h-12 text-red-500 dark:text-red-400" /> }
  ];

  const currentInstruction = instructions[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-900 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 m-4"
      >
        <Button variant="outline" size="icon" onClick={toggleDarkMode} className="bg-opacity-50 backdrop-blur-md">
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-blue-300 dark:border-blue-600">
          <CardHeader className="items-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="absolute top-4 left-4 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </motion.div>
            <CardTitle className="text-3xl sm:text-4xl mt-8 sm:mt-0">{currentInstruction.title}</CardTitle>
            <CardDescription className="text-center text-base">Follow the instructions carefully for accurate results.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6 py-8">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-800 rounded-full">
                {currentInstruction.icon}
              </div>
              <p className="text-lg sm:text-xl leading-relaxed text-slate-700 dark:text-slate-300 px-4">
                {currentInstruction.text}
              </p>
              {step === 3 && strengthTestActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-bold text-green-500 dark:text-green-400"
                >
                  {timer}
                </motion.div>
              )}
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            {step < 5 && step !== 3 && (
              <Button 
                onClick={handleNextStep}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Next Step <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
            )}
            {step === 3 && !strengthTestActive && (
               <Button 
                onClick={handleNextStep}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Continue ROM <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
            )}
             {step === 3 && strengthTestActive && (
              <Button 
                disabled
                size="lg"
                className="bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
              >
                Hold... ({timer}s)
              </Button>
            )}
            {step === 5 && (
              <Button 
                onClick={handleEndTest}
                size="lg"
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                End Test <StopCircle className="ml-2 h-5 w-5" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};


const App = () => {
  const { toast } = useToast();
  const [romValue, setRomValue] = useState(null);
  const [strengthValue, setStrengthValue] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isConnected, setIsConnected] = useState(false); // Simulating connection state
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleConnectDevice = () => {
    // Simulate connection toggle for UI feedback
    setIsConnected(prev => !prev); 
    toast({
      title: prevIsConnected => prevIsConnected ? "Device Disconnected" : "Device Connected (Simulated)",
      description: prevIsConnected => prevIsConnected ? "You have disconnected from The Right Angle." : "🚧 Bluetooth connection to Arduino is complex. This is a simulated connection. Full BLE functionality can be requested! 🚀",
      variant: "default",
      duration: 5000,
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
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              isDarkMode={isDarkMode} 
              toggleDarkMode={toggleDarkMode}
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
            <MeasurementPage 
              isDarkMode={isDarkMode} 
              toggleDarkMode={toggleDarkMode}
              updateResults={updateResults}
            />
          } 
        />
      </Routes>
    </>
  );
};

export default App;
  
