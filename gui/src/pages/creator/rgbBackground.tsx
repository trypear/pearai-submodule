import { cn } from "@/lib/utils";
import React, { FC, ReactNode } from "react";

/**
 * RGB gradient border wrapper
 */
export const RGBWrapper: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(className, "relative")}>
      {/* RGB Gradient Border */}
      <div
        className="absolute inset-0 -z-10 rounded-xl opacity-75 blur-[30px]"
        style={{
          border: "40px solid transparent",
          borderImage:
            "linear-gradient(to bottom right, #5DED83 0%, #0CBBAF 33%, #764CEA 66%, #EA50A2 100%) 1",
        }}
      ></div>

      {/* Content */}
      {children}
    </div>
  );
};
