import { title } from "process";
import {
  Link2,
  Link2Icon,
  LucideExternalLink,
  ChevronRight,
} from "lucide-react";
import { getMetaKeyLabel } from "@/util";

const socials = [
  {
    title: "Discord",
    link: "https://discord.gg/bQWbUYPt",
  },
  {
    title: "Github",
    link: "https://github.com/orgs/trypear/repositories",
  },
  {
    title: "Website",
    link: "https://trypear.ai/",
  },
];

const keyboardShortcuts = [
  { key: "E", description: "Open Inventory" },
  { key: "I", description: "Make inline edits" },
  { key: "L", description: "Add selection to chat" },
  { key: "\\", description: "Big Chat" },
  { key: "0", description: "Previous Chat" },
  { key: "H", description: "History" },
  { key: ";", description: "Close" },
  { key: "⇧ + L", description: "Append Selected" },
];

const demolink = "https://www.youtube.com/watch?v=wcaWUeaeqiA";

const HelpSettings = () => {
  return (
    <div className="border border-solidd h-full p-5 flex-col justify-start items-start gap-5 inline-flex overflow-hidden">
      <div className="justify-center items-center inline-flex">
        <div className=" text-lg font-['SF Pro']">Help</div>
      </div>
      <div className="self-stretch pb-2 flex-col justify-start items-start gap-3 flex">
        <div className="self-stretch opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">
          REACH US
        </div>
        <div className="self-stretch justify-start items-center gap-5 inline-flex">
          {socials.map((item) => (
            <a
              className="grow shrink basis-0 p-3 bg-list-hoverBackground rounded-lg border border-solid  justify-between items-center flex overflow-hidden cursor-pointer no-underline text-decoration-line text-inherit hover:text-inherit"
              href={item.link}
            >
              <div className=" text-xs font-normal font-['SF Pro']">
                {item.title}
              </div>
              <LucideExternalLink className="size-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="self-stretch pb-2 flex-col justify-start items-start gap-3 flex">
        <div className="self-stretch  opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">
          TUTORIAL
        </div>
        <a
          className="p-3 bg-list-hoverBackground rounded-lg border border-solid justify-between items-center flex self-stretch no-underline text-inherit hover:text-inherit"
          href={demolink}
        >
          <div className=" text-xs font-normal font-['SF Pro']">
            Open tutorial
          </div>
          <ChevronRight className="size-4"></ChevronRight>
        </a>
      </div>

      <div className="self-stretch pb-2 flex-col justify-start items-start gap-3 flex">
        <div className="self-stretch opacity-50  text-[10px] font-bold font-['SF Pro'] tracking-tight">
          KEYBOARD SHORTCUTS
        </div>
        <div className="self-stretch  flex-col justify-center items-start gap-3 flex overflow-hidden">
          {keyboardShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="justify-start items-center gap-3 inline-flex"
            >
              <div className="px-1 py-px rounded-md border-2 border-solid flex justify-center items-center gap-0.5">
                <div className="text-center font-['SF Pro']">
                  {getMetaKeyLabel()}
                </div>
                <div className="opacity-50 font-['SF Pro'] leading-[17px]">
                  +
                </div>
                <div className="font-medium font-['SF Mono'] leading-3">
                  {shortcut.key}
                </div>
              </div>
              <div className="font-normal font-['SF Pro']">
                {shortcut.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
