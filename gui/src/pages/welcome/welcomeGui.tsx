import { useContext, useEffect, useState } from "react";
import Features from "./Features";
import FinalStep from "./FinalStep";
import SetupPage from "./SetupPage";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { WelcomeHeader } from "./WelcomeHeader";
import InventoryPage from "@/inventory/pages/InventoryPage";
import SplashScreen from "./splashScreen";
import { motion, AnimatePresence } from "framer-motion";
import PearSettings from "@/inventory/pearSettings/PearSettings";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Lock the overlay when welcome page mounts
    // this is too late, so overlay is locked at pearai-app level.
    // ideMessenger.post("lockOverlay", undefined);
    ideMessenger.post("hideOverlayLoadingMessage", undefined);

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
    if (step === 3) {
      return navigate("/pearSettings");
    }
    
    setStep((prevStep) => Math.min(prevStep + 1, 4));
  };

  const handleBackStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  return (
    <div className="flex flex-col h-full w-full select-none bg-sidebar-background">
      {/* <WelcomeHeader onBack={handleBackStep} showBack={step > 0} /> */}
      <motion.div
        className={`flex flex-col h-full w-full ${step === 0 ? "flex" : "hidden"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <SplashScreen onNext={handleNextStep} />
      </motion.div>
      <motion.div
        className={`flex flex-col h-full w-full ${step === 1 ? "flex" : "hidden"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 1 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Features onNext={handleNextStep} pseudoRender={step === 1} />
      </motion.div>
      <motion.div
        className={`flex flex-col h-full w-full ${step === 2 ? "flex" : "hidden"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 2 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <SetupPage onNext={handleNextStep} />
      </motion.div>
      <motion.div
        className={`flex flex-col h-full w-full ${step === 3 ? "flex" : "hidden"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 3 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <FinalStep onNext={handleNextStep} startOnboardingAgain={() => setStep(0)} />
      </motion.div>
      <motion.div
        className={`flex flex-col h-full w-full ${step === 4 ? "flex" : "hidden"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 4 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <PearSettings />
      </motion.div>
    </div>
  );
}

