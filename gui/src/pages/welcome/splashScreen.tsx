import React from 'react';
import { Button } from "@/components/ui/button";

const SplashScreen = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-background text-foreground p-6">
            <img 
                src={`${window.vscMediaUrl}/logos/pearai-green.svg`} 
                alt="PearAI Logo" 
                className="w-32 h-32 mb-4"
            />
            <h1 className="text-3xl font-bold mb-2">Welcome to PearAI</h1>
            <p className="text-center text-lg mb-6">
                Your AI-Powered Code Editor.
            </p>
            <Button onClick={onNext} className="max-w-xs">
            Let's get started!
            </Button>
        </div>
    );
};

export default SplashScreen;
