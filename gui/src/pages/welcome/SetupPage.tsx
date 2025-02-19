import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Bot, Search, Download, LogIn, User, Command, Terminal, Import, Move } from "lucide-react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import ImportExtensions from "./setup/ImportExtensions";
import AddToPath from "./setup/AddToPath";
import SignIn from "./setup/SignIn";
import InstallTools from "./setup/InstallTools";
import { getPlatform } from "@/util";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setOnboardingState } from "@/redux/slices/stateSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { vscBackground, vscBadgeBackground, vscBadgeForeground, vscEditorBackground, vscInputBackground, vscSidebarBorder } from "@/components";
import { getLocalStorage } from "@/util/localStorage";
import { setLocalStorage } from "@/util/localStorage";


export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element | string;
  preInstalled: boolean;
}


export default function SetupPage({ onNext }: { onNext: () => void }) {
  const dispatch = useDispatch();
  const [currentFeature, setCurrentFeature] = useState(0);
  const onboardingState = useSelector((state: RootState) => state.state.onboardingState);
  const visitedSteps = onboardingState.visitedSteps || [];
  const [timestamp, setTimestamp] = useState(Date.now());
  console.dir(window.vscMediaUrl)

  const handleFeatureChange = (index: number) => {
    if (visitedSteps.includes(index)) {
      setCurrentFeature(index);
      setTimestamp(Date.now());
    }
  };

  const handleNextClick = () => {
    if (currentFeature < setupSteps.length - 1) {
      const nextFeature = currentFeature + 1;
      setCurrentFeature(nextFeature);
      if (!visitedSteps.includes(nextFeature)) {
        dispatch(setOnboardingState({ ...onboardingState, visitedSteps: [...visitedSteps, nextFeature] }));
      }
      setTimestamp(Date.now());
    } else {
      // Proceed to the next step if the last feature
      onNext();
    }
  };

  const handleBackClick = () => {
    if (currentFeature > 0) {
      const previousFeature = currentFeature - 1;
      setCurrentFeature(previousFeature);
    }
  };

  //#region Import Extensions

  const [isImportingExtensions, setIsImportingExtensions] = useState(false);
  const [isDoneImportingExtensions, setIsDoneImportingExtensions] = useState(false);
  const [extensionsImportError, setExtensionsImportError] = useState("");
  const ideMessenger = useContext(IdeMessengerContext);

  const handleImportExtensions = async () => {
    setIsImportingExtensions(true);
    setExtensionsImportError("");

    // Attempt to load settings
    const settingsLoaded = await ideMessenger.request(
      "importUserSettingsFromVSCode",
      undefined,
    );
    if (typeof settingsLoaded === "boolean" && settingsLoaded) {
      setIsDoneImportingExtensions(true);
      setLocalStorage("isDoneImportingUserSettingsFromVSCode", true);
      handleNextClick();
    } else {
      setIsImportingExtensions(false);
      setIsDoneImportingExtensions(false);
      setExtensionsImportError(
        "Something went wrong while importing your settings. Please skip or try again.",
      );
    }
  };

  useEffect(() => {
    // If user presses back, we want the screen to still say "done"
    setIsDoneImportingExtensions(getLocalStorage("isDoneImportingUserSettingsFromVSCode") === true);
  }, [isDoneImportingExtensions])

  //#endregion Import Extensions

  //#region Install Tools

  const tools: Tool[] = [
    // {
    //     id: "aider",
    //     name: "PearAI Creator",
    //     description: "PearAI Creator is a no-code tool powered by aider* that let's you build complete features with just a prompt.",
    //     icon: "inventory-creator.svg",
    //     preInstalled: false
    // },
    {
      id: "supermaven",
      name: "PearAI Predict",
      description: "PearAI Predict is our upcoming code autocomplete tool. While it's under development, we recommend using Supermaven* as a standalone extension within PearAI for code autocompletion. Selecting this option will install Supermaven.",
      icon: "inventory-autocomplete.svg",
      preInstalled: false
    }
  ];


  const [checkedTools, setCheckedTools] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    tools.forEach(tool => {
      initialState[tool.id] = true;
    });
    return initialState;
  });


  const [attemptedInstalls, setAttemptedInstalls] = useState<string[]>(() => {
    const saved = localStorage.getItem('onboardingSelectedTools');
    return saved ? JSON.parse(saved) : [];
  });

  const areAllToolsSelected = () => {
    return tools.every(tool => checkedTools[tool.id]);
  };

  const areAnyToolsSelected = () => {
    return tools.some(tool => checkedTools[tool.id]);
  };

  const areAllToolsAttempted = () => {
    return tools.every(tool => attemptedInstalls.includes(tool.id));
  };

  const getInstallToolsButtonText = () => {
    if (areAllToolsAttempted() || !areAnyToolsSelected()) {
      return "Skip Tools Installation"
    }
    if (areAllToolsSelected() && attemptedInstalls?.length > 0) {
      return "Install Selected Tool";
    }
    if (attemptedInstalls?.length > 0) {
      return "Continue";
    }
    return areAllToolsSelected() ? "Install All Tools" : "Install Selected Tools";
  };

  const handleInstallChecked = async () => {
    const selectedTools = tools.filter(tool =>
      checkedTools[tool.id]
    );

    localStorage.setItem('onboardingSelectedTools', JSON.stringify(selectedTools.map(t => t.id)));
    onNext()
  };

  //#endregion Install Tools

  //#region Sign In

  const handleSignIn = () => {
    ideMessenger.post("pearaiLogin", undefined);
  };

  const handleSignUp = () => {
    ideMessenger.post("openUrl", "https://trypear.ai/signup");
  };

  //#endregion Sign In

  //#region Add To Path

  const [pathAdded, setPathAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToPath = () => {
    if (!isAdding) {
      setIsAdding(true);
      ideMessenger.post("pearInstallCommandLine", undefined);
      setTimeout(() => {
        setPathAdded(true);
        onNext();
      }, 2000);
    }
  };


  //#region Setup Steps

  const allSetupSteps = [
    {
      icon: <Move className="h-5 w-5" />,
      title: "Import Extensions",
      description:
        "Automatically import your extensions from VSCode to feel at home.",
      component: <ImportExtensions importError={extensionsImportError} isDone={isDoneImportingExtensions} />,
      button: !isDoneImportingExtensions ? <Button
        disabled={isImportingExtensions}
        className="text-xs font-['SF Pro']"
        onClick={handleImportExtensions}
      >
        <div className="flex items-center justify-between w-full gap-2">
          {isImportingExtensions ? (
            <div className="flex items-center justify-center w-full gap-2">
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
            </div>
          ) : (
            <>
              <span className="text-center w-full">Import Extensions</span>
            </>
          )}
        </div>
      </Button>
        :
        <Button
          onClick={handleNextClick}
          className="text-xs font-['SF Pro']"
        >Continue</Button>,
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Add PearAI To PATH",
      description: "Easily open PearAI from the command line with 'pearai'.",
      component: <AddToPath onNext={handleNextClick} pathAdded={pathAdded} />,
      platformSpecific: "mac",
      button: <Button
        className="text-xs font-['SF Pro']"
        onClick={handleAddToPath}
      >
        <div className="flex items-center justify-between w-full gap-2">
          {isAdding ? (
            <div className="flex items-center justify-center w-full gap-2">
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
              <span>Adding...</span>
            </div>
          ) : (
            <>
              <span className="text-center w-full">Add to PATH</span>
            </>
          )}
        </div>
      </Button>,
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Install Additional Tools",
      description: "Install recommended tools to enhance your PearAI experience.",
      component: <InstallTools onNext={handleNextClick} tools={tools} checkedTools={checkedTools} setCheckedTools={setCheckedTools} attemptedInstalls={attemptedInstalls} />,
      button: <Button
        className="text-xs font-['SF Pro']"
        onClick={handleInstallChecked}
      >
        {getInstallToolsButtonText()}
      </Button>
    },

    {
      icon: <User className="h-6 w-6" />,
      title: "Sign in",
      description: "Have PearAI work for free out of the box by signing in.",
      component: <SignIn onNext={handleNextClick} />,
      button: <>
        <Button
          className="text-xs font-['SF Pro']"
          onClick={handleSignIn}
        >
          Sign In
        </Button>

        <Button
          className="text-xs font-['SF Pro']"
          onClick={handleSignUp}
        >
          Sign Up
        </Button>
      </>
    },
  ];

  const setupSteps = allSetupSteps.filter(step =>
    !step.platformSpecific || step.platformSpecific === getPlatform()
  );


  //#region RETURN

  return (
    // <div className="flex w-full overflow-hidden text-foreground h-full">
    //   <div className="hidden md:flex w-[35%] flex-col">
    //     <div className="flex-1 overflow-y-auto">
    //       <div className="p-6 space-y-6 pt-8">
    //         <div>
    //           <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
    //             Quick Setup
    //           </h2>
    //           <p className="text-sm text-muted-foreground">
    //             Setup PearAI in less than 1 minute.
    //           </p>
    //         </div>
    //         <div className="space-y-3">
    //           {setupSteps.map((feature, index) => (
    //             <Card
    //               key={index}
    //               className={`border-none p-3 transition-all duration-200 ${currentFeature === index
    //                   ? "bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] shadow-sm ring-1 ring-[var(--vscode-input-border)]"
    //                   : "bg-[var(--vscode-input-background)] text-[var(--vscode-foreground)] opacity-60"
    //                 } ${!visitedSteps.includes(index) ? 'cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
    //               onClick={() => handleFeatureChange(index)}
    //             >
    //               <div className="flex items-center gap-3">
    //                 <div
    //                   className={`p-1.5 rounded-lg ${currentFeature === index
    //                       ? "bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)]"
    //                       : "bg-[var(--vscode-input-background)] text-[var(--vscode-foreground)] opacity-60"
    //                     }`}
    //                 >
    //                   {feature.icon}
    //                 </div>
    //                 <div className="min-w-0">
    //                   <h3 className="font-semibold text-foreground text-sm">
    //                     {feature.title}
    //                   </h3>
    //                   {currentFeature === index && (
    //                     <p className="text-xs text-muted-foreground mt-1">
    //                       {feature.description}
    //                     </p>
    //                   )}
    //                 </div>
    //               </div>
    //             </Card>
    //           ))}
    //         </div>
    //       </div>
    //     </div>

    //   </div>

    //   <div className="w-full md:w-[65%] flex flex-col h-full justify-center relative bg-background">
    //     {setupSteps.map((setupStep, index) => (
    //       <div
    //         key={index}
    //         className={`transition-opacity duration-300 ease-in-out ${currentFeature === index
    //             ? "opacity-100 z-10"
    //             : "opacity-0 z-0"
    //           }`}
    //       >
    //         {index === currentFeature && setupStep.component}
    //       </div>
    //     ))}
    //   </div>
    // </div>

    <div className="h-full flex-col justify-center items-center inline-flex overflow-hidden select-none">
      <div className="h-[80%] w-[50%] flex-col justify-center items-center gap-7 flex">
        <div className="text-4xl font-['SF Pro']">Setup</div>
        <div className="w-full justify-start items-start gap-5 inline-flex">
          {setupSteps.map((step, index) => (
            <div key={index} className="grow shrink basis-0 p-3 rounded-lg  justify-start items-center gap-3 flex overflow-hidden cursor-pointer"
              style={{ background: currentFeature === index ? vscInputBackground : vscEditorBackground }}
              onClick={() => handleFeatureChange(index)}
            >
              <Checkbox className="w-4 h-4 rounded-[50%] shadow outline-none" style={{ background: "transparent" }} />
              <div className="w-48 flex-col justify-center items-center gap-1 inline-flex">
                <div className="self-stretch text-xs font-normal font-['SF Pro'] leading-[18px]">{step.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full h-[500px] rounded-xl flex-col justify-center items-center gap-5 flex overflow-hidden bg-background"
        >
          <div className="self-stretch grow shrink basis-0 flex-col justify-center items-center gap-5 flex">
            {/* <div className="self-stretch text-center text-2xl font-['SF Pro']">Import your VS Code extensions to PearAI.</div> */}
            {setupSteps[currentFeature].component}
          </div>
        </div>
        <div className="self-stretch justify-center items-center gap-4 inline-flex overflow-hidden">
          <div className="opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px] cursor-pointer"
            onClick={() => {
              if (currentFeature === 2) {
                localStorage.setItem('onboardingSelectedTools', JSON.stringify([]));
              }
              handleNextClick()
            }}>Skip</div>
          {process.env.NODE_ENV === "development" &&
            <Button
              onClick={() => handleBackClick()}
              className="text-xs font-['SF Pro']"
              style={{ background: vscInputBackground }}
            >Back (shown in dev)</Button>
          }
          {/* <div className="px-6 py-3 rounded-lg justify-center items-center gap-1 flex overflow-hidden">
            <div className="text-xs font-['SF Pro']">Install selected</div>
          </div> */}
          {setupSteps[currentFeature].button}
        </div>
      </div>
    </div>
  );
}
