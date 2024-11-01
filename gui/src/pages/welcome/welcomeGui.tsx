import { useContext, useEffect, useState } from 'react';
import Features from './Features';
import ImportExtensions from './ImportExtensions';
import AddToPath from './AddToPath';
import FinalStep from './FinalStep';
import { IdeMessengerContext } from '@/context/IdeMessenger';

export default function Welcome() {
  const ideMessenger = useContext(IdeMessengerContext);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await ideMessenger.request("getPearAuth", undefined);
        setIsUserSignedIn(!!res?.accessToken);
      } catch (error) {
        console.error("Failed to get auth status:", error);
        setIsUserSignedIn(false);
      }
    };

    checkAuthStatus();
  }, [ideMessenger]);

  const handleNextStep = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handleBackStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Features onNext={handleNextStep} />;
      case 1:
        return <ImportExtensions onNext={handleNextStep} onBack={handleBackStep} />;
      case 2:
        return <AddToPath onNext={handleNextStep} onBack={handleBackStep} />;
      case 3:
        return <FinalStep isUserSignedIn={isUserSignedIn} onBack={handleBackStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {renderStep()}
    </div>
  );
}
