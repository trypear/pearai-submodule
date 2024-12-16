import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { IndexingProgressUpdate } from "core";
import { useState } from "react";
import ProfileSwitcher from "./ProfileSwitcher";
import HeaderButtonWithText from "./HeaderButtonWithText";
import IndexingProgressBar from "./loaders/IndexingProgressBar";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import { useWebviewListener } from "@/hooks/useWebviewListener";
import ModelSelect from "./modelSelection/ModelSelect";

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
    <div className="items-center flex justify-between">
      <div className="flex items-center gap-2">
        {/* Indexing Progress Bar */}
        <IndexingProgressBar indexingState={indexingState} />
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-1">
				<ModelSelect />

        <ProfileSwitcher />

        <HeaderButtonWithText
          tooltipPlacement="top-end"
          text="Help"
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