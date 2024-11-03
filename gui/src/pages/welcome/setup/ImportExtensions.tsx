"use client";

import { Button } from "@/components/ui/button";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";

const getLogoPath = (assetName: string) => {
  return `${window.vscMediaUrl}/logos/${assetName}`;
};

export default function ImportExtensions({
  onNext,
}: {
  onNext: () => void;
}) {
  const ideMessenger = useContext(IdeMessengerContext);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    setIsImporting(true);
    ideMessenger.post("importUserSettingsFromVSCode", undefined);

    // Wait 2 seconds before proceeding
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  return (
    <div className="flex w-full overflow-hidden bg-background text-foreground">
      <div className="w-full flex flex-col h-screen">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-10">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6 text-center">
            Import your extensions <br/> and user settings from VSCode
          </h2>
          <div className="flex items-center justify-center gap-8 mb-8">
            <img src={getLogoPath("vscode.svg")} className="w-[100px] h-[100px]" alt="VS Code" />
            <ArrowLongRightIcon className="w-8 h-8 text-muted-foreground" />
            <img src={getLogoPath("pearai-green.svg")} className="w-36 h-36 ml-[-2.5rem]" alt="PearAI" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              disabled={isImporting}
              className="w-[200px] text-button-foreground bg-button hover:bg-button-hover p-4 md:p-5 lg:p-6 text-sm md:text-base cursor-pointer transition-all duration-300"
              onClick={handleImport}
            >
              <div className="flex items-center justify-center gap-2">
                {isImporting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-button-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Importing...</span>
                  </>
                ) : (
                  "Import"
                )}
              </div>
            </Button>

            {!isImporting ? (
              <div
                onClick={onNext}
                className="text-sm text-[var(--vscode-descriptionForeground)] hover:text-[var(--vscode-foreground)] underline cursor-pointer transition-colors"
              >
                Skip
              </div>
            ): (
              <div>Import in progress! You can leave this page</div>
            )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
