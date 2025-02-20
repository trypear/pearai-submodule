import React from 'react';
import { Button } from "@/components/ui/button";
import { getLogoPath } from './setup/ImportExtensions';
import InventoryButtons from './inventoryButtons';

const SplashScreen = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="h-full flex-col justify-center items-center gap-10 inline-flex overflow-hidden select-none">
            <div className="max-w-2xl mx-auto text-center flex flex-col gap-7 justify-center">
                <InventoryButtons />
                <div className="flex-col justify-start items-start gap-7 flex">
                    <img src={getLogoPath("pearai-chat-splash.svg")} alt="..." />
                </div>
                <div className="text-4xl font-['SF Pro']">Welcome to PearAI</div>
                <Button className="mx-auto w-[300px] rounded-lg justify-center items-center gap-1 inline-flex overflow-hidden" onClick={onNext}>
                    <div className="text-xs font-['SF Pro']">Continue</div>
                </Button>
            </div>
        </div>
    );
};

export default SplashScreen;
