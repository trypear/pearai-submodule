import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, Search } from "lucide-react";

interface StatusViewProps {
  children: React.ReactNode;
}

const StatusViewLayout = ({ children }: StatusViewProps) => (
  <div className="max-w-2xl mx-auto w-full h-[calc(100vh-120px)] text-center flex flex-col justify-center">
    <div className="relative w-full text-center flex flex-col items-center justify-center gap-5">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[#754ae9]/5 blur-3xl rounded-full" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-[#754ae9]/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-transparent via-[#754ae9]/20 to-transparent" />
      
      {/* Content */}
      <div className="relative">
        <img
          src={getLogoPath("pearai-memory-splash.svg")}
          alt="PearAI Memory Splash"
          className="relative z-10 opacity-80"
        />
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#754ae9] animate-pulse" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  </div>
);

const ContentWrapper = ({ children }: StatusViewProps) => (
  <div className="w-[300px] flex-col justify-start items-start gap-5 inline-flex backdrop-blur-sm">
    <div className="relative flex flex-col text-left">
      <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#754ae9]/30 to-transparent" />
      {children}
    </div>
  </div>
);

const StatusTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-2xl font-['SF Pro'] text-foreground/90 flex items-center gap-2">
    {children}
  </div>
);

const StatusDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-normal font-['SF Pro'] leading-[18px] text-[#754ae9]/70">
    {children}
  </div>
);

export const DisabledView = ({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) => {
  const navigate = useNavigate();
  
  return (
    <StatusViewLayout>
      <ContentWrapper>
        <StatusTitle>
          <Brain className="w-6 h-6 text-[#754ae9]" />
          PearAI Memory Disabled.
        </StatusTitle>
        <StatusDescription>
          {hasUnsavedChanges ? (
            "Unsynchronized memory fragments detected"
          ) : (
            <>
              Enable via{" "}
              <span
                className="cursor-pointer text-[#754ae9] hover:text-[#754ae9]/80 underline decoration-[#754ae9]/30 transition-colors"
                onClick={() => navigate("/inventory")}
              >
                PearAI Settings
              </span>
            </>
          )}
        </StatusDescription>
      </ContentWrapper>
    </StatusViewLayout>
  );
};

export const UpdatingView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <StatusTitle>
        <div className="relative">
          <Brain className="w-6 h-6 text-[#754ae9] animate-pulse" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#754ae9] animate-pulse" />
        </div>
        Synchronizing Memories
      </StatusTitle>
      <StatusDescription>
        Stabilizing memory fragments...
      </StatusDescription>
    </ContentWrapper>
  </StatusViewLayout>
);

export const LoadingView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <StatusTitle>
        <Search className="w-6 h-6 text-[#754ae9] animate-pulse" />
        Accessing Memory Database
      </StatusTitle>
      <StatusDescription>
        Retrieving memory fragments...
      </StatusDescription>
    </ContentWrapper>
  </StatusViewLayout>
);

export const EmptyView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <StatusTitle>
        <Brain className="w-6 h-6 text-[#754ae9]" />
        Memory System Online
      </StatusTitle>
      <StatusDescription>
        Ready to store new memory fragments
      </StatusDescription>
    </ContentWrapper>
    <div className="relative w-[300px] mt-4 p-4 text-left text-xs font-mono text-[#754ae9]/60 border border-[#754ae9]/20 rounded bg-background/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-[#754ae9]/5 to-transparent opacity-50" />
      <div className="relative">
        Memory augmentation system v1.0 initialized. Enhanced by Claude 3.5 Sonnet's neural architecture. System capable of advanced pattern recognition, contextual analysis, and adaptive learning. Ready to process and store new memory fragments.
      </div>
    </div>
  </StatusViewLayout>
);

export const NoResultsView = () => (
  <StatusViewLayout>
    <ContentWrapper>
      <StatusTitle>
        <Search className="w-6 h-6 text-[#754ae9]" />
        Fragment Not Found
      </StatusTitle>
      <StatusDescription>
        No matching memory fragments in current sequence
      </StatusDescription>
    </ContentWrapper>
  </StatusViewLayout>
); 