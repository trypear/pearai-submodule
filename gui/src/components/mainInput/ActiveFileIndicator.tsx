import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { setActiveConversationActiveFile, setUseActiveFile } from "@/redux/slices/uiStateSlice";
import { MenuButton } from "./TopBarIndicators";
import { useWebviewListener } from "@/hooks/useWebviewListener";

export default function ActiveFileIndicator() {
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();

  const activeFilePath = useSelector((state: RootState) => state.uiState.activeFilePath);
  const useActiveFile = useSelector((state: RootState) => state.uiState.useActiveFile);
  const activeConversationActiveFile = useSelector((state: RootState) => state.uiState.activeConversationActiveFile);
  const state = useSelector((state: RootState) => state.state);
  
  const fileName = useMemo(() => activeFilePath?.split(/[/\\]/)?.pop() ?? "", [activeFilePath]);
  const isFirstMessage = state.history.length === 0;

  useEffect(() => {
    // If a user starts a conversation, then the active file should no longer change.
    // activeConversationActiveFile keeps track of this same file during a conversation.
    if (isFirstMessage && useActiveFile) {
      dispatch(setActiveConversationActiveFile(fileName));
    } else if (!fileName) {
      dispatch(setActiveConversationActiveFile(undefined));
    }
    console.dir(fileName)
  }, [fileName, useActiveFile, activeFilePath])
  
  const removeActiveFile = useCallback(() => {
    if (!isFirstMessage) {
      return
    }
    dispatch(setUseActiveFile(false));
  }, [isFirstMessage])

  const addActiveFile = useCallback(() => {
    dispatch(setUseActiveFile(true));
  }, [])

  const openFile = useCallback(() => {
  }, [ideMessenger, activeFilePath]);

  // Show the active file if either including it, or if there's more than one message
  return (
    <>
    {useActiveFile || !isFirstMessage ?
      <span className={`flex items-center gap-[0.15rem] ${!isFirstMessage ? "opacity-50" : ""}`}> 
        <span>Active file: </span>
        {useActiveFile && activeConversationActiveFile ?
          <span className={`mention ${isFirstMessage ? "cursor-pointer" : ""} flex items-center gap-[0.15rem]`}> 
            <span
            onClick={openFile}>
              {`@${activeConversationActiveFile}`}
            </span>
            <X className="text-xs pt-[0.15rem] pr-[0.1rem]" size={9} onClick={removeActiveFile}/>
          </span>
          :
          <span className="flex items-center gap-[0.15rem]">
            None
          </span>
        }
      </span>
      : 
      <MenuButton onClick={addActiveFile}>Add active file +</MenuButton>
      }
    </>
  );
};
