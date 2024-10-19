import React, { useEffect, useState } from 'react';
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";

// Register the VS Code design system
provideVSCodeDesignSystem().register(vsCodeButton());

// interface vscode {
//   postMessage(message: any): void;
// }

// declare const vscode: vscode;

const vscode = acquireVsCodeApi();

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for messages from the extension
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'update':
          setMessage(message.text);
          break;
      }
    });
  }, []);

  const handleClick = () => {
    // Send a message to the extension
    vscode.postMessage({
      type: 'alert',
      text: 'Hello from React!'
    });
    console.log("in perp")
  };

  return (
    <div>
      <h1>PearAI Perplexity View</h1>
      <p>{message}</p>
      <vscode-button onClick={handleClick}>Send Message to Extension</vscode-button>
    </div>
  );
}

export default App;
