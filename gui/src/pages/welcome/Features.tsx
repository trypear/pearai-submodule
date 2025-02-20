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
import { vscInputBackground } from "@/components";

const getAssetPath = (assetName: string) => {
  return `${window.vscMediaUrl}/assets/${assetName}`;
};

export const features = [
  {
    id: "chat",
    icon: "inventory-chat.svg",
    title: "Make line-by line changes with PearAI Chat.",
    description:
      "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
    video: getAssetPath("pearai-chat-welcome.mp4"),
  },
  {
    id: "creator",
    icon: "inventory-creator.svg",
    title: "Create code with PearAI Agent.",
    description:
      "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
    video: getAssetPath("pearai-agent-welcome.mp4"),
  },
  {
    id: "search",
    icon: "inventory-search.svg",
    title: "Copy for Search Here",
    description: "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
    video: getAssetPath("pearai-search-welcome.mp4"),
  },
  {
    id: "memory",
    icon: "inventory-mem0.svg",
    title: "Copy for Memory Here",
    description:
      "Copy needed. Ask Assistant to help you understand code and make changes, powered by Continue.",
    video: getAssetPath("pearai-memory-welcome.mp4"),
  },
];

export default function Features({ onNext, pseudoRender }: { onNext: () => void, pseudoRender: boolean }) {
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

  const videoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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

  const resetVideos = () => {
    videoRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.currentTime = 0;
      }
    });
  }

  useEffect(() => {
    if (pseudoRender) {
      resetVideos();
      resetVideos(); // yessir two times, not a typo. cause sometimes video resets but get stuck on first frame.
      setCurrentFeature(0);
    }
  }, [pseudoRender]);

  const handleNextClick = () => {
    if (currentFeature < features.length - 1) {
      resetVideos();
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
      resetVideos();
      setCurrentFeature(currentFeature - 1);
      setProgress(0);
      setTimestamp(Date.now());
    }
  };

  return (
    <div className="flex w-full flex-col justify-center items-center gap-7 text-foreground h-full">
      <div className="w-full flex-col justify-center items-center gap-7 inline-flex overflow-hidden">
        <div className="flex-col justify-center items-center gap-7 flex">
          <InventoryButtons activeItemID="chat" />
        </div>
        {features.map((feature, index) => (
          <>
            {index === currentFeature && (
              <div className="w-full flex-col justify-center items-center gap-7 flex">
                <div className=" flex-col justify-start items-center gap-2 inline-flex">
                  <motion.div
                    key={`title-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-['SF Pro']"
                  >
                    {feature.title}
                  </motion.div>
                  <motion.div
                    key={`desc-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 0.5, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-xs font-normal font-['SF Pro'] leading-[18px]"
                  >
                    {feature.description}
                  </motion.div>
                </div>

              </div>
            )}
          </>
        ))}
        <div className="h-[80%] rounded-xl justify-start items-start inline-flex overflow-hidden">
          <div className="w-[50%] ml-[25%] h-fit flex flex-row gap-2 ">
            <video
              ref={videoRefs[0]}
              src={features[0].video}
              className={`rounded-lg w-full h-full object-cover ${currentFeature === 0 ? "flex" : "hidden"}`}
              muted
              autoPlay
              playsInline
              loop
            />
            <video
              ref={videoRefs[1]}
              src={features[1].video}
              className={`rounded-lg w-full h-full object-cover inset-0 ${currentFeature === 1 ? "flex" : "hidden"}`}
              muted
              autoPlay
              playsInline
              loop
            />
            <video
              ref={videoRefs[2]}
              src={features[2].video}
              className={`rounded-lg w-full h-full object-cover inset-0 ${currentFeature === 2 ? "flex" : "hidden"}`}
              muted
              autoPlay
              playsInline
              loop
            />
            <video
              ref={videoRefs[3]}
              src={features[3].video}
              className={`rounded-lg w-full h-full object-cover inset-0 ${currentFeature === 3 ? "flex" : "hidden"}`}
              muted
              autoPlay
              playsInline
              loop
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="text-xs font-['SF Pro']" onClick={handleNextClick}>
            Continue
          </Button>
          {process.env.NODE_ENV === "development" && (
            <>
              <Button className="text-xs font-['SF Pro']" onClick={handleBackClick}
                style={{ background: vscInputBackground }}
              >
                Back (shown in dev)
              </Button>
              <Button className="text-xs font-['SF Pro']" onClick={resetVideos}
                style={{ background: vscInputBackground }}
              >reset (shown in dev)</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

