import {
  CodeBracketIcon,
  PlayIcon,
  DocumentTextIcon as OutlineDocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./button";
import { DocumentTextIcon as SolidDocumentTextIcon } from "@heroicons/react/24/solid";
import { FC } from "react";
import { cn } from "../../../lib/utils";

export type PlanningBarProps = {
  isGenerating?: boolean;
  requestedPlan: string;
  playCallback?: () => void;
  nextCallback?: () => void;
  className?: string;
};

export const PlanningBar: FC<PlanningBarProps> = ({
  isGenerating,
  requestedPlan,
  playCallback,
  nextCallback,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-[#161718] w-full rounded-full flex text-white justify-between min-w-64 h-10 gap-4 relative",
        className,
      )}
    >
      {isGenerating && <div className="absolute inset-0 rainbow-border-glow" />}
      <div className="flex-1 flex h-full align-middle ml-5 gap-4 relative">
        <div className="relative h-full my-auto mr-1">
          <div className={`circle ${isGenerating ? "animated-circle" : ""}`} />
        </div>
        <div className="my-auto text-sm">Planning</div>
        <div className="relative my-auto">
          <div className="text-muted-foreground text-sm max-w-64 text-ellipsis truncate">
            {requestedPlan}
          </div>
        </div>
      </div>

      <div className="flex justify-center align-middle mr-2 gap-4">
        <div className="my-auto">
          <Button variant="default" toggled>
            <SolidDocumentTextIcon />
          </Button>
          <Button>
            <CodeBracketIcon />
          </Button>
          <Button onClick={playCallback}>
            <PlayIcon />
          </Button>
        </div>
        <Button
          size="default"
          variant="secondary"
          className="my-auto rounded-lg text-[0.9em]"
          onClick={nextCallback}
        >
          Next
        </Button>
        {/* <ArrowTurnDownLeftIcon className="size-4" /> */}
      </div>
    </div>
  );
};
