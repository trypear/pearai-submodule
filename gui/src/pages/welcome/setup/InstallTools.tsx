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
  },
  {
    id: "continue",
    name: "Continue",
    description: "AI-powered coding assistant that helps you understand and modify code through natural conversations.",
    icon: <MessageSquare className="h-6 w-6" />,
    installCommand: "",
    preInstalled: true
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "AI-powered search engine that provides accurate and up-to-date answers to your development questions.",
    icon: <Search className="h-6 w-6" />,
    installCommand: "",
    preInstalled: true
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
    <div className="step-content flex w-full overflow-hidden bg-background text-foreground">
      <div className="w-full flex flex-col h-screen">
        <div className="flex-1 flex flex-col items-center p-2 md:p-4 lg:p-6 overflow-hidden">
          <div className="w-full max-w-[800px] mb-4">
            <h5 className="text-xl md:text-2xl lg:text-2xl font-bold text-foreground mb-2">
              Install Additional Tools
            </h5>

            <p className="text-muted-foreground text-base md:text-md max-w-[500px] p-0 mb-8">
              Install these recommended tools to enhance your PearAI experience
            </p>

            <div className="flex justify-end">
              <Button
                className="text-button-foreground bg-button hover:bg-button-hover py-2 px-4 text-sm cursor-pointer relative"
                onClick={handleInstallAll}
                disabled={isInstallingAll}
              >
                <div className="flex items-center justify-center gap-2">
                  {isInstallingAll ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Installing All...</span>
                    </>
                  ) : (
                    <span>Install All Tools</span>
                  )}
                </div>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-[800px] flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2 pb-4">
              {tools.map((tool) => (
                <Card key={tool.id} className={`p-2 px-4 flex items-center border-solid border-2 justify-between ${tool.preInstalled ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      {tool.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-lg">{tool.name}</div>
                        {tool.preInstalled && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">Pre-installed</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                  {!tool.preInstalled && (
                    <Button
                      className="ml-4"
                      onClick={() => handleInstall(tool)}
                      disabled={installingTools[tool.id]}
                    >
                      {installingTools[tool.id] ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Installing...</span>
                        </div>
                      ) : (
                        "Install"
                      )}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mb-2 w-full shrink-0 p-4 border-t border-input bg-background">
          <div className="w-full max-w-[800px] mx-auto">
            <div
              onClick={onNext}
              className="flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Skip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
