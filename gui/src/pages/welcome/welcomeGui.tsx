import { useContext, useEffect, useState } from "react";
import Features from "./Features";
import FinalStep from "./FinalStep";
import SetupPage from "./SetupPage";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { WelcomeHeader } from "./WelcomeHeader";
import InventoryPage from "@/inventory/pages/InventoryPage";
import SplashScreen from "./splashScreen";

export default function Welcome() {
  const ideMessenger = useContext(IdeMessengerContext);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Lock the overlay when welcome page mounts
    ideMessenger.post("lockOverlay", undefined);

    // Cleanup - unlock when component unmounts
    return () => {
      ideMessenger.post("unlockOverlay", undefined);
    };
  }, []);

  useEffect(() => {
    if (step === 3) {
      ideMessenger.post("unlockOverlay", undefined);
    }
  }, [step]);

  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  useEffect(() => {
    const checkUserSignInStatus = async () => {
      try {
        const res = await ideMessenger.request("getPearAuth", undefined);
        const signedIn = res?.accessToken ? true : false;
        setIsUserSignedIn(signedIn);
        console.dir("User signed in:");
        console.dir(signedIn);
      } catch (error) {
        console.error("Error checking user sign-in status:", error);
      }
    };

    checkUserSignInStatus();
  }, [ideMessenger]); // Dependency array ensures this runs once when the component mounts

  const handleNextStep = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 4));
  };

  const handleBackStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <WelcomeHeader onBack={handleBackStep} showBack={step > 0} />
      <>
        <div className={`flex flex-col h-full w-full ${step === 0 ? "flex" : "hidden"}`}>
          <SplashScreen onNext={handleNextStep} />
        </div>
        <div className={`flex flex-col h-full w-full ${step === 1 ? "flex" : "hidden"}`}>
          <Features onNext={handleNextStep} />
        </div>
        <div className={`flex flex-col h-full w-full ${step === 2 ? "flex" : "hidden"}`}>
          <SetupPage onNext={handleNextStep} />
        </div>
        <div className={`flex flex-col h-full w-full ${step === 3 ? "flex" : "hidden"}`}>
          <FinalStep onNext={handleNextStep} startOnboardingAgain={() => setStep(0)} />
        </div>
        <div className={`flex flex-col h-full w-full ${step === 4 ? "flex" : "hidden"}`}>
          <InventoryPage />
        </div>
      </>
    </div>
  );
}

