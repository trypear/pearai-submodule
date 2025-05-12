import { lightGray, vscBackground, vscEditorBackground } from "@/components";
import Inventory from "@/pages/inventory";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { title } from "process";
import { useCallback, useContext, useEffect, useState } from "react";
import GeneralSettings from "./general";
import HelpSettings from "./help";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import "@/continue-styles.css";
import { CreatorFeedback } from "./creatorFeedback";
import { useMessaging } from "../../util/messagingContext";

const inventoryItems = [
  {
    id: "chat",
    title: "Chat",
    icon: "chat-default.svg",
  },
  {
    id: "agent",
    title: "Agent",
    icon: "creator-default.svg",
  },
  {
    id: "search",
    title: "Search",
    icon: "search-default.svg",
  },
  {
    id: "memory",
    title: "Memory",
    icon: "memory-default.svg",
  },
] as const;

// Combine settings and inventory items into a single type
type MenuItem = {
  id: string;
  title: string;
  icon?: string;
  section: "settings" | "inventory";
};

const menuItems = [
  // Settings section
  { id: "general", title: "General", section: "settings" },
  { id: "help", title: "Help", section: "settings" },
  { id: "creator-feedback", title: "Creator Feedback", section: "settings" },
  // Inventory section (not using rn)
  // ...inventoryItems.map((item) => ({ ...item, section: "inventory" as const })),
] as const;

const PearSettings = () => {
  const [selectedItem, setSelectedItem] =
    useState<(typeof menuItems)[number]["id"]>("general");
  const ideMessenger = useContext(IdeMessengerContext);

  const { registerListener } = useMessaging();

  useEffect(() => {
    // Register listener for theme color updates using the messaging context

    return registerListener("tab", (msg: any) => {
      const typedMsg = msg as {
        payload: { tab: (typeof menuItems)[number]["id"] };
      };
      setSelectedItem(typedMsg.payload.tab);
    });
  }, [registerListener, setSelectedItem]);

  return (
    <div
      className="flex items-center justify-center h-full border-4 border-solidd border-red-500"
      onClick={(e) => {
        if (e.target === e.currentTarget)
          ideMessenger.post("closeOverlay", undefined);
      }}
    >
      <div className="min-h-[80%] min-w-[80%] max-h-[80%] max-w-[80%] flex overflow-auto no-scrollbar rounded-xl bg-sidebar-background border-4 border-solidd border-green-500">
        <div className="flex border-4 border-solidd border-purple-400">
          <Sidebar selectedItem={selectedItem} onSelectItem={setSelectedItem} />
        </div>
        <ContentArea selectedItem={selectedItem} />
      </div>
    </div>
  );
};

const Sidebar = ({
  selectedItem,
  onSelectItem,
}: {
  selectedItem: string;
  onSelectItem: (id: (typeof menuItems)[number]["id"]) => void;
}) => {
  return (
    <div
      className="p-2 w-44 flex flex-col items-start justify-start bg-sidebar-background"
      style={{ borderRight: `1px solid ${lightGray}20` }}
    >
      {/* Settings Section */}
      <SidebarSection
        title="SETTINGS"
        items={menuItems.filter((item) => item.section === "settings")}
        selectedItem={selectedItem}
        onSelectItem={onSelectItem}
      />

      {/* Inventory Section */}
      {/* <SidebarSection
                title="INVENTORY"
                items={menuItems.filter(item => item.section === 'inventory')}
                selectedItem={selectedItem}
                onSelectItem={onSelectItem}
            /> */}
    </div>
  );
};

const SidebarSection = ({
  title,
  items,
  selectedItem,
  onSelectItem,
}: {
  title: string;
  items: MenuItem[];
  selectedItem: string;
  onSelectItem: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col w-full border-solidd border-yellow-400">
      <div className="flex px-2 pt-5 pb-2 justify-center items-center gap-1">
        <div className="grow opacity-50 text-[10px] font-bold font-['SF Pro'] tracking-tight">
          {title}
        </div>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectItem(item.id)}
          className={`self-stretch p-2 rounded-lg justify-start items-center gap-2 inline-flex overflow-hidden cursor-pointer  ${
            selectedItem === item.id ? "bg-list-hoverBackground" : ""
          }`}
        >
          {item?.icon && (
            <div className="flex-shrink-0 w-7 flex items-center justify-center">
              <img src={getLogoPath(item?.icon)} className="size-6 mr-1" />
            </div>
          )}
          <div className="text-xs font-normal font-['SF Pro']">
            {item.title}
          </div>
        </div>
      ))}
    </div>
  );
};

const ContentArea = ({ selectedItem }: { selectedItem: string }) => {
  return (
    <div className="flex flex-col w-full p-5 overflow-y-auto no-scrollbar overflow-x-hidden border-3 border-solidd border-red-300">
      {/* Add your content components here based on selectedItem */}
      {selectedItem === "general" && <GeneralSettings />}
      {selectedItem === "help" && <HelpSettings />}
      {selectedItem === "creator-feedback" && <CreatorFeedback />}
    </div>
  );
};

const SearchIconSVG = () => {
  return (
    <div data-svg-wrapper>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.96544 11.0261C9.13578 11.6382 8.11014 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7C12 8.11014 11.6382 9.13578 11.0261 9.96544L13.7803 12.7197C14.0732 13.0126 14.0732 13.4874 13.7803 13.7803C13.4874 14.0732 13.0126 14.0732 12.7197 13.7803L9.96544 11.0261ZM10.5 7C10.5 8.933 8.933 10.5 7 10.5C5.067 10.5 3.5 8.933 3.5 7C3.5 5.067 5.067 3.5 7 3.5C8.933 3.5 10.5 5.067 10.5 7Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

export default PearSettings;
