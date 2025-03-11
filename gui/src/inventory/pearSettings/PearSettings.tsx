import { vscBackground, vscEditorBackground } from "@/components";
import Inventory from "@/pages/inventory";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { title } from "process";
import { useState } from "react";
import GeneralSettings from "./general";
import AccountSettings from "./account";
import ChatSettings from "./chatSettings";
import AgentSettings from "./agentSettings";
import SearchSettings from "./searchSettings";
import MemorySettings from "./memorySettings";

const inventoryItems = [
    {
        id: "chat",
        title: "Chat",
        icon: "chat-default.svg"
    },
    {
        id: "agent",
        title: "Agent",
        icon: "creator-default.svg"
    },
    {
        id: "search",
        title: "Search",
        icon: "search-default.svg"
    },
    {
        id: "memory",
        title: "Memory",
        icon: "memory-default.svg"
    }
]

// Combine settings and inventory items into a single type
type MenuItem = {
    id: string;
    title: string;
    icon?: string;
    section: 'settings' | 'inventory'
}

const menuItems: MenuItem[] = [
    // Settings section
    { id: 'general', title: 'General', section: 'settings' },
    { id: 'account', title: 'Account', section: 'settings' },
    { id: 'help', title: 'Help', section: 'settings' },
    // Inventory section
    ...inventoryItems.map(item => ({ ...item, section: 'inventory' as const }))
]

const PearSettings = () => {
    const [selectedItem, setSelectedItem] = useState<string>('general');

    return (
        <div className={`h-[80%] w-[80%] flex flex-col my-auto mx-auto rounded-xl bg-sidebar-background`}>
            <div className="h-[98%] w-[98%] flex">
                <Sidebar selectedItem={selectedItem} onSelectItem={setSelectedItem} />
                <ContentArea selectedItem={selectedItem} />
            </div>
        </div>
    )
}

const Sidebar = ({ selectedItem, onSelectItem }: { selectedItem: string, onSelectItem: (id: string) => void }) => {
    return (
        <div className="p-2 w-44 border-r rounded-l-xl flex flex-col h-full items-start justify-start"
            style={{ backgroundColor: vscEditorBackground }}
        >
            {/* search bar */}
            <div className="self-stretch h-[30px] px-2 py-1 bg-sidebar-background rounded-lg justify-start items-center gap-1 inline-flex overflow-hidden">
                <SearchIconSVG />
                <div className="text-xs font-normal font-['SF Pro']">Search</div>
            </div>

            {/* Settings Section */}
            <SidebarSection
                title="SETTINGS"
                items={menuItems.filter(item => item.section === 'settings')}
                selectedItem={selectedItem}
                onSelectItem={onSelectItem}
            />

            {/* Inventory Section */}
            <SidebarSection
                title="INVENTORY"
                items={menuItems.filter(item => item.section === 'inventory')}
                selectedItem={selectedItem}
                onSelectItem={onSelectItem}
            />
        </div>
    )
}

const SidebarSection = ({
    title,
    items,
    selectedItem,
    onSelectItem
}: {
    title: string,
    items: MenuItem[],
    selectedItem: string,
    onSelectItem: (id: string) => void
}) => {
    return (
        <>
            <div className="self-stretch px-2 pt-5 pb-2 justify-center items-center gap-1 inline-flex">
                <div className="grow shrink basis-0 h-[15px] opacity-50 text-[10px] font-bold font-['SF Pro'] tracking-tight">
                    {title}
                </div>
            </div>
            {items.map(item => (
                <div
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className={`self-stretch p-2 rounded-lg justify-start items-center gap-2 inline-flex overflow-hidden cursor-pointer  ${selectedItem === item.id ? 'bg-list-hoverBackground' : ''
                        }`}
                >
                    {item.icon && (
                        <div className="flex-shrink-0 w-7 flex items-center justify-center">
                            <img src={getLogoPath(item.icon)} className="size-6 mr-1" />
                        </div>
                    )}
                    <div className="text-xs font-normal font-['SF Pro']">{item.title}</div>
                </div>
            ))}
        </>
    )
}

const ContentArea = ({ selectedItem }: { selectedItem: string }) => {
    return (
        <div className="flex-1 p-6">
            {/* Add your content components here based on selectedItem */}
            {selectedItem === 'general' && <GeneralSettings />}
            {selectedItem === 'account' && <AccountSettings />}
            {selectedItem === 'help' && <ChatSettings />}
            {selectedItem === 'chat' && <ChatSettings />}
            {selectedItem === 'agent' && <AgentSettings />}
            {selectedItem === 'search' && <SearchSettings />}
            {selectedItem === 'memory' && <MemorySettings />}
        </div>
    )
}

const SearchIconSVG = () => {
    return (
        <div data-svg-wrapper>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.96544 11.0261C9.13578 11.6382 8.11014 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7C12 8.11014 11.6382 9.13578 11.0261 9.96544L13.7803 12.7197C14.0732 13.0126 14.0732 13.4874 13.7803 13.7803C13.4874 14.0732 13.0126 14.0732 12.7197 13.7803L9.96544 11.0261ZM10.5 7C10.5 8.933 8.933 10.5 7 10.5C5.067 10.5 3.5 8.933 3.5 7C3.5 5.067 5.067 3.5 7 3.5C8.933 3.5 10.5 5.067 10.5 7Z" fill="white" />
            </svg>
        </div>
    )
}

export default PearSettings;