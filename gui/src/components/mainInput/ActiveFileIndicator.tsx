import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { useContext } from "react";
import { X } from "lucide-react";
import { setContextItems } from "@/redux/slices/stateSlice";

export default function ActiveFileIndicator() {
const contextItems = useSelector((state: RootState) => state.state.contextItems);
const fileContextItem = contextItems.find(item => item.id.providerTitle === "file");
const activeFilePath = fileContextItem?.description;
  const fileName = activeFilePath?.split(/[/\\]/)?.pop() ?? activeFilePath;
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();

  const remove = () => {
    dispatch(setContextItems([]));
  };

  if (!activeFilePath) return null;

  return (
    <div className="flex gap-1 mb-3 text-xs items-center">
      <span>Current file: </span>
      <span className="mention cursor-pointer flex items-center gap-[0.15rem]">
        <span
          onClick={() => {
            ideMessenger.post("openFile", { path: activeFilePath });
          }}
        >
          {`@${fileName}`}
        </span>
        <X
          className="text-xs pt-[0.15rem] pr-[0.1rem]"
          size={9}
          onClick={() => remove()}
        />
      </span>
    </div>
  );
}
