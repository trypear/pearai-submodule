import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { Plugin } from "@tiptap/pm/state";
import { Editor, EditorContent, JSONContent, useEditor } from "@tiptap/react";
import {
  ContextItemWithId,
  ContextProviderDescription,
  InputModifiers,
  RangeInFile,
} from "core";
import { modelSupportsImages } from "core/llm/autodetect";
import { getBasename, getRelativePath } from "core/util";
import { usePostHog } from "posthog-js/react";
import { useContext, useEffect, useMemo, useRef, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  defaultBorderRadius,
  lightGray,
  vscBadgeBackground,
  vscForeground,
  vscInputBackground,
  vscInputBorder,
  vscInputBorderFocus,
} from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { SubmenuContextProvidersContext } from "../../context/SubmenuContextProviders";
import useHistory from "../../hooks/useHistory";
import { useInputHistory } from "../../hooks/useInputHistory";
import useUpdatingRef from "../../hooks/useUpdatingRef";
import { useWebviewListener } from "../../hooks/useWebviewListener";
import { selectUseActiveFile } from "../../redux/selectors";
import { defaultModelSelector } from "../../redux/selectors/modelSelectors";
import {
  consumeMainEditorContent,
  setEditingContextItemAtIndex,
} from "../../redux/slices/stateSlice";
import { RootState } from "../../redux/store";
import {
  getFontSize,
  isJetBrains,
  isMetaEquivalentKeyPressed,
  isWebEnvironment,
} from "../../util";
import CodeBlockExtension from "./CodeBlockExtension";
import { SlashCommand } from "./CommandsExtension";
import InputToolbar from "./InputToolbar";
import { Mention } from "./MentionExtension";
import "./TipTapEditor.css";
import {
  getContextProviderDropdownOptions,
  getSlashCommandDropdownOptions,
} from "./getSuggestion";
import { ComboBoxItem } from "./types";
import { useLocation } from "react-router-dom";
import ActiveFileIndicator from "./ActiveFileIndicator";
import { setActiveFilePath } from "@/redux/slices/uiStateSlice";
import TopBar from "./TopBarIndicators";
import { isAiderMode, isPerplexityMode } from "../../util/bareChatMode";
import HardBreak from '@tiptap/extension-hard-break';

const InputBoxDiv = styled.div`
  resize: none;

  padding: 8px 12px;
  padding-bottom: 4px;
  font-family: inherit;
  border-radius: ${defaultBorderRadius};
  margin: 0;
  height: auto;
  width: calc(100% - 18px);
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  z-index: 1;
  outline: none;
  font-size: ${getFontSize()}px;
  &:focus {
    outline: none;

    border: 0.5px solid ${vscInputBorderFocus};
  }

  &::placeholder {
    color: ${lightGray}cc;
  }

  display: flex;
  flex-direction: column;
`;

const HoverDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0.5;
  background-color: ${vscBadgeBackground};
  color: ${vscForeground};
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HoverTextDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  color: ${vscForeground};
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const getPlaceholder = (historyLength: number, location: any) => {
  if (location?.pathname === "/aiderMode" || location?.pathname === "/inventory/aiderMode") {
    return historyLength === 0
      ? "Ask me to create, change, or fix anything..."
      : "Send a follow-up";
  }
  else if (location?.pathname === "/perplexityMode" || location?.pathname === "/inventory/perplexityMode") {
    return historyLength === 0 ? "Ask for any information" : "Ask a follow-up";
  }

  return historyLength === 0
    ? "Ask anything, '/' for slash commands, '@' to add context"
    : "Ask a follow-up";
};

function getDataUrlForFile(file: File, img): string {
  const targetWidth = 512;
  const targetHeight = 512;
  const scaleFactor = Math.min(
    targetWidth / img.width,
    targetHeight / img.height,
  );

  const canvas = document.createElement("canvas");
  canvas.width = img.width * scaleFactor;
  canvas.height = img.height * scaleFactor;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const downsizedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
  return downsizedDataUrl;
}

