import { useWebviewListener } from "@/hooks/useWebviewListener";
import { getLogoPath } from "./ImportExtensions";

export default function SignIn({ onNext }: { onNext: () => void }) {

  useWebviewListener("pearAISignedIn", async () => {
    onNext();
  });

  return (
    <div className="flex flex-col items-center justify-center md:p-6 lg:p-10 gap-5">
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="text-center text-2xl font-['SF Pro']">Sign in to PearAI</div>
        <div className="opacity-80 text-xs font-normal font-['SF Pro'] leading-[18px]">(Opens in browser)</div>
      </div>
      <img src={getLogoPath("pearai-green.svg")} className="w-36 h-36" alt="PearAI" />
    </div>
  );
}
