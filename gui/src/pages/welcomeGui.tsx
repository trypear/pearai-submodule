'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bot, Search, Sparkles } from "lucide-react"


declare global {
    interface Window {
      vscMediaUrl: string;
    }
  }
  
  // Function to get correct asset path (FOR GIFs)
  const getAssetPath = (assetName: string) => {
    return `${window.vscMediaUrl}/assets/${assetName}`;
  }
  
  console.dir(window.vscMediaUrl);

export default function Welcome() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef<NodeJS.Timeout>()
  const FEATURE_DURATION = 5000 // TODO: 5 seconds per feature, to be changed individually when have final demo gifs

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "PearAI Assistant",
      description: "Ask Assistant to help you understand code and make changes, powered by Continue.",
      video: getAssetPath('high-def.png'),
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: "PearAI Create",
      description: "Generate code and solutions with AI assistance.",
      video: getAssetPath('pearai-@file.gif')
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "PearAI Search",
      description: "Search through your codebase intelligently.",
      video: getAssetPath('pearai-CMD+I.gif')
    }
  ]

  useEffect(() => {
    // Start progress animation
    const startTime = Date.now()
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / FEATURE_DURATION) * 100

      if (newProgress >= 100) {
        // Move to next feature
        setCurrentFeature(current => (current + 1) % features.length)
        setProgress(0)
        clearInterval(progressInterval.current)
      } else {
        setProgress(newProgress)
      }
    }, 50)

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [currentFeature])

  const startWalkthrough = () => {
    setCurrentFeature(0)
    setProgress(0)
  }
  return (
    <div className="flex w-full overflow-hidden bg-primary text-foreground">
      {/* Left side - Content */}
      <div className="w-[30%] min-w-[300px] max-w-[400px] flex flex-col h-screen">
        {/* Content section scrollable if user's screen small */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 lg:space-y-10">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-button-foreground mb-2">Welcome to PearAI.</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Speed up your development process by seamlessly integrating AI into your workflow.
              </p>
            </div>
            <div className="space-y-3 md:space-y-4 lg:space-y-5">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`bg-input border-none p-3 md:p-4 transition-colors ${
                    currentFeature === index 
                      ? 'bg-input' 
                      : 'bg-input opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-foreground shrink-0">
                      {feature.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-button-foreground text-sm md:text-base">{feature.title}</h3>
                      {currentFeature === index && 
                      <p className="text-xs md:text-sm text-foreground mt-1">{feature.description}</p>}
                      {currentFeature === index && (
                        <Progress 
                          value={progress} 
                          className="mt-2 md:mt-3 h-1 bg-input [&>div]:bg-button"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
  
        {/* Button section at bottom - ALWAYS Fixed position */}
        <div className="p-4 md:p-6 lg:p-10 border-t border-input shrink-0">
          <Button 
            className="w-full text-button-foreground p-4 md:p-5 lg:p-6 text-sm md:text-base"
            onClick={startWalkthrough}
          >
            Start walkthrough (2 minutes)
          </Button>
        </div>
      </div>
  
      {/* Right side - Video/Demo */}
      <div className="flex-1 relative">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              currentFeature === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={feature.video}
              alt={`${feature.title} demonstration`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>    
  )  
}