interface TipTapEditorProps {
  availableContextProviders: ContextProviderDescription[];
  availableSlashCommands: ComboBoxItem[];
  isMainInput: boolean;
  onEnter: (editorState: JSONContent, modifiers: InputModifiers) => void;
  editorState?: JSONContent;
  source?: 'perplexity' | 'aider' | 'continue';
  onChange?: (newState: JSONContent) => void;
}

const TipTapEditor = memo(function TipTapEditor({
  availableContextProviders,
  availableSlashCommands,
  isMainInput,
  onEnter,
  editorState,
  source = 'continue',
  onChange,
}: TipTapEditorProps) {
  const dispatch = useDispatch();

  const ideMessenger = useContext(IdeMessengerContext);
  const { getSubmenuContextItems } = useContext(SubmenuContextProvidersContext);

  const historyLength = useSelector(
    (store: RootState) => {
      switch(source) {
        case 'perplexity':
          return store.state.perplexityHistory.length;
        case 'aider':
          return store.state.aiderHistory.length;
        default:
          return store.state.history.length;
      }
    }
  );

  // Create a unique key for each editor instance
  const editorKey = useMemo(() => `${(source || 'continue')}-editor`, [source]);

  const useActiveFile = useSelector(selectUseActiveFile);

  const { saveSession } = useHistory(dispatch, source);

  const posthog = usePostHog();
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  const inSubmenuRef = useRef<string | undefined>(undefined);
  const inDropdownRef = useRef(false);

  const enterSubmenu = async (editor: Editor, providerId: string) => {
    const contents = editor.getText();
    const indexOfAt = contents.lastIndexOf("@");
    if (indexOfAt === -1) {
      return;
    }

    editor.commands.deleteRange({
      from: indexOfAt + 2,
      to: contents.length + 1,
    });
    inSubmenuRef.current = providerId;

    // to trigger refresh of suggestions
    editor.commands.insertContent(" ");
    editor.commands.deleteRange({
      from: editor.state.selection.anchor - 1,
      to: editor.state.selection.anchor,
    });
  };

  const onClose = () => {
    inSubmenuRef.current = undefined;
    inDropdownRef.current = false;
  };

  const onOpen = () => {
    inDropdownRef.current = true;
  };

  const contextItems = useSelector(
    (store: RootState) => store.state.contextItems,
  );
  const defaultModel = useSelector(defaultModelSelector);
  const getSubmenuContextItemsRef = useUpdatingRef(getSubmenuContextItems);
  const availableContextProvidersRef = useUpdatingRef(availableContextProviders)

  const historyLengthRef = useUpdatingRef(historyLength);
  const availableSlashCommandsRef = useUpdatingRef(
    availableSlashCommands,
  );

  const active = useSelector((store: RootState) => {
    switch(source) {
      case 'perplexity':
        return store.state.perplexityActive;
      case 'aider':
        return store.state.aiderActive;
      default:
        return store.state.active;
    }
  });

  const activeRef = useUpdatingRef(active);

  async function handleImageFile(
    file: File,
  ): Promise<[HTMLImageElement, string] | undefined> {
    const filesize = file.size / 1024 / 1024; // filesize in MB
    // check image type and size
    if (
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg",
        "image/webp",
      ].includes(file.type) &&
      filesize < 10
    ) {
      // check dimensions
      const _URL = window.URL || window.webkitURL;
      const img = new window.Image();
      img.src = _URL.createObjectURL(file);

      return await new Promise((resolve) => {
        img.onload = function () {
          const dataUrl = getDataUrlForFile(file, img);

          const image = new window.Image();
          image.src = dataUrl;
          image.onload = function () {
            resolve([image, dataUrl]);
          };
        };
      });
    } else {
      ideMessenger.post("errorPopup", {
        message:
          "Images need to be in jpg or png format and less than 10MB in size.",
      });
    }
    return undefined;
  }

  const mainEditorContent = useSelector(
    (store: RootState) => store.state.mainEditorContent,
  );

  const { prevRef, nextRef, addRef } = useInputHistory();
  const location = useLocation();

  // Keep track of the last valid content
  const lastContentRef = useRef(editorState);

  useEffect(() => {
    if (editorState) {
      lastContentRef.current = editorState;
    }
  }, [editorState]);

  const editor: Editor = useEditor({
    extensions: [
      Document,
      History,
      Image.extend({
        addProseMirrorPlugins() {
          const plugin = new Plugin({
            props: {
              handleDOMEvents: {
                paste(view, event) {
                  const items = event.clipboardData.items;

                  const hasImageItem = Array.from(items).some(
                    item => item.type.startsWith('image/')
                  );

                  // Only log and process if we actually have an image
                  if (hasImageItem) {
                    for (const item of items) {
                      if (!item.type.startsWith('image/')) continue;
                      
                      const file = item.getAsFile();
                      if (!file) continue;
      
                      if (modelSupportsImages(
                        defaultModel.provider,
                        defaultModel.model,
                        defaultModel.title,
                        defaultModel.capabilities,
                      )) {
                        event.preventDefault();
                        
                        handleImageFile(file).then((resp) => {
                          if (!resp) return;
                          
                          const [img, dataUrl] = resp;
                          const { schema } = view.state;
                          const node = schema.nodes.image.create({
                            src: dataUrl,
                          });
                          const tr = view.state.tr.insert(0, node);
                          view.dispatch(tr);
                        });
                      }
                    }
                  }
                }
              },
            },
          });
          return [plugin];
        },
      }),
      Placeholder.configure({
        placeholder: () => getPlaceholder(historyLengthRef.current, location),
      }),
      Paragraph.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => {
              if (inDropdownRef.current) {
                return false;
              }

              onEnterRef.current({
                useCodebase: false,
                noContext: !useActiveFile,
              });
              return true;
            },

            "Mod-Enter": () => {
              onEnterRef.current({
                useCodebase: true,
                noContext: !useActiveFile,
              });
              return true;
            },
            "Alt-Enter": () => {
              posthog.capture("gui_use_active_file_enter");

              onEnterRef.current({
                useCodebase: false,
                noContext: useActiveFile,
              });

              return true;
            },
            "Mod-Backspace": () => {
              // If you press cmd+backspace wanting to cancel,
              // but are inside of a text box, it shouldn't
              // delete the text
              if (activeRef.current) {
                return true;
              }
            },
            "Shift-Enter": () =>
              this.editor.commands.first(({ commands }) => [
                () => commands.newlineInCode(),
                () => commands.createParagraphNear(),
                () => commands.liftEmptyBlock(),
                () => commands.splitBlock(),
              ]),

            ArrowUp: () => {
              if (this.editor.state.selection.anchor > 1) {
                return false;
              }

              const previousInput = prevRef.current(
                this.editor.state.toJSON().doc,
              );
              if (previousInput) {
                this.editor.commands.setContent(previousInput);
                setTimeout(() => {
                  this.editor.commands.blur();
                  this.editor.commands.focus("start");
                }, 0);
                return true;
              }
            },
            ArrowDown: () => {
              if (
                this.editor.state.selection.anchor <
                this.editor.state.doc.content.size - 1
              ) {
                return false;
              }
              const nextInput = nextRef.current();
              if (nextInput) {
                this.editor.commands.setContent(nextInput);
                setTimeout(() => {
                  this.editor.commands.blur();
                  this.editor.commands.focus("end");
                }, 0);
                return true;
              }
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: "my-1",
        },
      }),
      Text,
      HardBreak,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: getContextProviderDropdownOptions(
          availableContextProvidersRef,
          getSubmenuContextItemsRef,
          enterSubmenu,
          onClose,
          onOpen,
          inSubmenuRef,
          ideMessenger,
        ),
        renderHTML: (props) => {
          return `@${props.node.attrs.label || props.node.attrs.id}`;
        },
      }),
      SlashCommand.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: getSlashCommandDropdownOptions(
          availableSlashCommandsRef,
          onClose,
          onOpen,
          ideMessenger,
        ),
        renderText: (props) => {
          return props.node.attrs.label;
        },
      }),
      CodeBlockExtension,
    ],
    editorProps: {
      attributes: {
        class: "outline-none -mt-1 mb-1 overflow-hidden",
        style: `font-size: ${getFontSize()}px;`,
      },
      handlePaste(view, event) {
        const items = event.clipboardData.items;
        const hasImageItem = Array.from(items).some(item => item.type.startsWith('image/'));
        
        if (!hasImageItem) {
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          const lines = text.split(/\r?\n/);
          const { tr } = view.state;
          const { schema } = view.state;
          let pos = view.state.selection.from;
  
          // Delete the selected text before inserting new text
          tr.delete(view.state.selection.from, view.state.selection.to);

          lines.forEach((line, index) => {
            if (index > 0) {
              tr.insert(pos++, schema.nodes.hardBreak.create());
            }
            tr.insertText(line, pos);
            pos += line.length;
          });
  
          view.dispatch(tr);
          return true;
        }
        return false;
      },
    },
    content: lastContentRef.current,
    editable: true,
    onFocus: () => setIsEditorFocused(true),
    onBlur: () => setIsEditorFocused(false),
    onCreate({ editor }) {
      if (lastContentRef.current) {
        editor.commands.setContent(lastContentRef.current);
      }
    }
  }, []);  // Remove dependencies to prevent recreation

  const editorFocusedRef = useUpdatingRef(editor?.isFocused, [editor]);

  const isPerplexity = isPerplexityMode();
  const isAider = isAiderMode();

  useEffect(() => {
    const handleShowFile = (event: CustomEvent) => {
      const filepath = event.detail.filepath;
      ideMessenger.post("showFile", { filepath });
    };

    window.addEventListener('showFile', handleShowFile as EventListener);
    return () => {
      window.removeEventListener('showFile', handleShowFile as EventListener);
    };
  }, [ideMessenger]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (!editor || !editorFocusedRef.current) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "v") {
        // Let the native paste event handle it if there are images
        // This allows the paste handler in editorProps to process images
        return;
      }
      // Handle other keyboard shortcuts...
      if ((event.metaKey || event.ctrlKey) && event.key === "x") {
        document.execCommand("cut");
        event.stopPropagation();
        event.preventDefault();
      } else if ((event.metaKey || event.ctrlKey) && event.key === "c") {
        document.execCommand("copy");
        event.stopPropagation();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, editorFocusedRef]);

  useEffect(() => {
    if (mainEditorContent && editor) {
      editor.commands.setContent(mainEditorContent);
      dispatch(consumeMainEditorContent());
    }
  }, [mainEditorContent, editor]);

  const onEnterRef = useUpdatingRef(
    (modifiers: InputModifiers) => {
      const json = editor.getJSON();

      // Don't do anything if input box is empty
      if (!json.content?.some((c) => c.content)) {
        return;
      }

      onEnter(json, modifiers);

      if (isMainInput) {
        const content = editor.state.toJSON().doc;
        addRef.current(content);
        editor.commands.clearContent(true);
      }
    },
    [onEnter, editor, isMainInput],
  );

  // This is a mechanism for overriding the IDE keyboard shortcut when inside of the webview
  const [ignoreHighlightedCode, setIgnoreHighlightedCode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (
        isMetaEquivalentKeyPressed(event) &&
        (isJetBrains() ? event.code === "KeyJ" : event.code === "KeyL")
      ) {
        setIgnoreHighlightedCode(true);
        setTimeout(() => {
          setIgnoreHighlightedCode(false);
        }, 100);
      } else if (event.key === "Escape") {
        ideMessenger.post("focusEditor", undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Re-focus main input after done generating
  useEffect(() => {
    if (editor && !active && isMainInput && document.hasFocus()) {
      editor.commands.focus(undefined, { scrollIntoView: false });
    }
  }, [isMainInput, active, editor]);

  // IDE event listeners
  useWebviewListener(
    "userInput",
    async (data) => {
      if (!isMainInput) {
        return;
      }
      editor?.commands.insertContent(data.input);
      onEnterRef.current({ useCodebase: false, noContext: true });
    },
    [editor, onEnterRef.current, isMainInput],
  );

  useWebviewListener(
    "addPerplexityContextinChat",
    async (data) => {
      if (!isMainInput || !editor) {
        return;
      }

      const item: ContextItemWithId = {
        content: data.text,
        name: "Context from PearAI Search",
        description: "Context from result of Perplexity AI",
        id: {
          providerTitle: "code",
          itemId: data.text,
        },
        language: data.language,
      };

      let index = 0;
      for (const el of editor.getJSON().content) {
        if (el.type === "codeBlock") {
          index += 2;
        } else {
          break;
        }
      }
      editor
        .chain()
        .insertContentAt(index, {
          type: "codeBlock",
          attrs: {
            item,
          },
        })
        .run();

      setTimeout(() => {
          editor.commands.blur();
          editor.commands.focus("end");
      }, 20);
    },
    [editor, onEnterRef.current, isMainInput],
  );

  useWebviewListener("jetbrains/editorInsetRefresh", async () => {
    editor?.chain().clearContent().focus().run();
  });

  useWebviewListener(
    "focusContinueInput",
    async (data) => {
      if (!isMainInput) {
        return;
      }
      if (historyLength > 0) {
        saveSession();
      }
      setTimeout(() => {
        editor?.commands.blur();
        editor?.commands.focus("end");
      }, 20);
    },
    [historyLength, saveSession, editor, isMainInput],
  );

  useWebviewListener(
    "focusContinueInputWithoutClear",
    async () => {
      if (!isMainInput) {
        return;
      }
      setTimeout(() => {
        editor?.commands.focus("end");
      }, 20);
    },
    [editor, isMainInput],
  );

  useWebviewListener(
    "focusContinueInputWithNewSession",
    async () => {
      if (!isMainInput) {
        return;
      }
      saveSession();
      setTimeout(() => {
        editor?.commands.focus("end");
      }, 20);
    },
    [editor, isMainInput],
  );

  useWebviewListener(
    "highlightedCode",
    async (data) => {
      if (!data.rangeInFileWithContents.contents || !isMainInput || !editor) {
        return;
      }
      if (!ignoreHighlightedCode) {
        const rif: RangeInFile & { contents: string } =
          data.rangeInFileWithContents;
        const basename = getBasename(rif.filepath);
        const relativePath = getRelativePath(
          rif.filepath,
          await ideMessenger.ide.getWorkspaceDirs(),
        );
        const rangeStr = `(${rif.range.start.line + 1}-${
          rif.range.end.line + 1
        })`;
        const item: ContextItemWithId = {
          content: rif.contents,
          name: `${basename} ${rangeStr}`,
          // Description is passed on to the LLM to give more context on file path
          description: `${relativePath} ${rangeStr}`,
          id: {
            providerTitle: "code",
            itemId: rif.filepath,
          },
        };

        let index = 0;
        for (const el of editor.getJSON().content) {
          if (el.type === "codeBlock") {
            index += 2;
          } else {
            break;
          }
        }
        editor
          .chain()
          .insertContentAt(index, {
            type: "codeBlock",
            attrs: {
              item,
            },
          })
          .run();

        if (data.prompt) {
          editor.commands.focus("end");
          editor.commands.insertContent(data.prompt);
        }

        if (data.shouldRun) {
          onEnterRef.current({ useCodebase: false, noContext: true });
        }

        setTimeout(() => {
          editor.commands.blur();
          editor.commands.focus("end");
        }, 20);
      }
      setIgnoreHighlightedCode(false);
    },
    [
      editor,
      isMainInput,
      historyLength,
      ignoreHighlightedCode,
      isMainInput,
      onEnterRef.current,
    ],
  );

  useWebviewListener(
    "isContinueInputFocused",
    async () => {
      return isMainInput && editorFocusedRef.current;
    },
    [editorFocusedRef, isMainInput],
    !isMainInput,
  );

  const [showDragOverMsg, setShowDragOverMsg] = useState(false);

  useEffect(() => {
    const overListener = (event: DragEvent) => {
      if (event.shiftKey) {
        return;
      }
      setShowDragOverMsg(true);
    };
    window.addEventListener("dragover", overListener);

    const leaveListener = (event: DragEvent) => {
      if (event.shiftKey) {
        setShowDragOverMsg(false);
      } else {
        setTimeout(() => setShowDragOverMsg(false), 2000);
      }
    };
    window.addEventListener("dragleave", leaveListener);

    return () => {
      window.removeEventListener("dragover", overListener);
      window.removeEventListener("dragleave", leaveListener);
    };
  }, []);

  const [optionKeyHeld, setOptionKeyHeld] = useState(false);

  // Use onTransaction to track content changes
  useEffect(() => {
    if (editor) {
      editor.on('transaction', () => {
        const newContent = editor.getJSON();
        lastContentRef.current = newContent;
        onChange?.(newContent);

        // If /edit is typed and no context items are selected, select the first

        if (contextItems.length > 0) {
          return;
        }

        const codeBlock = newContent.content?.find((el) => el.type === "codeBlock");
        if (!codeBlock) {
          return;
        }

        // Search for slashcommand type
        for (const p of newContent.content) {
          if (
            p.type !== "paragraph" ||
            !p.content ||
            typeof p.content === "string"
          ) {
            continue;
          }
          for (const node of p.content) {
            if (
              node.type === "slashcommand" &&
              ["/edit", "/comment"].includes(node.attrs.label)
            ) {
              // Update context items
              dispatch(
                setEditingContextItemAtIndex({ item: codeBlock.attrs.item }),
              );
              return;
            }
          }
        }
      });
    }
  }, [editor, onChange, contextItems, dispatch]);

  // Prevent content flash during streaming
  useEffect(() => {
    if (editor && lastContentRef.current) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(lastContentRef.current)) {
        editor.commands.setContent(lastContentRef.current);
      }
    }
  }, [editor, source]);

  return (
    <InputBoxDiv
      onKeyDown={(e) => {
        if (e.key === "Alt") {
          setOptionKeyHeld(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Alt") {
          setOptionKeyHeld(false);
        }
      }}
      className="cursor-text"
      onClick={() => {
        editor && editor.commands.focus();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setShowDragOverMsg(true);
      }}
      onDragLeave={(e) => {
        if (e.relatedTarget === null) {
          if (e.shiftKey) {
            setShowDragOverMsg(false);
          } else {
            setTimeout(() => setShowDragOverMsg(false), 2000);
          }
        }
      }}
      onDragEnter={() => {
        setShowDragOverMsg(true);
      }}
      onDrop={(event) => {
        if (
          !modelSupportsImages(
            defaultModel.provider,
            defaultModel.model,
            defaultModel.title,
            defaultModel.capabilities,
          )
        ) {
          return;
        }
        setShowDragOverMsg(false);
        const file = event.dataTransfer.files[0];
        handleImageFile(file).then(([img, dataUrl]) => {
          const { schema } = editor.state;
          const node = schema.nodes.image.create({ src: dataUrl });
          const tr = editor.state.tr.insert(0, node);
          editor.view.dispatch(tr);
        });
        event.preventDefault();
      }}
    > 
      {(!isPerplexity && !isAider) && <TopBar />}
      <EditorContent
        spellCheck={false}
        editor={editor}
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
      <InputToolbar
        showNoContext={optionKeyHeld}
        hidden={!(editorFocusedRef.current || isMainInput)}
        onAddContextItem={() => {
          if (editor.getText().endsWith("@")) {
          } else {
            // Add space so that if there's text right before, it still activates the dropdown
            editor.commands.insertContent(" @");
          }
        }}
        onEnter={onEnterRef.current}
        onImageFileSelected={(file) => {
          handleImageFile(file).then(([img, dataUrl]) => {
            const { schema } = editor.state;
            const node = schema.nodes.image.create({ src: dataUrl });
            editor.commands.command(({ tr }) => {
              tr.insert(0, node);
              return true;
            });
          });
        }}
      />
      {showDragOverMsg &&
        modelSupportsImages(
          defaultModel.provider,
          defaultModel.model,
          defaultModel.title,
          defaultModel.capabilities,
        ) && (
          <>
            <HoverDiv></HoverDiv>
            <HoverTextDiv>Hold ⇧ to drop image</HoverTextDiv>
          </>
        )}
    </InputBoxDiv>
  );
});

export default TipTapEditor;
