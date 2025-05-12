import React from "react";
import { cn } from "@/lib/utils";
import type { NewProjectType } from "core";

interface ProjectTypeButtonProps {
  type: NewProjectType;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  onClick: (type: NewProjectType) => void;
}

export const ProjectTypeButton: React.FC<ProjectTypeButtonProps> = ({
  type,
  label,
  icon,
  selected,
  disabled = false,
  comingSoon = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onClick(type)}
      className={cn(
        "flex flex-col items-center justify-center w-full py-6 px-4 rounded-lg transition-colors",
        "border border-solid",
        selected
          ? "bg-blue-100 border-blue-500 text-blue-600"
          : disabled
          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-gray-100 border-gray-200 text-black hover:bg-gray-200",
        "relative",
      )}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-medium">{label}</div>

      {comingSoon && (
        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          Coming Soon
        </span>
      )}
    </button>
  );
};
