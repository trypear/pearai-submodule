"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useContext, useState, useEffect } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { Bot, Sparkles, MessageSquare, Search } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  installCommand: string;
  preInstalled: boolean;
}

const tools: Tool[] = [
  {
    id: "aider",
    name: "Aider",
    description: "A command-line tool that lets you pair program with GPT-4, editing code and files together in your terminal.",
    icon: <Bot className="h-6 w-6" />,
    installCommand: "install_aider",
    preInstalled: false
  },
  {
    id: "supermaven",
    name: "SuperMaven",
    description: "An AI-powered tool that helps you understand and navigate complex codebases with semantic search and analysis.",
    icon: <Sparkles className="h-6 w-6" />,
    installCommand: "install_supermaven",
    preInstalled: false
  }
];

export default function InstallTools({
  onNext,
}: {
  onNext: () => void;
}) {
  const ideMessenger = useContext(IdeMessengerContext);
  const [installingTools, setInstallingTools] = useState<Record<string, boolean>>({});
  const [isInstallingAll, setIsInstallingAll] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const [checkedTools, setCheckedTools] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    tools.forEach(tool => {
      initialState[tool.id] = true;
    });
    return initialState;
  });

  const handleInstall = async (tool: Tool) => {
    setInstallingTools(prev => ({ ...prev, [tool.id]: true }));
    // await ideMessenger.post(tool.installCommand, undefined);
    setTimeout(() => {
      setInstallingTools(prev => ({ ...prev, [tool.id]: false }));
    }, 2000);
  };

  const handleInstallAll = async () => {
    setIsInstallingAll(true);
    // const installations = tools.map(tool => ideMessenger.post(tool.installCommand, undefined));
    // await Promise.all(installations);
    setTimeout(() => {
      setIsInstallingAll(false);
      onNext();
    }, 3000);
  };

  const handleCheckboxChange = (toolId: string) => {
    setCheckedTools(prev => ({ ...prev, [toolId]: !prev[toolId] }));
  };

  const handleInstallChecked = async () => {
    setIsInstallingAll(true);
    const installations = tools
      .filter(tool => checkedTools[tool.id])
    //   .map(tool => ideMessenger.post(tool.installCommand, undefined));
    // await Promise.all(installations);
    setTimeout(() => {
      setIsInstallingAll(false);
      onNext();
    }, 3000);
  };

  const areAllToolsSelected = () => {
    return tools.every(tool => checkedTools[tool.id]);
  };

  const getButtonText = () => {
    return areAllToolsSelected() ? "Install All Tools" : "Install Selected Tools";
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isInstallingAll) {
        handleInstallAll();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInstallingAll]);

  return (
    <div className="step-content flex w-full h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-[800px] flex flex-col items-center p-4">
        <h5 className="text-xl md:text-2xl lg:text-2xl font-bold text-foreground mb-12 text-center">
          PearAI requires some extra installation to give you the complete experience
        </h5>



        <details className="w-full mb-4" onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}>
          <summary className="cursor-pointer text-sm hover:text-muted-foreground transition-colors">
            Advanced Configuration
          </summary>
          <div className="space-y-2 mt-4">
            {tools.map((tool) => (
              <Card key={tool.id} className={`p-4 flex items-center border-solid border-2 justify-between ${tool.preInstalled ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={checkedTools[tool.id] || false}
                      onChange={() => handleCheckboxChange(tool.id)}
                      disabled={tool.preInstalled}
                      className="w-4 h-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                      style={{
                        accentColor: 'var(--button)',
                      }}
                    />
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-lg">{tool.name}</div>
                      {tool.preInstalled && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">Pre-installed</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-end mt-4">
              <Button
                className="text-button-foreground bg-button hover:bg-button-hover py-3 px-6 text-lg cursor-pointer"
                onClick={handleInstallChecked}
                disabled={isInstallingAll}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        </details>

        {!isAdvancedOpen && (
          <Button
            className="mb-2 text-button-foreground bg-button hover:bg-button-hover py-3 px-6 text-lg cursor-pointer"
            onClick={handleInstallAll}
            disabled={isInstallingAll}
          >
            Install All Tools
          </Button>
        )}

        <div
          onClick={onNext}
          className="mt-4 text-center text-sm cursor-pointer hover:text-muted-foreground transition-colors"
        >
          Skip
        </div>
      </div>
    </div>
  );
}
