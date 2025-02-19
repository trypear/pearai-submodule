import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

export const getLogoPath = (assetName: string) => {
  return `${window.vscMediaUrl}/logos/${assetName}`;
};

export default function ImportExtensions({ importError, isDone }: { importError: string, isDone: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full relative gap-5">
      <div className="self-stretch text-center text-2xl font-['SF Pro']">
        Import your VS Code extensions to PearAI
      </div>
      <div className="flex items-center justify-center gap-8">
        <img src={getLogoPath("vscode.svg")} className="w-[100px] h-[100px]" alt="VS Code" />
        <ArrowLongRightIcon className="w-8 h-8 text-muted-foreground" />
        <img src={getLogoPath("pearai-green.svg")} className="w-36 h-36 ml-[-2.5rem]" alt="PearAI" />
      </div>
      <div className="absolute bottom-8 h-8">
        {importError && <p className="text-red-500 text-center">{importError}</p>}
        {isDone && (
          <div className="text-center">
            Done importing! You can continue to the next step.
          </div>
        )}
      </div>
    </div>
  );
}
