import InventoryPage from "../inventory/pages/InventoryPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Gui from "./gui";
import { useLocation } from "react-router-dom";

const TemplateComponent = ({ name }: { name: string }) => {
  return (
    <div className="flex items-center justify-center h-screen text-7xl">
      {name} here
    </div>
  );
};

const tabs = [
  {
    id: "aider",
    name: "Creator (aider)",
    component: <Gui />,
  },
  { id: "inventory", name: "Inventory", component: <InventoryPage /> },
  {
    id: "perplexity",
    name: "Search (Perplexity)",
    component: <TemplateComponent name="Perplexity" />,
  },
];

export default function Inventory() {

  const location =  useLocation();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Tabs defaultValue="inventory" className="flex flex-col h-full">
        <div className="flex flex-col h-full">
          <div className="px-4 pt-4">
            <TabsList className="bg-input text-center">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-[0.60rem]"
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <span className="ml-2">current path : {location.pathname}</span>
          </div>
          
          <div className="flex-1 min-h-0 p-4">
            {tabs.map((tab) => (
              <TabsContent 
                key={tab.id} 
                value={tab.id} 
                className="h-full data-[state=active]:flex flex-col"
              >
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
