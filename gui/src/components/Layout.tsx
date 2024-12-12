import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { IndexingProgressUpdate } from "core";
import { useContext, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import {
  CustomScrollbarDiv,
  defaultBorderRadius,
  vscForeground,
  vscInputBackground,
  vscBackground,
} from ".";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { shouldBeginOnboarding } from "../pages/onboarding/utils";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import {
  setBottomMessage,
  setBottomMessageCloseTimeout,
  setShowDialog,
} from "../redux/slices/uiStateSlice";
import { RootState } from "../redux/store";
import { getFontSize, isMetaEquivalentKeyPressed } from "../util";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../util/freeTrial";
import { getLocalStorage, setLocalStorage } from "../util/localStorage";
import TextDialog from "./dialogs";
import HeaderButtonWithText from "./HeaderButtonWithText";
import IndexingProgressBar from "./loaders/IndexingProgressBar";
import ProgressBar from "./loaders/ProgressBar";
import PostHogPageView from "./PosthogPageView";
import ProfileSwitcher from "./ProfileSwitcher";
import ShortcutContainer from "./ShortcutContainer";

// check mac or window
const platform = navigator.userAgent.toLowerCase();
const isMac = platform.includes("mac");
const isWindows = platform.includes("win");

// #region Styled Components
const HEADER_HEIGHT = "1.55rem";
export const FOOTER_HEIGHT = "1.8em";

const GlobalStyle = createGlobalStyle`
  :root {
	background-color:green;
    --overlay-border-radius: 12px;
    --overlay-box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
`;

const BottomMessageDiv = styled.div<{ displayOnBottom: boolean }>`
  position: fixed;
  bottom: ${(props) => (props.displayOnBottom ? "50px" : undefined)};
  top: ${(props) => (props.displayOnBottom ? undefined : "50px")};
  left: 0;
  right: 0;
  margin: 8px;
  margin-top: 0;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  border-radius: ${defaultBorderRadius};
  padding: 12px;
  z-index: 100;
  box-shadow: 0px 0px 2px 0px ${vscForeground};
  max-height: 35vh;
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: right;
  padding: 4px;
  align-items: center;
  width: calc(100% - 0px);
  height: ${FOOTER_HEIGHT};
  // background-color: ${vscBackground};
  background-color: none;
  backdrop-filter: blur(12px);
  overflow: hidden;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 50;
`;

const ModelDropdownPortalDiv = styled.div`
  background-color: ${vscInputBackground};
  position: relative;
  margin-left: 8px;
  z-index: 200;
  font-size: ${getFontSize()};
`;

const OverlayContainer = styled.div<{ isPearOverlay: boolean, path: string }>`
  ${props => props.isPearOverlay && `
    width: 100%;
    height: 100%;
    border-radius: var(--overlay-border-radius, 12px);
    box-shadow: ${props.path === "/inventory/home" ? "none" : "var(--overlay-box-shadow, 0 8px 24px rgba(0, 0, 0, 0.25))"};
    position: relative;
    overflow: hidden;
    display: flex;
    background-color: ${props.path === "/inventory/home" ? "transparent" : vscBackground};
  `}
`;

// #endregion

const HIDE_FOOTER_ON_PAGES = [
  "/onboarding",
  "/localOnboarding",
  "/apiKeyOnboarding",
  "/aiderMode",
  "/inventory",
  "/inventory/aiderMode",
  "/inventory/perplexityMode",
  "/inventory/mem0Mode",
  "/welcome"
];

const SHOW_SHORTCUTS_ON_PAGES = ["/"];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);

  const historyLength = useSelector((state: RootState) => state.state.history.length);

  const dialogMessage = useSelector(
    (state: RootState) => state.uiState.dialogMessage,
  );
  const showDialog = useSelector(
    (state: RootState) => state.uiState.showDialog,
  );

  const defaultModel = useSelector(defaultModelSelector);
  // #region Selectors

  const bottomMessage = useSelector(
    (state: RootState) => state.uiState.bottomMessage,
  );
  const displayBottomMessageOnBottom = useSelector(
    (state: RootState) => state.uiState.displayBottomMessageOnBottom,
  );

  const showInteractiveContinueTutorial = useSelector((state: RootState) => state.state.showInteractiveContinueTutorial);

  const timeline = useSelector((state: RootState) => state.state.history);

  // #endregion

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (isMetaEquivalentKeyPressed(event) && event.code === "KeyC") {
        const selection = window.getSelection()?.toString();
        if (selection) {
          // Copy to clipboard
          setTimeout(() => {
            navigator.clipboard.writeText(selection);
          }, 100);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [timeline]);

  useWebviewListener(
    "addModel",
    async () => {
      navigate("/models");
    },
    [navigate],
  );

  useWebviewListener("openSettings", async () => {
    ideMessenger.post("openConfigJson", undefined);
  });

  useWebviewListener(
    "viewHistory",
    async () => {
      // Toggle the history page / main page
      if (location.pathname === "/history") {
        navigate("/");
      } else {
        navigate("/history", { state: { from: location.pathname } });
      }
    },
    [location, navigate],
  );

  useWebviewListener("indexProgress", async (data) => {
    setIndexingState(data);
  });

  useWebviewListener(
    "addApiKey",
    async () => {
      navigate("/apiKeyOnboarding");
    },
    [navigate],
  );

  useWebviewListener(
    "openOnboarding",
    async () => {
      navigate("/onboarding");
    },
    [navigate],
  );

  useWebviewListener(
    "incrementFtc",
    async () => {
      const u = getLocalStorage("ftc");
      if (u) {
        setLocalStorage("ftc", u + 1);
      } else {
        setLocalStorage("ftc", 1);
      }
    },
    [],
  );

  useWebviewListener(
    "setupLocalModel",
    async () => {
      ideMessenger.post("completeOnboarding", {
        mode: "localAfterFreeTrial",
      });
      navigate("/localOnboarding");
    },
    [navigate],
  );

  const [indexingState, setIndexingState] = useState<IndexingProgressUpdate>({
    desc: "Loading indexing config",
    progress: 0.0,
    status: "loading",
  });

  if (window.isPearOverlay) {
    return <OverlayContainer isPearOverlay={window.isPearOverlay} path={location.pathname}>
      <GlobalStyle />
      <Outlet />
    </OverlayContainer>;
  }

  return (
    <>
				{/* Pressing Cmd+L adds code block to the chat box  */}
        <TextDialog
          showDialog={showDialog}
          onEnter={() => {
            dispatch(setShowDialog(false));
          }}
          onClose={() => {
            dispatch(setShowDialog(false));
          }}
          message={dialogMessage}
        />

        <PostHogPageView />
        <Outlet />
				
				{/* <ModelDropdownPortalDiv id="model-select-top-div"></ModelDropdownPortalDiv> */}

        {SHOW_SHORTCUTS_ON_PAGES.includes(location.pathname) && historyLength === 0 && (
          <ShortcutContainer />
        )}

        {/* {!HIDE_FOOTER_ON_PAGES.includes(location.pathname) && (
          <Footer>
            <div className="mr-auto flex flex-grow gap-2 items-center overflow-hidden">
              {indexingState.status !== "indexing" &&
                defaultModel?.provider === "free-trial" && (
                  <ProgressBar
                    completed={parseInt(localStorage.getItem("ftc") || "0")}
                    total={FREE_TRIAL_LIMIT_REQUESTS}
                  />
              )}
              <IndexingProgressBar indexingState={indexingState} />
            </div>

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
          </Footer>
        )} */}

        <BottomMessageDiv
          displayOnBottom={displayBottomMessageOnBottom}
          onMouseEnter={() => dispatch(setBottomMessageCloseTimeout(undefined))}
          onMouseLeave={(e) => {
            if (!e.buttons) {
              dispatch(setBottomMessage(undefined));
            }
          }}
          hidden={!bottomMessage}
        >
          {bottomMessage}
        </BottomMessageDiv>
    </>
  );
};

export default Layout;
