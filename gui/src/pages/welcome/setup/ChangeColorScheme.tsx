import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../components";

export default function ChangeColorScheme({
  handleThemeChange,
}: {
  handleThemeChange: (isDark: boolean) => void;
}) {
  return (
    <div className="flex gap-4 size-full text-center">
      <div
        role="button"
        tabIndex={0}
        aria-label="Select Light Theme"
        className="flex-1 bg-white text-black flex justify-center align-middle size-full rounded-xl cursor-pointer transition-colors duration-300"
        onClick={() => handleThemeChange(false)}
      >
        <div className="flex flex-col gap-2 m-auto justify-center align-middle">
          <div>PearAI Light</div>
          <SunIcon className="w-24 h-24 m-auto" />
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Select Dark Theme"
        className="flex-1 bg-black text-white flex justify-center align-middle size-full rounded-xl cursor-pointer transition-colors duration-300"
        onClick={() => handleThemeChange(true)}
      >
        <div className="flex flex-col gap-2 m-auto ">
          <div>PearAI Dark</div>
          <MoonIcon className="w-24 h-24" />
        </div>
      </div>
    </div>
  );
}
