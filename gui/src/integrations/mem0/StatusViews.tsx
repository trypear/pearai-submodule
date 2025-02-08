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
                onClick={() => navigate("/inventory")}
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

export const EmptyView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <div className="text-2xl font-['SF Pro']">PearAI Memory</div>
      <div className="opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
        Powered by Mem0
      </div>
    </ContentWrapper>
    <div className="w-[300px] text-left opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
      Thanks to Claude 3.5 Sonnet's agentic coding capabilities, Cline can handle complex software development tasks step-by-step. With tools that can create & edit files, explore complex projects, use the browser, and execute terminal commands (after you grant permission), Cline can assist you in ways that go beyond code completion or tech support. Cline can even use MCP to create new tools and extend it's own capabilities.
    </div>
    <div className="w-[300px] text-left opacity-50 text-xs font-normal font-['SF Pro'] leading-[18px]">
    No memories yet– PearAI Memory automatically remembers coding information as you use PearAI.
    </div>
    <Button variant="secondary" className="w-[300px] flex items-center gap-2">
      <div className="flex items-center gap-2">
        <PencilSquareIcon className="w-5 h-5" />
        <span className="flex items-center">Add Memory</span>
      </div>
    </Button>
  </StatusViewLayout>
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