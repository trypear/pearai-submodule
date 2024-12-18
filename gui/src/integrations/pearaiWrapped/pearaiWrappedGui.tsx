import { useState } from "react";
import { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Sparkles } from "lucide-react";

interface StatusCardProps {
  title: string;
  description: string;
  showSparkles?: boolean;
  animate?: boolean;
}

function StatusCard({ title, description, showSparkles = false, animate = false }: StatusCardProps) {
  return (
    <Card className="p-16 bg-input hover:bg-input/90 transition-colors mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Github className={`w-16 h-16 ${animate ? 'animate-pulse' : ''}`} />
          {showSparkles && (
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
          {description}
        </p>
      </div>
    </Card>
  );
}

export default function PearAIWrappedGUI() {
  const [githubUsername, setGithubUsername] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const ideMessenger = useContext(IdeMessengerContext);

  const handleStarRepo = () => {
    window.open('https://github.com/PearAI/Continue', '_blank');
    setCurrentStep(2);
  };

  const handleGenerateWrapped = async () => {
    if (!githubUsername) return;
    
    try {
      setIsGenerating(true);
      // TODO: Implement the wrapped generation request
    //   await ideMessenger.request('pearaiWrapped/generate', {
    //     username: githubUsername
    //   });
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to generate PearAI Wrapped:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col items-start space-y-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold leading-none text-primary mb-2">
              PearAI Wrapped
              <Badge variant="outline" className="ml-2 text-xs relative -top-2 right-3">
                Beta
              </Badge>
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">Your 2023 Coding Journey</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center space-y-8 py-8">
          <div className="text-center">
            <StatusCard
              title="Step 1: Star Our Repository"
              description="Stars help us prevent spam and protect user privacy while maintaining access to PearAI Wrapped"
              showSparkles={currentStep >= 1}
            />
            <Button
              className="mt-6"
              onClick={handleStarRepo}
              variant={currentStep > 1 ? "outline" : "default"}
            >
              <Github className="mr-2 h-4 w-4" />
              {currentStep > 1 ? "Repository Starred" : "Star Repository"}
            </Button>
          </div>

          <div className="text-center">
            <StatusCard
              title="Step 2: Enter Your GitHub Username"
              description="Provide your GitHub username to generate your personalized wrapped"
              showSparkles={currentStep >= 2}
            />
            <div className="mt-6 flex flex-col items-center gap-4">
              <Input
                type="text"
                placeholder="GitHub Username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>

          <div className="text-center">
            <StatusCard
              title="Step 3: Generate Your Wrapped"
              description="Get ready to see your 2023 coding journey with PearAI!"
              showSparkles={currentStep >= 3}
              animate={isGenerating}
            />
            <Button
              className="mt-6"
              onClick={handleGenerateWrapped}
              disabled={!githubUsername || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate PearAI Wrapped"}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
