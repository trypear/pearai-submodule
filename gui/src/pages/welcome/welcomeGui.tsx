'use client'

import { useState, useContext, useMemo } from 'react';
import Features from './Features';
import ImportExtensions from './ImportExtensions';
import AddToPath from './AddToPath';
import FinalStep from './FinalStep';
import { IdeMessengerContext } from '@/context/IdeMessenger';

export default function Welcome() {
  const [step, setStep] = useState<'features' | 'import-extensions' | 'add-to-path' | 'final'>('features');

  const ideMessenger = useContext(IdeMessengerContext);

















































  const isUserSignedIn = useMemo(() => {
    return ideMessenger.request("getPearAuth", undefined).then((res) => {
      return res?.accessToken ? true : false;
    });
  }, [ideMessenger]);

  const handleNextStep = () => {
    if (step === 'features') {
      setStep('import-extensions');
    } else if (step === 'import-extensions') {
      setStep('add-to-path');
    } else if (step === 'add-to-path') {
      setStep('final');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'import-extensions') {
      setStep('features');
    } else if (step === 'add-to-path') {
      setStep('import-extensions');
    } else if (step === 'final') {
      setStep('add-to-path');
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
      return <FinalStep onBack={handlePreviousStep} isUserSignedIn={isUserSignedIn} />;
    default:
      return null;
  }
}
