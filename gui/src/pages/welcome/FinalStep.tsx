"use client";

import { Button } from "@/components/ui/button";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";

export default function FinalStep({ onBack }: { onBack: () => void }) {
  const ideMessenger = useContext(IdeMessengerContext);
  return (
    <div className="flex w-full overflow-hidden bg-background text-foreground">
      <div className="w-full flex flex-col h-screen">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-10">
          <div className="w-24 h-24 md:w-32 md:h-32 mb-8 flex items-center justify-center">
            <img
              src={`${window.vscMediaUrl}/assets/pear-icon.svg`}
              alt="PearAI"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            You're all set!
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-[500px] text-center mb-4">
            Start using PearAI by opening a folder:
          </p>

          <div className="flex flex-col items-center gap-3">
            <Button
              className="w-[250px] md:w-[280px] text-button-foreground bg-button hover:bg-button-hover p-5 md:p-6 text-base md:text-lg cursor-pointer"
              onClick={() =>
                ideMessenger.post("pearWelcomeOpenFolder", undefined)
              }
            >
              Open a folder
            </Button>

            <p className="text-sm md:text-base text-muted-foreground text-center max-w-[400px] mt-4 mb-6">
              Join our growing community of developers to share experiences, get
              help, and shape the future of PearAI
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <a
                href="https://x.com/trypearai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--vscode-descriptionForeground)] hover:text-[var(--vscode-foreground)] underline cursor-pointer transition-colors"
              >
                <img
                  src={`${window.vscMediaUrl}/assets/twitter-x.svg`}
                  alt="Twitter"
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                Follow us
              </a>
              <a
                href="https://discord.gg/7QMraJUsQt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--vscode-descriptionForeground)] hover:text-[var(--vscode-foreground)] underline cursor-pointer transition-colors"
              >
                <img
                  src={`${window.vscMediaUrl}/assets/discord.svg`}
                  alt="Discord"
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
