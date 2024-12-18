import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Sparkles } from "lucide-react";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  stepNumber: number;
}

function StepCard({ icon, title, description, children, stepNumber }: StepCardProps) {
  return (
    <Card className="p-2 bg-input hover:bg-input/90 hover:cursor-pointer transition-colors mx-auto">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {stepNumber}
          </div>
          {icon}
        </div>
        <div className="w-1/3">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </Card>
  );
}

export default function PearAIWrappedGUI() {
  const [githubUsername, setGithubUsername] = useState("");
  const [hasStarred, setHasStarred] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ideMessenger = useContext(IdeMessengerContext);

  const handleStarRepo = () => {
    setHasStarred(true);
  };

  const handleGenerateWrapped = async () => {
    if (!githubUsername) return;
    
    try {
      setIsGenerating(true);
      setIsLoading(true);
      // TODO: Implement the wrapped generation request
      // await ideMessenger.request('pearaiWrapped/generate', {
      //   username: githubUsername
      // });
    } catch (error) {
      console.error('Failed to generate PearAI Wrapped:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background p-6 gap-4 max-w-3xl mx-auto items-center justify-center">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Generating Your PearAI Wrapped...
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Please wait while we analyze your GitHub profile and generate your personalized summary.
        </p>
        <Sparkles className="w-16 h-16 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background p-6 gap-4 max-w-3xl mx-auto">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-primary">
          PearAI Wrapped
          <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
        </h2>
      </div>
      
      <div className="flex flex-col gap-4">
        <StepCard
          stepNumber={1}
          icon={<Github className="w-8 h-8" />}
          title="Star Our Repository"
          description="Help us prevent spam and protect user privacy"
        >
          <a 
            href="https://github.com/trypear/pearai-master"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              onClick={handleStarRepo}
              variant={hasStarred ? "outline" : "default"}
            >
              <Github className="mr-2 h-4 w-4" />
              {hasStarred ? "Starred" : "Star Repository"}
            </Button>
          </a>
        </StepCard>

        <StepCard
          stepNumber={2}
          icon={<Sparkles className="w-8 h-8" />}
          title="Generate Your 2023 Wrapped"
          description="Enter your GitHub username to see your coding journey"
        >
          <div className="flex gap-2 w-full">
            <Input
              type="text"
              placeholder="GitHub Username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="flex-1 text-primary-foreground"
            />
            <Button
              onClick={handleGenerateWrapped}
              disabled={isGenerating || !githubUsername}
              variant="default"
              className="whitespace-nowrap mr-4"
            >
              {isGenerating ? "Generating..." : "Create my PearAI Wrapped!"}
            </Button>
          </div>
        </StepCard>
      </div>
    </div>
  );
}
