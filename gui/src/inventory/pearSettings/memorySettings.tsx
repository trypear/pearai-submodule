import { vscBadgeBackground, vscEditorBackground } from "@/components";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { getMetaKeyLabel } from "@/util";

const keyboardShortcuts = [
    { key: 'I', description: 'Make inline edits' },
    { key: 'L', description: 'Add selection to chat' },
    { key: '\\', description: 'Big Chat' },
    { key: '0', description: 'Previous Chat' },
    { key: 'H', description: 'History' },
    { key: ';', description: 'Close' },
    { key: '⇧ + L', description: 'Append Selected' },
];

const MemorySettings = () => {

    return (
        <div className="h-full w-full p-5 flex-col justify-start items-start gap-5 inline-flex overflow-hidden">
            <div className="justify-center items-center gap-2 inline-flex">
                <div className="flex-shrink-0 w-7 flex items-center justify-center">
                    <img src={getLogoPath("memory-default.svg")} className="size-6 mr-1" />
                </div>
                <div className=" text-lg font-['SF Pro']">PearAI Chat</div>
            </div>
            <div className="flex justify-center items-center w-full rounded-xl" style={{
                background: vscEditorBackground
            }}>
                <img src={getLogoPath("pearai-memory-splash.svg")} className="size-60" />
            </div>
            <div className="self-stretch pb-2 flex-col justify-start items-start gap-3 flex">
                <div className="self-stretch opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">KEYBOARD SHORTCUTS</div>
                <div className="self-stretch  flex-col justify-center items-start gap-3 flex overflow-hidden">
                    {keyboardShortcuts.map((shortcut, index) => (
                        <div key={index} className="justify-start items-center gap-3 inline-flex">
                            <div className="px-1 py-px rounded-md border-2 border-solid flex justify-center items-center gap-0.5">
                                <div className="text-center font-['SF Pro']">{getMetaKeyLabel()}</div>
                                <div className="opacity-50 font-['SF Pro'] leading-[17px]">+</div>
                                <div className="font-medium font-['SF Mono'] leading-3">{shortcut.key}</div>
                            </div>
                            <div className="font-normal font-['SF Pro']">{shortcut.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MemorySettings;
