import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Gift, Sparkles, Code2, Star, Timer } from "lucide-react";
import { motion } from "framer-motion";

const YEAR = 2024;

export default function PearAIWrappedGUI() {
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col justify-center h-full bg-primary p-8 gap-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-3xl font-bold text-primary sm:text-4xl">
            {YEAR} Developer Wrapped
          </div>
        </div>
        <div className="flex items-center justify-center">
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
        </div>
      </div>

      <div className="">
        <Card className="p-6 bg-input hover:bg-input/90 transition-colors mx-auto">
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
