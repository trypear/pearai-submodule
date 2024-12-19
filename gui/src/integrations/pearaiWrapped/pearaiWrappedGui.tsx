import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Gift, Sparkles, Code2, Star, Timer, Hash, GitBranch, Code } from "lucide-react";
import { motion } from "framer-motion";

const YEAR = 2024;

const CAROUSEL_ITEMS = [
  `${YEAR} DEVELOPER WRAPPED`,
  "How many lines of code did you write ?",
  "Total Commits made by you ?",
  <div className="flex flex-col items-center justify-center">
    <div >
      Top Language you coded in ?
    </div>
    <div className="text-sm mt-3">
      find out in your wrapped!
    </div>
  </div>,
  "Discover your coding journey through beautiful insights"
];

export default function PearAIWrappedGUI() {
  const [username, setUsername] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col justify-center items-center h-full bg-primary p-8 gap-6 mx-auto overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 opacity-5">
          <Code className="w-24 h-24" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-5">
          <GitBranch className="w-20 h-20" />
        </div>
        <div className="absolute top-1/2 right-20 opacity-5">
          <Hash className="w-16 h-16" />
        </div>
        <div className="absolute bottom-1/4 left-20 opacity-5">
          <Code2 className="w-16 h-16" />
        </div>
        <div className="absolute top-20 right-24 opacity-5">
          <Github className="w-16 h-16" />
        </div>
        <motion.div
          className="absolute top-1/4 right-1/4 opacity-5"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-12 h-12" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/3 opacity-5"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-14 h-14" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-1/4 opacity-5"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Timer className="w-10 h-10" />
        </motion.div>
        <div className="absolute bottom-20 left-1/2 opacity-5">
          <Gift className="w-18 h-18" />
        </div>
        <motion.div
          className="absolute top-1/2 left-20 opacity-5"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Code2 className="w-14 h-14" />
        </motion.div>
      </div>

      <div className="text-center space-y-2 w-[600px] relative z-10">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center justify-center h-[100px] w-full overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ 
                duration: 0.7,
                ease: "easeInOut"
              }}
              className="text-6xl font-bold text-primary sm:text-4xl break-words"
            >
              {CAROUSEL_ITEMS[currentIndex]}
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {CAROUSEL_ITEMS.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                index === currentIndex ? 'bg-teal-200' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
        {/* <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          <p className="text-muted-foreground text-lg mx-4"> Discover your coding journey through beautiful insights</p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
        </div> */}
      </div>

      <div className="w-[600px] relative z-10">
        <Card className="p-6 bg-input hover:bg-input/90 transition-colors">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center bg-muted rounded-lg">
                <Gift className="w-8 h-8 text-button-foreground" />
                <div className="text-xl mx-3 font-bold text-button-foreground">Generate Your {YEAR} in Code</div>
                <Gift className="w-8 h-8 text-button-foreground" />
              </div>
              {/* <div className="grid gap-2 my-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center rounded-lg bg-background p-3 px-8">
                    <Code2 className="mb-1 h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Languages</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-background p-3">
                    <Timer className="mb-1 h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Code Time</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-background p-3">
                    <Star className="mb-1 h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Top Repos</span>
                  </div>
                </div>
              </div> */}
              <div className="w-full">
                {/* <p className="text-sm text-muted-foreground">Get a beautiful visualization of your coding achievements, languages, and contributions throughout the year</p> */}
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Enter your github username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-lg border-none text-foreground bg-background p-4 text-sm"
                  />
                  <a
                    href={`https://developerwrapped.com/create?user=${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${!username ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <Button
                      variant="default"
                      className="w-full whitespace-nowrap bg-button hover:bg-button-hover text-button-foreground cursor-pointer"
                      disabled={!username}
                    >
                      Create My Wrapped
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
