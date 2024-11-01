'use client'

import { useState, useContext, useEffect } from 'react';
import Features from './Features';
import ImportExtensions from './ImportExtensions';
import AddToPath from './AddToPath';
import FinalStep from './FinalStep';
import SignIn from './SignIn';
import { IdeMessengerContext } from '@/context/IdeMessenger';

export default function Welcome() {
  const [step, setStep] = useState<'features' | 'import-extensions' | 'add-to-path' | 'final'>('features');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  const ideMessenger = useContext(IdeMessengerContext);

  useEffect(() => {
    const checkUserSignedIn = async () => {
      const res = await ideMessenger.request("getPearAuth", undefined);
      setIsSignedIn(res?.accessToken ? true : false);
    };

    checkUserSignedIn();
  }, [ideMessenger]);

  const handlePreviousStep = () => {
    if (step === 'import-extensions') {
      setStep('features');
    } else if (step === 'add-to-path') {
      setStep('import-extensions');
    } else if (step === 'final') {
      setStep('add-to-path');
    }
  };

  const handleNextStep = () => {
    if (step === 'features') {
      setStep('import-extensions');
    } else if (step === 'import-extensions') {
      setStep('add-to-path');
    } else if (step === 'add-to-path') {
      setStep('final');
    }
  };

  switch (step) {
    case 'features':
      return <Features onNext={handleNextStep} />;
    case 'import-extensions':
      return <ImportExtensions onBack={handlePreviousStep} onNext={handleNextStep} />;
    case 'add-to-path':
      return <AddToPath onBack={handlePreviousStep} onNext={handleNextStep} />;
    case 'final':
      return <FinalStep onBack={handlePreviousStep} isUserSignedIn={isSignedIn} />;
    default:
      return null;
  }
}
