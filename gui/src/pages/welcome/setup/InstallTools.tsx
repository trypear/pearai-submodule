import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useContext, useState, useEffect } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { getLogoPath } from "./ImportExtensions";
import { Tool } from "../SetupPage";

export default function InstallTools({
  onNext,
  tools,
  checkedTools,
  setCheckedTools,
  attemptedInstalls
}: {
  onNext: () => void;
  tools: Tool[];
  checkedTools: Record<string, boolean>;
  setCheckedTools: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  attemptedInstalls: string[];
}) {
  const handleCheckboxChange = (toolId: string) => {
    setCheckedTools(prev => ({ ...prev, [toolId]: !prev[toolId] }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary text-foreground">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[800px] flex flex-col">
          <div className="text-xl md:text-2xl lg:text-2xl text-foreground mb-8 text-center max-w-[600px] mx-auto">
            PearAI requires some extra installation for the following integrations
          </div>

          <div className="flex-1 overflow-y-auto mx-6">
            <div className="w-full space-y-2">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  className={`p-4 flex items-center border-solid border-2 justify-between ${tool.preInstalled || attemptedInstalls.includes(tool.id) ? 'opacity-60' : ''
                    }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-muted rounded-lg">
                      {typeof tool.icon === 'string' ? (
                        <img src={getLogoPath(tool.icon)} alt={tool.name} className="h-[50px]" />
                      ) : (
                        tool.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-lg">{tool.name}</div>
                        {(tool.preInstalled || attemptedInstalls.includes(tool.id)) && (
                          <span className="text-xs ml-2 bg-foreground text-white px-2 py-1 rounded-md">
                            {tool.preInstalled ? 'Pre-installed' : 'Setup initiated'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center h-5 ml-4">
                    <input
                      type="checkbox"
                      checked={checkedTools[tool.id] || false}
                      onChange={() => handleCheckboxChange(tool.id)}
                      disabled={tool.preInstalled || attemptedInstalls.includes(tool.id)}
                      className="h-5 w-5 rounded-sm cursor-pointer focus:outline-none"
                      style={{
                        accentColor: 'var(--button-background)',
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
