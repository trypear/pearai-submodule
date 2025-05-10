import {
  CodeBracketIcon,
  PlayIcon,
  DocumentTextIcon as OutlineDocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./button";
import { DocumentTextIcon as SolidDocumentTextIcon } from "@heroicons/react/24/solid";
import { FC } from "react";
import { cn } from "../../../lib/utils";
import { RGBWrapper } from "../rgbBackground";

export type PlanningBarProps = {
  isStreaming?: boolean;
  requestedPlan: string;
  playCallback?: () => void;
  nextCallback?: () => void;
  className?: string;
};

export const PlanningBar: FC<PlanningBarProps> = ({
  isStreaming,
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
      <div
        className={` ${isStreaming ? "rainbow-border-glow-visible" : ""}
            absolute inset-0 rainbow-border-glow -z-10 blur rounded-full`}
      />
      <div className="flex-1 flex h-full align-middle ml-5 gap-4 relative ">
        <div className="relative h-full my-auto mr-1">
          <div className={`circle ${isStreaming ? "animated-circle" : ""}`} />
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
          <Button
            variant="default"
            toggled
            className="bg-blue-700/60 hover:bg-blue-700/60 rounded-r-none"
          >
            <SolidDocumentTextIcon />
          </Button>
          <Button className="rounded-r-none bg-black hover:bg-black">
            <CodeBracketIcon />
          </Button>
        </div>
        <Button
          size="default"
          variant="secondary"
          className="my-auto rounded-lg text-[0.9em] cursor-pointer"
          onClick={nextCallback}
          disabled={isStreaming}
        >
          Next
        </Button>
        {/* <ArrowTurnDownLeftIcon className="size-4" /> */}
      </div>
    </div>
  );
};
