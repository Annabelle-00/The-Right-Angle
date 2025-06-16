import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bluetooth, Activity, BarChart3, PlayCircle, ListChecks, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = ({ handleConnectDevice, isConnected, romValue, strengthValue, recommendations }) => {
  const navigate = useNavigate();
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  useEffect(() => {
    document.title = "The Right Angle - Home";
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div 
        className="w-full max-w-5xl mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-blue-200 dark:border-blue-700">
          <CardHeader className="items-center">
            <CardTitle>Device Control & Measurement</CardTitle>
            <CardDescription>Connect to your Right Angle device and start your measurement session or learn more.</CardDescription>
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
          <CardFooter className="text-center justify-center pt-4">
            <p className={`text-sm ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Device Status: {isConnected ? 'Connected' : 'Disconnected (Simulated)'}
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="section-gradient dark:section-gradient shadow-lg h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center">
                <Activity className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                <CardTitle>Range of Motion (ROM)</CardTitle>
              </div>
              <CardDescription>Last recorded ROM measurement.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {romValue !== null ? (
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">{romValue}°</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No data yet. Complete a measurement.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="section-gradient dark:section-gradient shadow-lg h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center">
                <BarChart3 className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                <CardTitle>Strength Test</CardTitle>
              </div>
              <CardDescription>Last recorded strength test value.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {strengthValue !== null ? (
                <p className="text-5xl font-bold text-green-700 dark:text-green-300">{strengthValue} <span className="text-xl">units</span></p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No data yet. Complete a measurement.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="section-gradient dark:section-gradient shadow-lg h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center">
                <ListChecks className="mr-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                <CardTitle>Exercise Recommendations</CardTitle>
              </div>
              <CardDescription>Personalized exercises based on your data.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
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
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">Recommendations will appear here after measurement.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="md:col-span-2 lg:col-span-3">
            <Card className="bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-600 dark:to-indigo-700 shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full flex flex-col" onClick={() => navigate('/learn/arthritis')}>
                <CardHeader className="flex-row items-center justify-between">
                    <div className="flex items-center">
                        <BookOpen className="mr-3 h-8 w-8 text-white" />
                        <CardTitle><span className="text-white">Learn About Joint Stiffness & Arthritis</span></CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription className="text-sky-100 dark:text-sky-200">Understand the causes, symptoms, and impact of joint stiffness and various forms of arthritis.</CardDescription>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" className="text-white border-white hover:bg-white/20 w-full sm:w-auto">
                        Read More
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;