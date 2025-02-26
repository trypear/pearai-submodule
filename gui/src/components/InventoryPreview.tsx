import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";

const menuItems = [
  {
    icon: "chat-default.svg",
    path: "/inventory",
    tooltip: "Inventory",
    command: "pearai.toggleInventoryHome",
  },
  {
    icon: "search-default.svg",
    path: "/inventory/perplexityMode",
    tooltip: "Search",
    command: "pearai.toggleSearch",
  },
  {
    icon: "memory-default.svg",
    path: "/inventory/mem0Mode",
    tooltip: "Memory",
    command: "pearai.toggleMem0",
  }
];

const InventoryPreview = () => {
  return (
    <div className={`my-2 relative w-full z-10 select-none`}>
      <div
        className="flex cursor-pointer"
      >
        <div className="flex flex-row items-center">
          <div className="overflow-hidden rounded-[12px] relative">
            <div
              className="absolute inset-0 pointer-events-none rounded-[12px]"
              style={{
                boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)'
              }}
            />
            <div className="flex gap-[6px] bg-clip-border bg-input px-[6px] py-[4px] cursor-pointer">
              {menuItems.map((item, index) => (
                <div
                  key={`${item.command}-${index}`}
                  className="relative group w-6 h-6 rounded-lg"
                  title={item.tooltip}
                >
                  <a href={`command:${item.command}`}>
                    <img
                      src={getLogoPath(item.icon)}
                      className="w-6 h-6 rounded-lg"
                      style={index === 0 ? {
                        boxShadow: '0px 0px 40px 8px #AFF349'
                      } : undefined}
                    />
                  </a>
                  {index === 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.5)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InventoryPreview;
