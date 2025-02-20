export default function AddToPath({
  onNext,
  pathAdded,
}: {
  onNext: () => void;
  pathAdded: boolean;
}) {

  return (
    <div className="flex flex-col items-center gap-5 justify-center w-full h-full overflow-hidden text-foreground relative">
      <div className="text-center text-2xl font-['SF Pro']">Access PearAI directly from your terminal.</div>

      <Terminal />
      <div className="flex flex-col items-center gap-4 absolute bottom-14">
        {pathAdded && (
          <div className="text-sm text-muted-foreground text-center">
            <span>
              PearAI added to PATH
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


const Terminal = () => {
  return (
    <div className="w-full max-w-2xl rounded-lg overflow-hidden border border-solid border-input shadow-sm">
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
  );
};
