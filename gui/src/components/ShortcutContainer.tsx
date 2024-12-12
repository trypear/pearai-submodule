import { useContext, useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import styled from "styled-components";
import { IdeMessengerContext } from "../context/IdeMessenger";

// Check if the platform is macOS or Windows
const platform = navigator.userAgent.toLowerCase();
const isMac = platform.includes("mac");

type ShortcutProps = {
  modifiers: string[];
  keyCode: string;
  description: string;
  onClick?: () => void;
};

const Shortcut = ({
  modifiers,
  keyCode,
  description,
  onClick,
}: ShortcutProps) => {
  const modifierString = modifiers.join(" + ");

  return (
    <div className ="flex gap-2 bg-red items-center cursor-pointer select-none " onClick={onClick}>
      <div
        className="flex gap-1 items-center text-sm rounded-lg px-1 py-1 mt-0 mx-[2px] border-solid shortcut-border border-[1px]">
        <div
          className="monaco-keybinding "
          aria-label={`${modifierString}+${keyCode}`}
        >
          {modifiers.map((mod, index) => (
            <span
              className="monaco-keybinding-key"
              style={{ fontSize: "10px" }}
              key={index}
            >
              {mod}
            </span>
          ))}
          <span className="monaco-keybinding-key" style={{ fontSize: "10px" }}>
            {keyCode}
          </span>
        </div>
      </div>
      <span className={`text-[11px]`}>{description}</span>
    </div>

  );
};

const ShortcutContainer = () => {
  const ideMessenger = useContext(IdeMessengerContext);
  const shortcutContainerRef = useRef<HTMLDivElement>(null);
  const [modifier] = useState(isMac ? "Cmd" : "Ctrl");

  const shortcuts = [
    {
      modifiers: [modifier],
      keyCode: "E",
      description: "Open Inventory",
      onClick: () => ideMessenger.post("openInventoryHome", undefined),
    },
    {
      modifiers: [modifier],
      keyCode: "\\",
      description: "Big",
      onClick: () => ideMessenger.post("bigChat", undefined),
    },
    {
      modifiers: [modifier],
      keyCode: "0",
      description: "Prev",
      onClick: () => ideMessenger.post("lastChat", undefined),
    },
    {
      modifiers: [modifier],
      keyCode: "H",
      description: "History",
      onClick: () => ideMessenger.post("openHistory", undefined),
    },
    {
      modifiers: [modifier],
      keyCode: ";",
      description: "Close",
      onClick: () => ideMessenger.post("closeChat", undefined),
    },
    {
      modifiers: [modifier, "Shift"],
      keyCode: "L",
      description: "Append Selected",
      onClick: () => ideMessenger.post("appendSelected", undefined),
    },
  ];

  return (
    <div className="absolute bottom-3 mb-4 left-3 flex justify-start">
      <div
        ref={shortcutContainerRef}
        className="flex-col justify-end items-start gap-3 inline-flex"
      >
        {shortcuts.map((shortcut, index) => (
          <Shortcut
            key={`${shortcut.keyCode}-${index}`}
            modifiers={shortcut.modifiers}
            keyCode={shortcut.keyCode}
            description={shortcut.description}
            onClick={shortcut.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ShortcutContainer;
