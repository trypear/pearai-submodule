import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Gift, Sparkles, Code2, Star, Timer, Hash, GitBranch, Code, TreePine, Snowflake, Candy } from "lucide-react";
import { motion } from "framer-motion";

const YEAR = 2024;

const CAROUSEL_ITEMS = [
  `Developer Wrapped ${YEAR}`,
  "How many lines of code did you write this year?",
  "Total commits you made?",
  <div className="flex flex-col items-center justify-center">
    <div >
      Top language you coded in?
    </div>
    <div className="text-sm mt-3">
      find out in your wrapped.
    </div>
  </div>,
  "Discover your year in code."
];

const handleSubmit = (username) => {
  if (username) {
    // Create a reference to the anchor element
    const linkElement = document.getElementById('wrapped-link');
    if (linkElement) {
      (linkElement as HTMLAnchorElement).click();
    }
  }
};

const base64Username = (username: string): string => {
  // Basic obfuscation using base64
  return btoa(username);
};

export default function PearAIWrappedGUI() {
  const [username, setUsername] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-primary">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="hidden lg:block">
          <div className="absolute top-[13%] left-[12%] opacity-5">
            <TreePine className="w-16 h-16" />
          </div>
          <div className="absolute top-[12%] right-[18%] opacity-5">
            <Github className="w-14 h-14" />
          </div>
          
          {/* <motion.div
            className="absolute top-[22%] right-[72%] opacity-5"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="w-12 h-12" />
          </motion.div> */}
          <motion.div
            className="absolute top-[36%] left-[4%] opacity-5"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="w-14 h-14" />
          </motion.div>
          <motion.div
            className="absolute top-[16%] left-[58%] opacity-5"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Timer className="w-20 h-20" />
          </motion.div>
          
          <motion.div
            className="absolute top-[45%] left-[15%] opacity-5"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Code2 className="w-24 h-24" />
          </motion.div>
          <div className="absolute top-[37%] right-[6%] opacity-5">
            <Hash className="w-16 h-16" />
          </div>
          
          <motion.div
            className="absolute top-[20%] left-[38%] opacity-5"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Github className="w-12 h-12" />
          </motion.div>
          <motion.div
            className="absolute top-[30%] right-[20%] opacity-5"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Code2 className="w-16 h-16" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[12%] left-[8%] opacity-5"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-28 h-28" />
          </motion.div>
          {/* <motion.div
            className="absolute bottom-[38%] right-[10%] opacity-5"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="w-26 h-26" />
          </motion.div> */}
          
          <motion.div
            className="absolute bottom-[9%] left-[62%] opacity-5"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Hash className="w-20 h-20" />
          </motion.div>
          <motion.div
            className="absolute bottom-[33%] right-[64%] opacity-5"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <GitBranch className="w-24 h-24" />
          </motion.div>
          
          <div className="absolute bottom-[6%] left-[32%] opacity-5">
            <GitBranch className="w-24 h-24" />
          </div>
          <motion.div
            className="absolute bottom-[27%] right-[22%] opacity-5"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <TreePine className="w-20 h-20" />
          </motion.div>
          <motion.div
            className="absolute bottom-[13%] right-[10%] opacity-5"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Gift className="w-24 h-24" />
          </motion.div>
          <motion.div
            className="absolute bottom-[6%] right-[44%] opacity-5"
            animate={{ y: [0, 25, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Code className="w-14 h-14" />
          </motion.div>
          
          <motion.div
            className="absolute top-[8%] right-[28%] opacity-5"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Snowflake className="w-16 h-16" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[65%] left-[20%] opacity-5"
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Candy className="w-20 h-20" />
          </motion.div>
          <motion.div
            className="absolute bottom-[18%] left-[45%] opacity-5"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Snowflake className="w-24 h-24" />
          </motion.div>
          <motion.div
            className="absolute bottom-[34%] right-[10%] opacity-5"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Snowflake className="w-16 h-16" />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 md:gap-6 z-10">
        <div className="text-center space-y-2 w-full max-w-[600px] px-4 md:px-0">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center h-[200px] w-full overflow-hidden">
              <motion.div
                key={currentIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeInOut"
                }}
                className="text-3xl md:text-4xl lg:text-6xl font-bold text-primary break-words"
              >
                {CAROUSEL_ITEMS[currentIndex]}
              </motion.div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {CAROUSEL_ITEMS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-1.5 md:w-2 rounded-full transition-colors duration-300 ${index === currentIndex ? 'bg-teal-200' : 'bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full max-w-[600px] px-4">
          <Card className="p-3 md:p-4 lg:p-6 bg-input hover:bg-input/90 transition-colors">
            <div className="flex flex-col gap-3 md:gap-4 lg:gap-6">
              <div className="flex flex-col items-center gap-2 md:gap-3 lg:gap-4">
                <div className="flex items-center justify-center bg-muted rounded-lg p-2 md:p-3">
                  <Gift className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-button-foreground" />
                  <div className="text-base md:text-lg lg:text-xl mx-2 md:mx-3 font-bold text-button-foreground text-center">Create Your Developer Wrapped {YEAR}</div>
                  <Gift className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-button-foreground" />
                </div>
                <div className="w-full">
                  <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
                    <input
                      type="text"
                      placeholder=" Enter your Github username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => {
                        console.dir("HIHI")
                        console.dir(e.key)
                        console.dir(username)
                        if (e.key === 'Enter' && username) {
                          handleSubmit(username);
                        }
                      }}
                      className="rounded-lg border-none text-foreground bg-background p-2 md:p-3 lg:p-4 text-sm focus:outline-none placeholder:opacity-50"
                    />
                    <a
                      id="wrapped-link"
                      href={`https://developerwrapped.com/${base64Username(username)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${!username ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <Button
                        variant="default"
                        className="w-full whitespace-nowrap bg-button hover:bg-button-hover text-button-foreground cursor-pointer text-sm md:text-base"
                        disabled={!username}
                      >
                        Create
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
