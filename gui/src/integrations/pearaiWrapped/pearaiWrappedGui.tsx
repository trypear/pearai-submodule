import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { Github, Gift } from "lucide-react";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function StepCard({ icon, title, description, children }: StepCardProps) {
  return (
    <Card className="p-2 bg-input hover:bg-input/90 hover:cursor-pointer transition-colors mx-auto mr-8">
      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-3">
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

  return (
    <div className="flex flex-col h-full bg-background p-6 gap-4 max-w-5xl mx-auto">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-primary">
          Developer Wrapped
          <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
        </h2>
      </div>
      
      <div className="flex flex-col gap-4">
        <StepCard
          icon={<Gift className="w-8 h-8" />}
          title="Generate Your Developer Wrapped 2024"
          description="View and share your year in code!"
        >
          <div className="flex gap-2 w-full ml-4">
            <Input
              type="text"
              placeholder="GitHub Username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="flex-1 text-primary-foreground"
            />
            <a 
              href={`https://developerwrapped.com/create?user=${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${!githubUsername ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Button
                variant="default"
                className="whitespace-nowrap mr-4"
                disabled={!githubUsername}
              >
                Create my Developer Wrapped!
              </Button>
            </a>
          </div>
        </StepCard>
      </div>
    </div>
  );
}
