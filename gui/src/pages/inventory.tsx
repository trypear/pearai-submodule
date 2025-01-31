import { CogIcon } from "@heroicons/react/24/outline";
import InventoryPage from "../inventory/pages/InventoryPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebviewListener } from "@/hooks/useWebviewListener";
import AiderGUI from "@/integrations/aider/aidergui";
import Mem0GUI from "@/integrations/mem0/mem0gui";
import PearAIWrappedGUI from "@/integrations/pearaiWrapped/pearaiWrappedGui";
import PerplexityGUI from "@/integrations/perplexity/perplexitygui";
import HomePage from "@/inventory/pages/HomePage";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { DEVELOPER_WRAPPED_FEATURE_FLAG } from "@/util/featureflags";
import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Tab {
  id: string;
  name: string;
  component: React.ReactNode;
  shortcut: ReactNode;
  icon: string;
  featureflag?: boolean;
}

const tabs: Tab[] = [
  {
    id: "inventory",
    name: "Inventory Settings",
    component: <InventoryPage />,
    shortcut: <><kbd className="ml-[1.5px]">SHIFT</kbd><kbd className="ml-[1.5px]">1</kbd></>,
    icon: "inventory.svg",
  },
  {
    id: "home",
    name: "Inventory",
    component: <HomePage />,
    shortcut: <kbd className="ml-[1.5px]">1</kbd>,
    icon: "inventory.svg",
  },
  {
    id: "aiderMode",
    name: "Creator",
    component: <AiderGUI />,
    shortcut: <kbd className="ml-[1.5px]">2</kbd>,
    icon: "creator-default.svg",
  },
  {
    id: "perplexityMode",
    name: "Search",
    component: <PerplexityGUI />,
    shortcut: <kbd className="ml-[1.5px]">3</kbd>,
    icon: "search-default.svg",
  },
  {
    id: "mem0Mode",
    name: "Memory",
    component: <Mem0GUI />,
    shortcut: <kbd className="ml-[1.5px]">4</kbd>,
    icon: "memory-default.svg",
  },
  {
    id: "wrappedMode",
    name: "Wrapped 2024",
    featureflag: DEVELOPER_WRAPPED_FEATURE_FLAG,
    component: <PearAIWrappedGUI />,
    shortcut: <kbd className="ml-[1.5px]">5</kbd>,
    icon: "wrapped.svg",
  }
];

interface TabButtonProps {
  id: string;
  name: string;
  shortcut: ReactNode;
  icon: string;

}

export default function Inventory() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const currentTab = location.pathname.split("/").pop() || "home";
  const isMac = navigator.userAgent.toLowerCase().includes("mac");
  const modifierKey = isMac ? '⌘' : "Ctrl";

  useEffect(() => {
    const tab = location.pathname.split("/").pop() || "home";
    setActiveTab(tab);
  }, [location]);

  useWebviewListener("navigateToInventoryHome", () => handleTabChange("home"), []);
  useWebviewListener("navigateToCreator", () => handleTabChange("aiderMode"), []);
  useWebviewListener("navigateToSearch", () => handleTabChange("perplexityMode"), []);
  useWebviewListener("navigateToMem0", () => handleTabChange("mem0Mode"), []);
  useWebviewListener("navigateToWrapped", () => handleTabChange("wrappedMode"), []);
  useWebviewListener("toggleOverlay", () => handleTabChange("inventory"), []);
  useWebviewListener("getCurrentTab", async () => activeTab, [activeTab]);

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    navigate(value === "inventory" ? "/inventory" : `/inventory/${value}`);
  };

  const TabButton = ({ id, name, shortcut, icon }: TabButtonProps) => (
    <TabsTrigger
      value={id}
      className={`text-sm font-medium flex flex-col gap-2 transition-all duration-300 w-[72px] min-w-[72px] ${currentTab === id ? "" : "hover:opacity-80 hover:text-muted-foreground"
        }`}
    >
      {id === "inventory" ? (
        <div className={`w-[40px] h-[40px] rounded-[14px] bg-background flex items-center justify-center ${currentTab === id ? "shadow-[0_0_0_4px_rgba(255,255,255,0.2)]" : ""
          }`}>
          <CogIcon className="h-[44px] w-[44px] text-foreground" />
        </div>
      ) : (
        <div className={`w-[50px] h-[50px] rounded-[14px] ${currentTab === id ? "shadow-[0_0_0_6px_rgba(255,255,255,0.2)]" : ""
          }`}>
          <img src={getLogoPath(icon)} alt={`${name} icon`} />
        </div>
      )}
      <span className={`${currentTab === id ? "" : "opacity-50"} w-full text-center text-wrap hyphens-auto break-words whitespace-normal px-1`}>
        {name}
      </span>
    </TabsTrigger>
  );


  return (
    <div className={`h-full w-full flex flex-col ${activeTab === "home" ? "bg-transparent" : "bg-sidebar-background"}`}>
      <Tabs
        value={currentTab}
        defaultValue="home"
        onValueChange={handleTabChange}
        className="flex flex-col h-full"
      >
        <div className="flex flex-row h-full">
          <div className="z-10 h-full">
            <TabsList className={` flex flex-col bg-background justify-between h-full ${currentTab === 'home' ? 'hidden' : ''}`}>
              <div className="mt-2 p-3 flex flex-col gap-4">
                {tabs.slice(2).filter(tab => tab.featureflag !== false).map((tab) => (
                  <TabButton key={tab.id} {...tab} />
                ))}
              </div>

              <div className="p-2 pb-4 flex">
                <TabButton {...tabs[0]} />
              </div>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {tabs.filter(tab => tab.featureflag !== false).map(({ id, component }) => (
              <TabsContent
                key={id}
                value={id}
                className="h-full data-[state=active]:flex flex-col"
              >
                {component}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
