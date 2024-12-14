import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { ShortcutButton } from "./ui/shortcutButton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const InventoryPreview = () => {
    const navigate = useNavigate();
    const ideMessenger = useContext(IdeMessengerContext);
    const historyLength = useSelector((state: RootState) => state.state.history.length);

    const menuItems = [
        {
            icon: "chat-default.svg",
            path: "/inventory/aiderMode",
            tooltip: "Creator",
        },
        {
            icon: "creator-default.svg",
            path: "/inventory/aiderMode",
            tooltip: "Creator",
        },
        {
            icon: "search-default.svg",
            path: "/inventory/perplexityMode",
            tooltip: "Search",
        },
        {
            icon: "memory-default.svg",
            path: "/inventory/mem0Mode",
            tooltip: "Memory",
        }
    ];

    const openInventory = () => {
        ideMessenger.post("openInventoryHome", undefined);
    };

    return (
        <div className="justify-center  w-full">

            <div
                onClick={openInventory}
                className="z-10 flex max-w-3xl mx-auto relative pt-1"
            >            <div className="flex flex-row items-center">
                    <div className="overflow-hidden rounded-[12px] relative">
                        <div
                            className="absolute inset-0 pointer-events-none rounded-[12px]"
                            style={{
                                boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)'
                            }}
                        />
                        <div className="flex gap-[6px] bg-clip-border bg-input p-[4px] cursor-pointer">
                            {menuItems.map((item, index) => (
                                <div
                                    key={item.path}
                                    className="relative group w-6 h-6 rounded-lg"
                                >
                                    <img
                                        src={getLogoPath(item.icon)}
                                        className="w-6 h-6 rounded-lg"
                                        style={index === 0 ? {
                                            boxShadow: '0px 0px 40px 8px #AFF349'
                                        } : undefined}
                                    />
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

                    <div className="ml-1">
                        <ShortcutButton keys={["⌘", "E"]} label={"Inventory"} labelInside={true} />
                    </div>
                </div>
            </div>
            {historyLength > 0 && (
                <div className="h-[44px]" aria-hidden="true" />
            )}
        </div>
    );
};

export default InventoryPreview;
