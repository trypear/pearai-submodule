"use client";

import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Bot, Search } from "lucide-react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setOnboardingState } from "@/redux/slices/stateSlice";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { Link } from "react-router-dom";
import InventoryButtons from "./inventoryButtons";
import { motion } from "framer-motion";

const getAssetPath = (assetName: string) => {
  return `${window.vscMediaUrl}/assets/${assetName}`;
};

export default function Features({ onNext }: { onNext: () => void }) {
  const dispatch = useDispatch();

  const [currentFeature, setCurrentFeature] = useState(0);
  const onboardingState = useSelector((state: RootState) => state.state.onboardingState);
  const visitedFeatures = onboardingState.visitedFeatures || [];
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());

  const FEATURE_DURATION = 5000;
  const AUTO_PROGRESS = false;

  const features = [
    {
      icon: "inventory-chat.svg",
      title: "Make line-by line changes with PearAI Chat.",
      description:
        "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
      video: getAssetPath("pearai-chat-welcome.mp4"),
    },
    {
      icon: "inventory-creator.svg",
      title: "Create code with PearAI Agent.",
      description:
        "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
      video: getAssetPath("pearai-agent-welcome.mp4"),
    },
    {
      icon: "inventory-search.svg",
      title: "Copy for Search Here",
      description: "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
      video: getAssetPath("pearai-search-welcome.mp4"),
    },
    {
      icon: "inventory-mem0.svg",
      title: "Copy for Memory Here",
      description:
        "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
      video: getAssetPath("pearai-memory-welcome.mp4"),
    },
  ];

  const ideMessenger = useContext(IdeMessengerContext);

  const isUserSignedIn = useMemo(() => {
    return ideMessenger.request("getPearAuth", undefined).then((res) => {
      return res?.accessToken ? true : false;
    });
  }, [ideMessenger]);

  const [videoSrc, setVideoSrc] = useState(features[0].video);

  useEffect(() => {
    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setVideoSrc(features[currentFeature].video);
    };
    img.src = features[currentFeature].video;
  }, [currentFeature]);

  useEffect(() => {
    if (!AUTO_PROGRESS) return;

    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / FEATURE_DURATION) * 100;

      if (newProgress >= 100) {
        setCurrentFeature((current) => (current + 1) % features.length);
        setProgress(0);
        clearInterval(progressInterval.current);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentFeature]);

  const handleFeatureChange = (index: number) => {
    if (visitedFeatures.includes(index)) {
      setCurrentFeature(index);
      setProgress(0);
      setTimestamp(Date.now());
    }
  };

  const handleNextClick = () => {
    if (currentFeature < features.length - 1) {
      // Increment the feature index if not the last one
      const nextFeature = currentFeature + 1;
      setCurrentFeature(nextFeature);
      if (!visitedFeatures.includes(nextFeature)) {
        dispatch(setOnboardingState({ ...onboardingState, visitedFeatures: [...visitedFeatures, nextFeature] }));
      }
      setProgress(0);
      setTimestamp(Date.now());
    } else {
      // Proceed to the next step if the last feature
      onNext();
    }
  };

  const handleBackClick = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
      setProgress(0);
      setTimestamp(Date.now());
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleNextClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentFeature]);

  return (
    <div className="flex w-full text-foreground h-full">
      {/* <div className="w-[35%] flex flex-col h-full">
        <div className="flex flex-col h-full p-5 pt-16 gap-5">

          <div className="space-y-3 flex-1 overflow-y-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-none p-3 transition-all duration-200 ${currentFeature === index
                  ? "bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] shadow-sm ring-1 ring-[var(--vscode-input-border)]"
                  : "bg-[var(--vscode-input-background)] text-[var(--vscode-foreground)] opacity-60"
                  } ${!visitedFeatures.includes(index) ? 'cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer hover:opacity-80'}`}
                onClick={() => handleFeatureChange(index)}
                style={{ cursor: visitedFeatures.includes(index) ? "pointer" : "not-allowed" }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getLogoPath(feature.icon)}
                    className="w-10 h-10"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h3>
                    {currentFeature === index && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    )}
                    {currentFeature === index && (
                      <Progress
                        value={progress}
                        className="mt-2 h-0.5 bg-input [&>div]:bg-button"
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="border-t border-input">
            <Button
              className="w-full text-button-foreground bg-button hover:bg-button-hover p-3 text-sm cursor-pointer relative"
              onClick={handleNextClick}
            >
              <span className="absolute left-1/2 -translate-x-1/2">Next</span>
            </Button>
          </div>
        </div>
      </div> */}
      {features.map((feature, index) => (
        <>
          {index === currentFeature && (
            <div className="w-full flex-col justify-center items-center gap-10 inline-flex overflow-hidden">
              <div className=" h-[80%] w-full flex-col justify-center items-center gap-7 flex">
                <div className="flex-col justify-center items-center gap-7 flex">
                  <InventoryButtons />
                </div>
                <div className=" flex-col justify-start items-center gap-2 inline-flex">
                  <div className="text-4xl font-['SF Pro']">{feature.title}</div>
                  <div className="opacity-50  text-xs font-normal font-['SF Pro'] leading-[18px]">{feature.description}</div>
                </div>
                <div className="h-[80%] rounded-xl justify-start items-start inline-flex overflow-hidden">
                  {currentFeature === 0 ? (
                    <video
                      src={feature.video}
                      className="rounded-lg w-full h-full object-cover"
                      // loading="lazy"
                      muted
                      autoPlay
                      playsInline
                      loop
                    />
                  ) : (
                    <motion.video
                      key={feature.video}
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      src={feature.video}
                      className="rounded-lg w-full h-full object-cover"
                      muted
                      autoPlay
                      playsInline
                      loop
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button className="text-xs font-['SF Pro']" onClick={handleNextClick}>
                    Continue
                  </Button>
                  {process.env.NODE_ENV === "development" && (
                    <Button className="text-xs font-['SF Pro']" onClick={handleBackClick}>
                      Back (shown only in dev)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ))}
      {/* <div className="w-full flex flex-col h-full relative bg-background justify-between">

        {features.map((feature, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${currentFeature === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            {currentFeature === index && (
              <div className="flex items-center justify-center h-full w-full">
                <video
                  src={`${feature.video}`}
                  className="rounded-lg max-h-[90%] max-w-[90%] object-contain"
                  muted
                  autoPlay
                  playsInline
                  loop
                />
              </div>
            )}
          </div>
        ))}
        <div></div>
        <div className="text-[10px] z-[100] hover:cursor-pointer  text-muted-foreground mt-4 flex justify-end pr-4 pb-4">
          *View PearAI Disclaimer page{" "}
          <a
            href="https://trypear.ai/disclaimer/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:cursor-pointer hover:text-primary hover:underline ml-1"
          >
            here
          </a>
          .
        </div>
      </div> */}
    </div>
  );
}