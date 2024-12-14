import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useState, ReactNode } from "react";
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

    return (
        <div className="relative">
            <div
                className="rounded-lg fixed z-50 flex pl-[10px] pr-[6px] py-1 text-xl tracking-wide justify-center cursor-pointer select-none"
                style={{
                    color: textColor,
                    backgroundColor: backgroundColor
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {content}
                <ChevronDownIcon className={`h-6 w-6 text-[${textColor}]`} />
            </div>


            <div
                className={`border-solid border-[0px] bg-input mt-[56px] z-50 fixed rounded-lg py-4 px-6 w-[400px] transition-all duration-200 transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
                    }`}
                style={{
                    borderColor: backgroundColor + '50',
                    color: textColor
                }}
            >
                <div className="flex flex-col  text-base">
                    <div className="opacity-50">{blurb}</div>
                    {useful && (
                        <div>
                            <h3 className="font-semibold mb-1 text-lg">Useful for</h3>
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
