import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function StepCard({ icon, title, description, children }: StepCardProps) {
  return (
    <Card className="p-6 bg-input hover:bg-input/90 hover:cursor-pointer transition-colors mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-button-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </Card>
  );
}

export default function PearAIWrappedGUI() {
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col h-full bg-primary p-8 gap-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-3xl font-bold text-primary sm:text-4xl">
            Developer Wrapped
          {/* <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
            <Sparkles className="h-7 w-7 text-teal-400" />
            </motion.div> */}
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

      <div className="flex flex-col gap-6">
        <StepCard
          icon={<Gift className="w-8 h-8 text-button-foreground" />}
          title="Generate Your Year in Code"
          description="Get a beautiful visualization of your coding achievements, languages, and contributions throughout the year"
        >
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Enter your github username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 text-foreground bg-background placeholder:text-muted-foreground"
            />
            <a
              href={`https://developerwrapped.com/create?user=${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${!username ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Button
                variant="default"
                className="w-full sm:w-auto whitespace-nowrap bg-button hover:bg-button-hover text-button-foreground"
                disabled={!username}
              >
                Create My Wrapped
              </Button>
            </a>
          </div>
        </StepCard>
      </div>
    </div>
  );
}
