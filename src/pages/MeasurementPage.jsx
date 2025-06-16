import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, PlayCircle, StopCircle, CheckCircle, Zap, Activity, Repeat, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRecommendations } from '@/components/lib/utils';


const MeasurementPage = ({ updateResults }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(3);
  const [strengthTestActive, setStrengthTestActive] = useState(false);
  const [showStartStrengthButton, setShowStartStrengthButton] = useState(false);

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
      setShowStartStrengthButton(false);
      setStep(4); 
      toast({ title: "Strength Test Complete", description: "Unlock the brace and continue ROM.", variant: "success" });
    }
    return () => clearInterval(interval);
  }, [strengthTestActive, timer, toast]);

  const handleNextStep = () => {
    if (step === 2) { 
      setStep(3); 
      setShowStartStrengthButton(true);
    } else if (step < 5) {
      setStep(prev => prev + 1);
    }
  };

  const startStrengthTestCountdown = () => {
    setStrengthTestActive(true);
    setShowStartStrengthButton(false);
    setTimer(3); 
    toast({ title: "Strength Test Started!", description: "Maintain pressure."});
  }

  const handleEndTest = () => {
    const finalRom = Math.floor(Math.random() * 90) + 90; 
    const finalStrength = Math.floor(Math.random() * 70) + 30; 
    const finalRecommendations = [
      `Based on ROM (${finalRom}°) and Strength (${finalStrength} pounds):`,
      "Perform gentle active-assisted ROM exercises twice daily.",
      "Isometric strengthening for 10-second holds, 10 repetitions.",
      "Consider applying heat pack before exercises."
    ];
    updateResults(finalRom, finalStrength, finalRecommendations);
    toast({
      title: "Test Ended!",
      description: "Your results are now available on the home page.",
      variant: "success",
      duration: 5000,
    });
    navigate('/');
  };

  const instructions = [
    { title: "Step 1: Preparation", text: "Start with your arm fully extended. Ensure the device is securely and comfortably fitted.", icon: <PlayCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" /> },
    { title: "Step 2: Initial ROM", text: "Slowly start bending your arm. Continue until you reach approximately a 110-degree angle, then click 'Reached 110 Degrees'.", icon: <Activity className="w-12 h-12 text-blue-500 dark:text-blue-400" /> },
    { title: "Step 3: Strength Test Setup", text: "You've reached 110 degrees. Lock the brace. When ready, press 'Start Strength Test' and PUSH against the brace.", icon: <Zap className="w-12 h-12 text-orange-500 dark:text-orange-400" /> },
    { title: "Step 4: Continue ROM", text: "Strength test complete! Unlock the brace. Continue bending your arm as far as you comfortably can to complete the Range of Motion measurement.", icon: <Repeat className="w-12 h-12 text-blue-500 dark:text-blue-400" /> },
    { title: "Step 5: End Test", text: "When you are unable to bend your arm any further, press the 'End Test' button.", icon: <StopCircle className="w-12 h-12 text-red-500 dark:text-red-400" /> }
  ];

  const currentInstruction = instructions[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-900 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-blue-300 dark:border-blue-600">
          <CardHeader className="items-center relative">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="absolute top-4 left-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </motion.div>
            <CardTitle className="text-3xl sm:text-4xl pt-12 sm:pt-4">{currentInstruction.title}</CardTitle>
            <CardDescription className="text-center text-base">Follow the instructions carefully for accurate results.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6 py-8">
            <motion.div 
              key={step + (strengthTestActive ? '-active' : '')} 
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
            {step === 1 && (
              <Button onClick={handleNextStep} size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold">
                Start Bending Arm <ChevronsRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleNextStep} size="lg" className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold">
                Reached 110 Degrees <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
            )}
            {step === 3 && showStartStrengthButton && (
              <Button onClick={startStrengthTestCountdown} size="lg" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold">
                Start Strength Test <Zap className="ml-2 h-5 w-5" />
              </Button>
            )}
            {step === 3 && strengthTestActive && (
              <Button disabled size="lg" className="bg-gray-400 text-white font-semibold">
                Hold... ({timer}s)
              </Button>
            )}
            {step === 4 && (
               <Button onClick={handleNextStep} size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold">
                Continue ROM Measurement <ChevronsRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            {step === 5 && (
              <Button onClick={handleEndTest} size="lg" className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold">
                End Test <StopCircle className="ml-2 h-5 w-5" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default MeasurementPage;
