import { useWebviewListener } from "@/hooks/useWebviewListener";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { IndexingProgressUpdate } from "core";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import HeaderButtonWithText from "./HeaderButtonWithText";
import IndexingProgressBar from "./loaders/IndexingProgressBar";
import ModelSelect from "./modelSelection/ModelSelect";
import ProfileSwitcher from "./ProfileSwitcher";

const StatusBar = () => {
  const navigate = useNavigate();
  const defaultModel = useSelector(defaultModelSelector);
  useWebviewListener("indexProgress", async (data) => {
    setIndexingState(data);
  });
  const [indexingState, setIndexingState] = useState<IndexingProgressUpdate>({
    desc: "Loading indexing config",
    progress: 0.0,
    status: "loading",
  });

  return (
    <div className="items-center flex justify-between gap-2 w-full overflow-hidden">
      <div className="flex items-center gap-2">
        {/* Indexing Progress Bar */}
        <IndexingProgressBar indexingState={indexingState} />
      </div>

      {/* Header Controls */}
      <div className="flex w-full items-center gap-1 justify-end min-w-0">
				<ModelSelect />

        <ProfileSwitcher />

        <HeaderButtonWithText
          tooltipPlacement="top-end"
          text="Help"
          className="flex-none z-10"
          onClick={() => {
            navigate(location.pathname === "/help" ? "/" : "/help");
          }}
        >
          <QuestionMarkCircleIcon width="1.4em" height="1.4em" />
        </HeaderButtonWithText>
      </div>
    </div>
  );
};

export default StatusBar;
