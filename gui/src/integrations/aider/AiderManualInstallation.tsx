import React from "react";
import { getPlatform } from "../../util";
import { Link } from "react-router-dom";


const AiderManualInstallation: React.FC = () => {
  const platform = getPlatform();

  let instructions = <MacManualInstallation />;
  if (platform === "windows") {
    instructions = <WindowsManualInstallation />;
  }

  return (
    <div className="flex items-center justify-center h-screen overflow-y-auto">
      <div className="p-6 bg-input rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Manual Installation Guide for PearAI Creator (Powered by aider*)</h2>
          <p className="mb-4">
            Automatic installation of PearAI Creator (Powered by aider*) was unsuccessful. Please follow the steps below to manually install it to get it working.
          </p>
          {instructions}
          <p className="mt-4 bg-statusbar-background p-4 rounded-lg">
            If you followed the above instructions correctly and restarted PearAI, then PearAI Creator should work!
            <br />
            If not, please view{" "}
            <a className="text-blue-500 hover:underline" href="https://trypear.ai/creator-troubleshooting">
              PearAI Troubleshooting
            </a>
            , or contact PearAI Support on{" "}
            <a className="text-blue-500 hover:underline" href="https://discord.gg/avc2y2Kqsa">Discord</a>.
          </p>
          <div className="text-[10px] text-muted-foreground mt-4">
          *View PearAI Disclaimer page
          <Link
            to="https://trypear.ai/disclaimer/"
            target="_blank"
            className="text-muted-foreground no-underline hover:no-underline ml-1"
          >
            here
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

const WindowsManualInstallation: React.FC = () => {
  const pythonCmd = "winget install Python.Python.3.9";
  const aiderCmd = "python -m pip install -U aider-chat";

  return (
    <div className="p-4 bg-statusbar-background rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">For Windows:</h3>
      <ol className="list-decimal list-inside">
        <li className="mb-2">
          <strong>Open a Command Prompt or PowerShell window</strong>
        </li>
        <li className="mb-2">
          <strong>Install Python (if not already installed) - </strong> Run:
          <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
            <div className="flex justify-between items-center flex-wrap">
              <span className="font-mono">{pythonCmd}</span>
              <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
                onClick={() => navigator.clipboard.writeText(pythonCmd)}
              >copy</span>
            </div>
          </pre>
        </li>
        <li className="mb-2">
          <strong>Install aider - </strong> Please run:
          <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
            <div className="flex justify-between items-center flex-wrap">
              <span className="font-mono">{aiderCmd}</span>
              <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
                onClick={() => navigator.clipboard.writeText(aiderCmd)}
              >copy</span>
            </div>
          </pre>
        </li>
        <li>
          <strong>Finally, please close and reopen PearAI</strong>
        </li>
      </ol>
    </div>
  );
}

const MacManualInstallation: React.FC = () => {
  const homebrewCmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
  const pythonCmd = "brew install python@3";
  const aiderCmd = "brew install aider";

  return (
    <div className="p-4 bg-statusbar-background rounded-lg shadow-md flex-wrap text-wrap">
      <h3 className="text-xl font-semibold mb-2">For macOS/Linux:</h3>
      <ol className="list-decimal list-inside">
        <li className="mb-4">
          <strong>Open a new terminal window</strong>
        </li>
        <li className="mb-2">
          <strong>Install Homebrew (if not already installed) - </strong> Run:
          <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
            <div className="flex justify-between items-center flex-wrap">
              <span className="font-mono text-wrap">{homebrewCmd}</span>
              <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
                onClick={() => navigator.clipboard.writeText(homebrewCmd)}
              >copy</span>
            </div>
          </pre>
        </li>
        <li className="mb-2">
          <strong>Install Python (if not already installed) - </strong> Run:
          <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
            <div className="flex justify-between items-center flex-wrap">
              <span className="font-mono text-wrap">{pythonCmd}</span>
              <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
                onClick={() => navigator.clipboard.writeText(pythonCmd)}
              >copy</span>
            </div>
          </pre>
        </li>
        <li className="mb-2">
          <strong>Install aider - </strong> Please run:
          <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
            <div className="flex justify-between items-center flex-wrap">
              <span className="font-mono text-wrap">{aiderCmd}</span>
              <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
                onClick={() => navigator.clipboard.writeText(aiderCmd)}
              >copy</span>
            </div>
          </pre>
        </li>
        <li className="mt-4">
          <strong>Finally, please restart PearAI</strong>
        </li>
      </ol>
    </div>
  );
}

export default AiderManualInstallation;
