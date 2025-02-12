import { useContext, useRef, useState } from "react";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { ShortcutButton } from "./ui/shortcutButton";

const platform = navigator.userAgent.toLowerCase();
const isMac = platform.includes("mac");

const ShortcutContainer = () => {
  const ideMessenger = useContext(IdeMessengerContext);
  const shortcutContainerRef = useRef<HTMLDivElement>(null);
  const [modifier] = useState(isMac ? "⌘" : "Ctrl");

  const shortcuts = [
    {
      keys: [modifier, "E"],
      description: "Open Inventory Settings",
      onClick: () => ideMessenger.post("openInventorySettings", undefined),
    },
    {
      keys: [modifier, "\\"],
      description: "Big",
      onClick: () => ideMessenger.post("bigChat", undefined),
    },
    {
      keys: [modifier, "0"],
      description: "Prev",
      onClick: () => ideMessenger.post("lastChat", undefined),
    },
    {
      keys: [modifier, "H"],
      description: "History",
      onClick: () => ideMessenger.post("openHistory", undefined),
    },
    {
      keys: [modifier, ";"],
      description: "Close",
      onClick: () => ideMessenger.post("closeChat", undefined),
    },
    {
      keys: [modifier, "⇧", "L"], // Using ⇧ symbol for Shift
      description: "Append Selected",
      onClick: () => ideMessenger.post("appendSelected", undefined),
    },
  ];

  return (
    <div className="pb-3 flex justify-center w-full">
      <div
        ref={shortcutContainerRef}
        className="flex-col gap-2 w-full max-w-3xl inline-flex"
      >
        {shortcuts.map((shortcut, index) => (
          <ShortcutButton
            key={`${shortcut.keys.join("-")}-${index}`}
            keys={shortcut.keys}
            label={shortcut.description}
            onClick={shortcut.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ShortcutContainer;