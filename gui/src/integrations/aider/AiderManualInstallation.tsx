// DEPRECATED AS OF v1.8.1

// import React from "react";
// import { getPlatform } from "../../util";
// import { Link } from "react-router-dom";


// const AiderManualInstallation: React.FC = () => {
//   const platform = getPlatform();

//   let instructions = <MacManualInstallation />;
//   if (platform === "windows") {
//     instructions = <WindowsManualInstallation />;
//   }

//   return (
//     <div className="flex items-center justify-center h-full w-full overflow-auto">
//       <div className="px-6 py-2 bg-input rounded-lg shadow-md m-4">
//         <h2 className="text-2xl font-bold mb-4">Manual Installation Guide for PearAI Creator (Powered by aider*)</h2>
//         <p className="mb-4">
//           Automatic installation of PearAI Creator (Powered by aider*) was unsuccessful. Please follow the steps below to manually install it to get it working.
//         </p>
//         {instructions}
//         <p className="mt-4 bg-statusbar-background p-4 rounded-lg">
//           If you followed the above instructions correctly and restarted PearAI, then PearAI Creator should work!
//           <br />
//           If not, please view{" "}
//           <a className="text-blue-500 hover:underline" href="https://trypear.ai/creator-troubleshooting">
//             PearAI Troubleshooting
//           </a>
//           , or contact PearAI Support on{" "}
//           <a className="text-blue-500 hover:underline" href="https://discord.gg/avc2y2Kqsa">Discord</a>.
//         </p>
//         <div className="text-[10px] text-muted-foreground mt-4">
//           *View PearAI Disclaimer page
//           <Link
//             to="https://trypear.ai/disclaimer/"
//             target="_blank"
//             className="text-muted-foreground no-underline hover:no-underline ml-1"
//           >
//             here
//           </Link>
//           .
//         </div>
//       </div>
//     </div>
//   );
// };

// const WindowsManualInstallation: React.FC = () => {
//   const pythonCmd = "winget install Python.Python.3.9";
//   const pipxInstallCmd = "python3.9 -m pip install --user pipx";
//   const pipxEnsureCmd = "python3.9 -m pipx ensurepath";
//   const aiderCmd = "python3.9 -m pipx install --python python3.9 aider-chat==0.65.0";

//   return (
//     <div className="px-4 py-1 bg-statusbar-background rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-2">For Windows:</h3>
//       <ol className="list-decimal list-inside">
//         <li className="mb-2">
//           <strong>Open a Command Prompt or PowerShell window</strong>
//         </li>
//         <li className="mb-2">
//           <strong>Install Python 3.9 - </strong>
//           Please download and install Python 3.9 from <a href="https://www.python.org/downloads/" target="_blank" className="text-blue-500 hover:underline">python.org</a>
//         </li>
//         <li>
//           <strong>Install pipx (if not already installed)</strong>
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">{pipxInstallCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(pipxInstallCmd)}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li>
//           <strong>Ensure pipx is in your PATH</strong>
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">{pipxEnsureCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(pipxEnsureCmd)}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li className="mb-2">
//           <strong>Install aider - </strong> Please run:
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">{aiderCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(aiderCmd)}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li>
//           <strong>Finally, please close and reopen PearAI</strong>
//         </li>
//       </ol>
//     </div>
//   );
// }



// const MacManualInstallation: React.FC = () => {
//   const homebrewCmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
//   const pipxCmd = 'brew install pipx';
//   const pipxEnsureCmd = 'pipx ensurepath';
//   const aiderCmd = `pipx install --python python3.9 aider-chat==0.65.0`;

//   return (
//     <div className="px-4 py-1 bg-statusbar-background rounded-lg shadow-md flex-wrap text-wrap">
//       <h3 className="text-xl font-semibold mb-2">For macOS:</h3>
//       <ol className="list-decimal list-inside">
//         <li className="mb-4">
//           <strong>Open a new terminal window</strong>
//         </li>
//         <li className="mb-2">
//           <strong>Install Homebrew (if not already installed) - </strong> Run:
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono text-wrap">{homebrewCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(homebrewCmd)}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li className="mb-2">
//           <strong>Install Python 3.9 - </strong> Run:
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">brew install python@3.9</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText('brew install python@3.9')}
//               >copy</span>
//             </div>
//           </pre>
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg mt-2">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">brew link python@3.9</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText('brew link python@3.9')}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li className="mb-2">
//           <strong>Install pipx - </strong> Run:
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">{pipxCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(pipxCmd)}
//               >copy</span>
//             </div>
//           </pre>
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg mt-2">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">{pipxEnsureCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(pipxEnsureCmd)}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li className="mb-2">
//           <strong>Install aider - </strong> Run:
//           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
//             <div className="flex justify-between items-center flex-wrap">
//               <span className="font-mono">{aiderCmd}</span>
//               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
//                 onClick={() => navigator.clipboard.writeText(aiderCmd)}
//               >copy</span>
//             </div>
//           </pre>
//         </li>
//         <li>
//           <strong>Finally, please close and reopen PearAI</strong>
//         </li>
//       </ol>
//     </div>
//   );

//   // TODO: Add this when we add the state variable of if aider is enabled or not.
// // const MacManualInstallation: React.FC = () => {
// //   const homebrewCmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';

// //   return (
// //     <div className="px-4 py-1 bg-statusbar-background rounded-lg shadow-md flex-wrap text-wrap">
// //       <h3 className="text-xl font-semibold mb-2">For macOS/Linux:</h3>
// //       <ol className="list-decimal list-inside">
// //         <li className="mb-4">
// //           <strong>Open a new terminal window</strong>
// //         </li>
// //         <li className="mb-2">
// //           <strong>Install Homebrew (if not already installed) - </strong> Run:
// //           <pre className="bg-secondary border-solid border-2 border-input p-2 rounded-lg">
// //             <div className="flex justify-between items-center flex-wrap">
// //               <span className="font-mono text-wrap">{homebrewCmd}</span>
// //               <span className="font-mono ml-auto bg-button-background text-button-foreground border-solid border-2 border-input cursor-pointer px-2 py-1 rounded-md"
// //                 onClick={() => navigator.clipboard.writeText(homebrewCmd)}
// //               >copy</span>
// //             </div>
// //           </pre>
// //         </li>
// //         <li className="mt-4">
// //           <strong>After installing Homebrew, please restart PearAI</strong>
// //         </li>
// //       </ol>
// //     </div>
// //   );

// }



// export default AiderManualInstallation;
export {};