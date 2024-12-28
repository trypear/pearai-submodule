"use client";

import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FinalStep({ onNext }: { onNext: () => void }) {

  const navigate = useNavigate();
  const selectedTools = JSON.parse(localStorage.getItem('onboardingSelectedTools'));
  const installExtensions = localStorage.getItem('importUserSettingsFromVSCode') === 'true';

  const initiateInstallations = () => {
    ideMessenger.post("pearAIinstallation", {tools: selectedTools, installExtensions: installExtensions})
    ideMessenger.post("markNewOnboardingComplete", undefined);
  };

  const handleOpenFolder = () => {
    ideMessenger.post("pearWelcomeOpenFolder", undefined);
    initiateInstallations();
    onNext() // navigates to inventory page
  };

  const handleClose = () => {
    initiateInstallations();
    onNext() // navigates to inventory page
  };

  useEffect(() => {
    // unlock overlay when we get to last page
    ideMessenger.post("unlockOverlay", undefined);
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleOpenFolder();
        onNext()
      }
      if (event.key === 'Escape') {
        initiateInstallations();
        onNext()
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const ideMessenger = useContext(IdeMessengerContext);
  return (
    <div className="flex w-full overflow-hidden text-foreground">
    <div className="w-[35%] min-w-[320px] max-w-[420px] flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 pt-8">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
              You're all set!
            </h2>
            <p className="text-sm text-muted-foreground">
              Let's get started by opening a folder.
            </p>
          </div>
        </div>
      </div>
    </div>

      <div className="w-full flex flex-col h-screen relative bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-10">
          <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
            <img
              src={`${window.vscMediaUrl}/logos/pearai-green.svg`}
              alt="PearAI"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            You're all set!
          </h2>
          <div className="flex flex-col items-center gap-4 mb-24">
            <Button
              className="w-[250px] md:w-[280px] text-button-foreground bg-button hover:bg-button-hover py-5 px-2 md:py-6 text-base md:text-lg cursor-pointer relative"
              onClick={handleOpenFolder}
            >
              <div className="flex items-center justify-center w-full gap-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  <span>Open folder</span>
                </div>
              </div>
            </Button>
            <div
              onClick={handleClose}
              className="flex items-center gap-2 cursor-pointer"
            >
            <span className="text-center w-full">Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
