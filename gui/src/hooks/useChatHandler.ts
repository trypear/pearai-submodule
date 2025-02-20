import { Dispatch } from "@reduxjs/toolkit";

import { JSONContent } from "@tiptap/react";
import {
  ChatHistory,
  ChatHistoryItem,
  ChatMessage,
  InputModifiers,
  MessageContent,
  PromptLog,
  RangeInFile,
  SlashCommandDescription,
} from "core";
import { constructMessages } from "core/llm/constructMessages";
import { stripImages } from "core/llm/images";
import { getBasename, getRelativePath } from "core/util";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import resolveEditorContent from "../components/mainInput/resolveInput";
import { IIdeMessenger } from "../context/IdeMessenger";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import {
  addPromptCompletionPair,
  clearLastResponse,
  initNewActiveMessage,
  initNewActivePerplexityMessage,
  resubmitAtIndex,
  setInactive,
  setPerplexityInactive,
  setMessageAtIndex,
  streamUpdate,
  streamPerplexityUpdate,
  setPerplexityCitations,
} from "../redux/slices/stateSlice";
import { RootState } from "../redux/store";

function useChatHandler(dispatch: Dispatch, ideMessenger: IIdeMessenger, source: 'perplexity' | 'continue'='continue') {
  const posthog = usePostHog();

  const defaultModel = useSelector(defaultModelSelector);
  const useActiveFile = !!(useSelector((state: RootState) => state.uiState.activeFilePath));

  const slashCommands = useSelector(
    (store: RootState) => store.state.config.slashCommands || [],
  );

  const contextItems = useSelector(
    (state: RootState) => state.state.contextItems,
  );

  const state = useSelector((store: RootState) => store.state);
  const history = source === 'perplexity' ? state.perplexityHistory : state.history;
  const active = source === 'perplexity' ? state.perplexityActive : state.active;
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  async function _streamNormalInput(messages: ChatMessage[], source: 'perplexity' | 'continue'='continue') {
    const abortController = new AbortController();
    const cancelToken = abortController.signal;

    try {
      const gen = ideMessenger.llmStreamChat(
        defaultModel.title,
        cancelToken,
        messages,
      );
      let next = await gen.next();
      if (source === 'perplexity') {
        // Fetch all titles concurrently
        const citations = ((next.value as ChatMessage).citations || []);
        const citationsWithTitles = await Promise.all(
          citations.map(async (url) => {
            try {
              const title = await ideMessenger.request("getUrlTitle", url);
              return {
                url,
                title
              };
            } catch (error) {
              console.error('Failed to fetch title for:', url);
              return {
                url,
                title: new URL(url).hostname
              };
            }
          })
        );

        dispatch(setPerplexityCitations(citationsWithTitles));
      }

      while (!next.done) {
        if (!activeRef.current) {
          abortController.abort();
          break;
        }
        const stream = source === 'perplexity' ? streamPerplexityUpdate : streamUpdate;
        dispatch(
          stream(stripImages((next.value as ChatMessage).content)),
        );
        next = await gen.next();
      }

      let returnVal = next.value as PromptLog;
      if (returnVal) {
        dispatch(addPromptCompletionPair({promptLogs: [returnVal], source: source}));
      }
    } catch (e) {
      // If there's an error, we should clear the response so there aren't two input boxes
      dispatch(clearLastResponse(source));
    }
  }

  const getSlashCommandForInput = (
    input: MessageContent,
  ): [SlashCommandDescription, string] | undefined => {
    let slashCommand: SlashCommandDescription | undefined;
    let slashCommandName: string | undefined;

    let lastText =
      typeof input === "string"
        ? input
        : input.filter((part) => part.type === "text").slice(-1)[0]?.text || "";

    if (lastText.startsWith("/")) {
      slashCommandName = lastText.split(" ")[0].substring(1);
      slashCommand = slashCommands.find(
        (command) => command.name === slashCommandName,
      );
    }
    if (!slashCommand || !slashCommandName) {
      return undefined;
    }

    // Convert to actual slash command object with runnable function
    return [slashCommand, stripImages(input)];
  };

  async function _streamSlashCommand(
    messages: ChatMessage[],
    slashCommand: SlashCommandDescription,
    input: string,
    historyIndex: number,
    selectedCode: RangeInFile[],
  ) {
    const abortController = new AbortController();
    const cancelToken = abortController.signal;
    const modelTitle = defaultModel.title;

    const checkActiveInterval = setInterval(() => {
      if (!activeRef.current) {
        abortController.abort();
        clearInterval(checkActiveInterval);
      }
    }, 100);

    for await (const update of ideMessenger.streamRequest(
      "command/run",
      {
        input,
        history: messages,
        modelTitle,
        slashCommandName: slashCommand.name,
        contextItems,
        params: slashCommand.params,
        historyIndex,
        selectedCode,
      },
      cancelToken,
    )) {
      if (!activeRef.current) {
        abortController.abort();
        break;
      }
      if (typeof update.content === "string") {
        dispatch(streamUpdate(update.content));
      }
    }
    clearInterval(checkActiveInterval);
  }

  async function streamResponse(
    editorState: JSONContent,
    modifiers: InputModifiers,
    ideMessenger: IIdeMessenger,
    index?: number,  // only for when user enters a new prompt in earlier input box
    source: 'perplexity' | 'continue'='continue'
  ) {
    try {
      if (typeof index === "number") {
        dispatch(resubmitAtIndex({ index, editorState, source }));
      } else {
const init = source === 'perplexity' ? initNewActivePerplexityMessage : initNewActiveMessage;
        dispatch(init({ editorState }));
      }

      // Resolve context providers and construct new history
      const [contextItems, selectedCode, content] = await resolveEditorContent(
        editorState,
        modifiers,
        ideMessenger,
      );

      // Depreciated: Automatically use currently open file (-nang)
      // if (source === 'continue' && (!modifiers.noContext || useActiveFile) && (history.length === 0 || index === 0)) {
      //   const usingFreeTrial = defaultModel.provider === "free-trial";

      //   const currentFilePath = await ideMessenger.ide.getCurrentFile();
      //   if (typeof currentFilePath === "string") {
      //     let currentFileContents =
      //       await ideMessenger.ide.readFile(currentFilePath);
      //     if (usingFreeTrial) {
      //       currentFileContents = currentFileContents
      //         .split("\n")
      //         .slice(0, 1000)
      //         .join("\n");
      //     }
      //     contextItems.unshift({
      //       content: `The following file is currently open. Don't reference it if it's not relevant to the user's message.\n\n\`\`\`${getRelativePath(
      //         currentFilePath,
      //         await ideMessenger.ide.getWorkspaceDirs(),
      //       )}\n${currentFileContents}\n\`\`\``,
      //       name: `Active file: ${getBasename(currentFilePath)}`,
      //       description: currentFilePath,
      //       id: {
      //         itemId: currentFilePath,
      //         providerTitle: "file",
      //       },
      //     });
      //   }
      // }

      const message: ChatMessage = {
        role: "user",
        content,
      };
      const historyItem: ChatHistoryItem = {
        message,
        contextItems,
        // : typeof index === "number"
        //   ? history[index].contextItems
        //   : contextItems,
        editorState,
      };
      let newHistory: ChatHistory = [...history.slice(0, index), historyItem];
      const historyIndex = index || newHistory.length - 1;
      dispatch(
        setMessageAtIndex({
          message,
          index: historyIndex,
          contextItems,
          source,
        }),
      );

      // TODO: hacky way to allow rerender
      await new Promise((resolve) => setTimeout(resolve, 0));

      posthog.capture("step run", {
        step_name: "User Input",
        params: {},
      });
      posthog.capture("userInput", {});

      const messages = constructMessages(newHistory);

      // Determine if the input is a slash command
      let commandAndInput = getSlashCommandForInput(content);

      if (!commandAndInput) {
        await _streamNormalInput(messages, source);
      } else {
        const [slashCommand, commandInput] = commandAndInput;
        posthog.capture("step run", {
          step_name: slashCommand.name,
          params: {},
        });
        await _streamSlashCommand(
          messages,
          slashCommand,
          commandInput,
          historyIndex,
          selectedCode,
        );
      }
    } catch (e) {
      console.log("Continue: error streaming response: ", e);
      ideMessenger.post("errorPopup", {
        message: `Error streaming response: ${e.message}`,
      });
    } finally {
      const disableActive = source === 'perplexity' ? setPerplexityInactive : setInactive;
      dispatch(disableActive());
    }
  }

  return { streamResponse };
}

export default useChatHandler;
