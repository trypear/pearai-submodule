import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { useCallback, useContext, useEffect } from "react";
import { X } from "lucide-react";
import { setActiveFilePath } from "@/redux/slices/uiStateSlice";

interface ActiveFileIndicatorProps {
  isFirstInSession?: boolean;
}

export default function ActiveFileIndicator({ isFirstInSession }: ActiveFileIndicatorProps) {
  const activeFilePath = useSelector((state: RootState) => state.uiState.activeFilePath);
  const fileName = activeFilePath?.split(/[/\\]/)?.pop() ?? "";
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();
  
  const removeActiveFile = useCallback(() => {
    dispatch(setActiveFilePath(undefined));
  }, [])

  return (
    <>
      {isFirstInSession ? (
        <>
          <span>Current file: </span>
          {fileName ?
            <span className="mention cursor-pointer flex items-center gap-[0.15rem]">
              <span
                onClick={() => {
                  ideMessenger.post("openFile", { path: activeFilePath });
                }}>
                {`@${fileName}`}
              </span>
              <X className="text-xs pt-[0.15rem] pr-[0.1rem]" size={9} onClick={removeActiveFile}/>
            </span>
            :
            <span className="flex items-center gap-[0.15rem]">
              None
            </span>
          }
        </>
      ) : (
        <span className="text-gray-400 flex items-center gap-[0.15rem]" title="Only enabled on the first chat input">
          Current file: Disabled
        </span>
      )}
    </>
  );
};
