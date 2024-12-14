import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { IndexingProgressUpdate } from "core";
import { useState } from "react";

import ProfileSwitcher from "./ProfileSwitcher";
import HeaderButtonWithText from "./HeaderButtonWithText";
import ProgressBar from "./loaders/ProgressBar";
import IndexingProgressBar from "./loaders/IndexingProgressBar";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../util/freeTrial";
import { useWebviewListener } from "@/hooks/useWebviewListener";
import { getFontSize } from "@/util";
import { vscInputBackground } from ".";
import styled from "styled-components";

const ModelDropdownPortalDiv = styled.div`
//   background-color: ${vscInputBackground};
  position: relative;
  margin-left: 8px;
  z-index: 200;
  font-size: ${getFontSize() - 3}px;
`;

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
        {/* Usage Progress Bar */}
        {/* {indexingState.status !== "indexing" && defaultModel?.provider === "free-trial" && (
          <ProgressBar
            completed={parseInt(localStorage.getItem("ftc") || "0")}
            total={FREE_TRIAL_LIMIT_REQUESTS}
          />
        )} */}

        {/* Indexing Progress Bar */}
        <IndexingProgressBar indexingState={indexingState} />
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-1">
	  <ModelDropdownPortalDiv id="model-select-top-div">Select Model</ModelDropdownPortalDiv>

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