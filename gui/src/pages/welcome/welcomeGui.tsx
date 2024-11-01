'use client'

import { useState, useContext, useEffect } from 'react';
import { Collapse } from 'react-collapse';
import Features from './Features';
import ImportExtensions from './ImportExtensions';
import AddToPath from './AddToPath';
import FinalStep from './FinalStep';
import SignIn from './SignIn';
import { IdeMessengerContext } from '@/context/IdeMessenger';

export default function Welcome() {
  const [step, setStep] = useState(0);
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

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="flex flex-col space-y-4">
      <Collapse isOpened={step === 0}>
        <Features onNext={handleNextStep} />
      </Collapse>
      <Collapse isOpened={step === 1}>
        <ImportExtensions onNext={handleNextStep} />
      </Collapse>
      <Collapse isOpened={step === 2}>
        <AddToPath onNext={handleNextStep} />
      </Collapse>
      <Collapse isOpened={step === 3}>
        <FinalStep isUserSignedIn={isSignedIn} />
      </Collapse>
    </div>
  );
}
