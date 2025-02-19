"use client";

import { useState } from "react";
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

  const allSetupSteps = [
    {
      icon: <Move className="h-5 w-5" />,
      title: "Import VSCode Extensions",
      description:
        "Automatically import your extensions from VSCode to feel at home.",
      component: <ImportExtensions onNext={handleNextClick} />,
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Add PearAI To Your Path",
      description: "Easily open PearAI from the command line with 'pearai'.",
      component: <AddToPath onNext={handleNextClick} />,
      platformSpecific: "mac"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Install Additional Tools",
      description: "Install recommended tools to enhance your PearAI experience.",
      component: <InstallTools onNext={handleNextClick} />,
    },

    {
      icon: <User className="h-6 w-6" />,
      title: "Sign in",
      description: "Have PearAI work for free out of the box by signing in.",
      component: <SignIn onNext={handleNextClick} />,
    },
  ];

  const setupSteps = allSetupSteps.filter(step =>
    !step.platformSpecific || step.platformSpecific === getPlatform()
  );

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

    <div className="h-full bg-[#202428] flex-col justify-center items-center inline-flex overflow-hidden">
      <div className="h-[80%] w-[50%] flex-col justify-center items-center gap-7 flex">
        <div className="text-white text-4xl font-['SF Pro']">Setup</div>
        <div className="w-full justify-start items-start gap-5 inline-flex">
          {setupSteps.map((step, index) => (
            <div key={index} className="grow shrink basis-0 h-11 p-3 bg-[#2a3238] rounded-lg border-2 border-white/10 justify-start items-center gap-3 flex overflow-hidden">
              <Checkbox className="w-4 h-4 rounded-[50%] shadow outline-none" style={{ background: "transparent" }} />
              <div className="w-48 flex-col justify-center items-center gap-1 inline-flex">
                <div className="self-stretch text-white text-xs font-normal font-['SF Pro'] leading-[18px]">{step.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full h-[500px] bg-[#161718] rounded-xl flex-col justify-center items-center gap-5 flex overflow-hidden">
          <div className="self-stretch grow shrink basis-0 flex-col justify-center items-center gap-5 flex">
            {/* <div className="self-stretch text-center text-white text-2xl font-['SF Pro']">Import your VS Code extensions to PearAI.</div> */}
            {setupSteps[currentFeature].component}
          </div>
        </div>
        <div className="self-stretch justify-center items-center gap-4 inline-flex overflow-hidden">
          <div className="opacity-50 text-white text-xs font-normal font-['SF Pro'] leading-[18px]" onClick={() => handleNextClick()}>Skip</div>
          {process.env.NODE_ENV === "development" && <div className="px-6 py-3 bg-[#0078d4] rounded-lg justify-center items-center gap-1 flex overflow-hidden" onClick={() => handleBackClick()}>
            <div className="text-white text-xs font-['SF Pro']">Back (show in dev)</div>
          </div>}
          <div className="px-6 py-3 bg-[#0078d4] rounded-lg justify-center items-center gap-1 flex overflow-hidden">
            <div className="text-white text-xs font-['SF Pro']">Install selected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
