import { IndexingProgressUpdate } from "core";
import { FC, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import {
  CustomScrollbarDiv,
  defaultBorderRadius,
  vscForeground,
  vscInputBackground,
  vscBackground,
  vscEditorBackground,
} from ".";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import {
  setBottomMessage,
  setBottomMessageCloseTimeout,
  setShowDialog,
} from "../redux/slices/uiStateSlice";
import { RootState } from "../redux/store";
import { getFontSize, isMetaEquivalentKeyPressed } from "../util";
import { getLocalStorage, setLocalStorage } from "../util/localStorage";
import PostHogPageView from "./PosthogPageView";
import ShortcutContainer from "./ShortcutContainer";
import InventoryPreview from "../components/InventoryPreview";
import TextDialog from "./dialogs";


// check mac or window
const platform = navigator.userAgent.toLowerCase();
const isMac = platform.includes("mac");
const isWindows = platform.includes("win");

// #region Styled Components
const HEADER_HEIGHT = "1.55rem";
export const FOOTER_HEIGHT = "9.5rem";

const GlobalStyle = createGlobalStyle<{ isPearOverlay?: boolean }>`
  :root {
	background-color: ${props => props.isPearOverlay ? "transparent" : vscBackground};
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

const OverlayContainer = styled.div<{ isPearOverlay: boolean, path: string }>`
  ${props => props.isPearOverlay && `
    width: 100%;
    height: 100%;
    // border-radius: var(--overlay-border-radius, 12px);
    // box-shadow: ${props.path === "/inventory/home" ? "none" : "var(--overlay-box-shadow, 0 8px 24px rgba(0, 0, 0, 0.25))"};
    // position: relative;
    overflow: hidden; // Ensure content doesn't overflow
    display: flex;
    flex-direction: column; // Add this to ensure proper content flow
    // background-color: ${props.path === "/inventory/home" ? "transparent" : vscBackground};
    background-color: transparent;
  `}
`;

const Layout:FC<{darkBg?: boolean}> = ({darkBg = true}) => {
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

  // useWebviewListener("openSettings", async () => {
  //   ideMessenger.post("openConfigJson", undefined);
  // });

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
    return <OverlayContainer
      isPearOverlay={window.isPearOverlay}
      path={location.pathname}
      onClick={(e) => { 
        if (e.target === e.currentTarget) {
          ideMessenger.post("closeOverlay", undefined);
        }
      }}
    >
      <GlobalStyle isPearOverlay={window.isPearOverlay} />
      <Outlet />
    </OverlayContainer>;
  }

  return (
    <div className={`${darkBg ? "bg-sidebar-background" : ""} flex flex-col gap-1 h-screen`}>
      {
        <TextDialog
          showDialog={showDialog}
          onEnter={() => {
            dispatch(setShowDialog(false));
          }}
          onClose={() => {
            dispatch(setShowDialog(false));
          }}
          message={dialogMessage}
        />}

      <PostHogPageView />
      <Outlet />
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
      <div
        style={{ fontSize: `${getFontSize() - 4}px` }}
        id="tooltip-portal-div"
      />
    </div>
  );
};

export default Layout;
