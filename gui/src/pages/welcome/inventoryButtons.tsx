// This is the inventory buttons that are shown on the splash screen
// These are dummy buttons
import { vscBackground, vscBadgeBackground, vscSidebarBorder } from "@/components";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";

const menuItems = [
    {
        id: "chat",
        icon: "chat-no-bg.svg",
        tooltip: "Chat",
        bgGradient: "bg-gradient-to-b from-[#aff349] to-[#1b9300]",
        textColor: "#e8ffc7",
        glow: "shadow-[0px_0px_57.60000228881836px_9.600000381469727px_rgba(175,243,73,1.00)]"
    },
    {
        id: "creator",
        icon: "creator-no-bg.svg",
        tooltip: "Creator",
        backgroundColor: "bg-gradient-to-b from-[#ff70bc] to-[#cc237e]",
        textColor: "#ffcee3",
        glow: "shadow-[0px_0px_57.60000228881836px_9.600000381469727px_rgba(255,113,189,1.00)]"
    },
    {
        id: "search",
        icon: "search-no-bg.svg",
        tooltip: "Search",
        backgroundColor: "bg-gradient-to-b from-[#12d3cd] to-[#008872]",
        textColor: "#c1fff2",
        glow: "shadow-[0px_0px_57.60000228881836px_9.600000381469727px_rgba(20,210,203,1.00)] "
    },
    {
        id: "memory",
        icon: "mem0-no-bg.svg",
        tooltip: "Memory",
        backgroundColor: "bg-gradient-to-b from-[#9069fe] to-[#582bd3]",
        textColor: "#e0d5ff",
        glow: "shadow-[0px_0px_57.60000228881836px_9.600000381469727px_rgba(142,102,252,1.00)]"
    }
];

const InventoryButtons = ({ activeItemID = "chat" }: { activeItemID?: string }) => {
    return (
        <div className={`z-10 select-none`}>
            <div
                className="flex cursor-pointer"
            >
                <div className="overflow-hidden rounded-xl relative"
                    style={{
                        background: vscSidebarBorder
                    }}
                >
                    <div className="flex gap-1 p-1 cursor-pointer">
                        {menuItems.map((item, index) => (
                            <div
                                key={`${item.tooltip}-${index}`}
                                className={`${item.backgroundColor || item.bgGradient} ${activeItemID === item.id ? item.glow : ""} ${activeItemID !== item.id ? "z-10" : "z-5"} rounded-lg flex items-center justify-center`}
                            >
                                <img
                                    src={getLogoPath(item.icon)}
                                    className="size-5 p-[3px]"
                                    alt={item.tooltip}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
// return (
//     <div className={`my-2 relative w-full z-10 select-none`}>
//         <div
//             className="flex cursor-pointer"
//         >
//             <div className="flex flex-row items-center">
//                 <div className="overflow-hidden rounded-[12px] relative">
//                     <div
//                         className="absolute inset-0 pointer-events-none rounded-[12px]"
//                         style={{
//                             boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)'
//                         }}
//                     />
//                     <div className="flex gap-[6px] bg-clip-border bg-input px-[6px] py-[4px] cursor-pointer">
//                         {menuItems.map((item, index) => (
//                             <div
//                                 key={`${item.tooltip}-${index}`}
//                                 className={`relative flex items-center justify-center group w-6 h-6 rounded-lg `}
//                                 title={item.tooltip}
//                             >
//                                 <img
//                                     src={getLogoPath(item.icon)}
//                                     className="w-4 h-4"
//                                     style={index === 0 ? {
//                                         boxShadow: '0px 0px 40px 8px #AFF349'
//                                     } : undefined}
//                                 />
//                                 {index === 0 && (
//                                     <div
//                                         className="absolute inset-0 pointer-events-none rounded-lg"
//                                         style={{
//                                             boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.5)'
//                                         }}
//                                     />
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>

//     </div>
// );

};


export default InventoryButtons;

