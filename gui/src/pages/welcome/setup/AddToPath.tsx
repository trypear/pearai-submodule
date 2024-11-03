"use client";

import { Button } from "@/components/ui/button";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";

export default function AddToPath({
  onNext,
}: {
  onNext: () => void;
}) {
  const ideMessenger = useContext(IdeMessengerContext);
  const [pathAdded, setPathAdded] = useState(false);
  return (
    <div className="step-content flex w-full overflow-hidden bg-background text-foreground">
      <div className="w-full flex flex-col h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Add PearAI to PATH
          </h2>

          <p className="text-muted-foreground text-sm md:text-base">
            Access PearAI directly from your terminal
          </p>

          <div className="w-full max-w-2xl mb-8 rounded-lg overflow-hidden border border-solid border-input shadow-sm">
            <div className="bg-input p-2 border-b border-input flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[var(--vscode-terminal-ansiRed)]"></div>
                <div className="w-3 h-3 rounded-full bg-[var(--vscode-terminal-ansiYellow)]"></div>
                <div className="w-3 h-3 rounded-full bg-[var(--vscode-terminal-ansiGreen)]"></div>
              </div>
              <span className="text-xs text-muted-foreground">Terminal</span>
            </div>

            <div className="bg-[var(--vscode-terminal-background)] p-4 border border-input m-1 rounded-sm">
              <div className="font-mono text-sm">
                <span className="text-[var(--vscode-terminal-foreground)]">
                  $ cd /path/to/your/project
                </span>
              </div>
              <div className="font-mono text-sm mt-2 flex items-center">
                <span className="text-[var(--vscode-terminal-foreground)]">
                  $&nbsp;
                </span>
                <span className="text-[var(--vscode-terminal-ansiCyan)]">
                  pearai .
                </span>
                <span className="ml-1 animate-pulse">▋</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              className="w-[200px] text-button-foreground bg-button hover:bg-button-hover p-4 md:p-5 lg:p-6 text-sm md:text-base cursor-pointer"
              onClick={() => {
                if (!pathAdded) {
                  ideMessenger.post("pearInstallCommandLine", undefined);
                  setPathAdded(true);
                } else {
                  onNext();
                }
              }}
            >
              {pathAdded ? "Next" : "Add to PATH"}
            </Button>

            {!pathAdded ? (
              <div
                onClick={onNext}
                className="text-sm hover:text-[var(--vscode-foreground)] underline cursor-pointer transition-colors"
              >
                Skip
              </div>
            ):
            (
              <div className="text-sm text-muted-foreground text-center">
                <span>
                  PearAI added to PATH
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
