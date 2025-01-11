import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useState, ReactNode, useRef, useEffect } from "react";
interface InventoryDetailsProps {
  textColor: string;
  backgroundColor: string;
  content: ReactNode;
  blurb?: ReactNode;
  useful?: ReactNode;
  alt?: ReactNode;
}

const InventoryDetails = ({ textColor, backgroundColor, content, blurb, useful, alt }: InventoryDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="flex items-center gap-1 rounded-lg fixed z-50  pl-[10px] pr-[6px] py-1 text-lg tracking-wide justify-center cursor-pointer select-none"
        style={{
          color: textColor,
          backgroundColor: backgroundColor
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {content}
        <ChevronDownIcon className={`h-5 w-5 text-[${textColor}]`} />
      </div>


      <div
        className={`border-solid border-[0px] bg-input shadow-2xl mt-[48px] z-50 fixed rounded-lg py-2 px-4 w-[400px] transition-all duration-200 transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
          }`}
        style={{
          borderColor: backgroundColor + '50',
          color: textColor
        }}
      >
        <div className="flex flex-col  text-xs">
          <div className="opacity-50">{blurb}</div>
          {useful && (
            <div>
              <h3 className="font-semibold mb-1 text-base">Useful for</h3>
              <div className="opacity-50">{useful}</div>
            </div>
          )}
          {alt && (
            <div>
              <h3 className="font-semibold mb-1">Alternatives</h3>
              <div className="opacity-50">{alt}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;
