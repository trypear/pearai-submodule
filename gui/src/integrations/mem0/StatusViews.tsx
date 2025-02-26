import { Button } from "@/components/ui/button";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, Search } from "lucide-react";
import { useContext } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";

interface StatusViewProps {
  children: React.ReactNode;
}

const StatusViewLayout = ({ children }: StatusViewProps) => (
  <div className="max-w-2xl mx-auto w-full h-[calc(100vh-120px)] text-center flex flex-col justify-center">
    <div className="w-full text-center flex flex-col items-center justify-center relative gap-5">
      <img
        src={getLogoPath("pearai-memory-splash.svg")}
        alt="PearAI Memory Splash"
      />
      {children}
    </div>
  </div>
);

const ContentWrapper = ({ children }: StatusViewProps) => (
  <div className="w-[300px] flex-col justify-start items-start gap-5 inline-flex">
    <div className="flex flex-col text-left">
      {children}
    </div>
  </div>
);

export const DisabledView = ({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) => {
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);


  return (
    <StatusViewLayout>
      <ContentWrapper>
        <div className="text-2xl font-['SF Pro']">PearAI Memory Disabled</div>
        <div className="opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
          {hasUnsavedChanges ? (
            "You have unsaved changes to memories"
          ) : (
            <>
              PearAI Memory is disabled. You can enable it in{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => ideMessenger.post("openInventorySettings", undefined)}
              >
                Inventory Settings
              </span>
              .
            </>
          )}
        </div>
      </ContentWrapper>
    </StatusViewLayout>
  );
};

export const UpdatingView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <div className="text-2xl font-['SF Pro']">Updating Memories...</div>
      <div className="opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
        please wait while we save your changes
      </div>
    </ContentWrapper>
  </StatusViewLayout>
);

export const LoadingView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <div className="text-2xl font-['SF Pro']">Loading Memories...</div>
      <div className="opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
        Powered by Mem0
      </div>
    </ContentWrapper>
  </StatusViewLayout>
);

export const EmptyView = ({ onAddMemory }: { onAddMemory: () => void }) => (
  <div className="max-w-2xl mx-auto w-full h-[calc(100vh-210px)] text-center flex flex-col justify-center" >
    <div className="w-full h-[700px] text-center flex flex-col items-center justify-center relative gap-5">

      <div className="flex-1 flex absolute bottom-[260px] items-center justify-center">
        <img
          src={getLogoPath("pearai-memory-splash.svg")}
          alt="PearAI Search Splash"
        />
      </div>

      <div className="w-[300px] h-[240px] absolute bottom-0 overflow-hidden flex-col justify-start items-start gap-5 inline-flex">
        <div className="flex flex-col text-left">
          <div className="text-2xl font-['SF Pro']">PearAI Memory</div>
          <div className="h-[18px] opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">Powered by Mem0</div>
        </div>
        <div className="w-[300px] h-[140px] overflow-hidden text-left opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
          PearAI Memory is a self-improving memory layer when you use PearAI Chat for a personalized experience. Memories will be added automatically, and you can also add memories manually.
        </div>
        <div className="w-[300px] h-[100px] overflow-hidden text-left opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
          No memories yet– PearAI Memory automatically remembers coding information as you use PearAI Chat.
        </div>

        <Button
          variant="secondary"
          className="w-[300px] flex items-center gap-2"
          onClick={onAddMemory}
        >
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="w-5 h-5" />
            <span className="flex items-center">Add Memory</span>
          </div>
        </Button>
      </div>

    </div>
  </div>
);

export const NoResultsView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <div className="text-2xl font-['SF Pro']">No Memories Found</div>
      <div className="opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
        No memories match your search
      </div>
    </ContentWrapper>
  </StatusViewLayout>
);
