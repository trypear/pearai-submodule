import { Listbox } from "@headlessui/react";
import {
  ChevronDownIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { defaultBorderRadius, lightGray, vscEditorBackground } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { defaultModelSelector } from "../../redux/selectors/modelSelectors";
import { setDefaultModel } from "../../redux/slices/stateSlice";
import {
  setDialogMessage,
  setShowDialog,
} from "../../redux/slices/uiStateSlice";
import { RootState } from "../../redux/store";
import {
  getFontSize,
  getMetaKeyLabel,
  isMetaEquivalentKeyPressed,
} from "../../util";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { isAiderMode, isPerplexityMode } from "@/util/bareChatMode";
import { providers } from "../../pages/AddNewModel/configs/providers";

const StyledListboxButton = styled(Listbox.Button)`
  border: solid 1px ${lightGray}30;
  // background-color: ${lightGray}30;
  background-color: transparent;
  border-radius: 4px;  
  padding: 2px 4px;
  display: flex;
  align-items: center;
  gap: 2px;
	user-select: none;
  cursor: pointer;
  font-size: ${getFontSize() - 3}px;
  color: ${lightGray};
  &:focus {
    outline: none;
  }
`;

const StyledListboxOptions = styled(Listbox.Options) <{ newSession: boolean }>`
  list-style: none;
  padding: 6px;
  white-space: nowrap;
  cursor: default;
  z-index: 50;
  border: 1px solid ${lightGray}30; 
  border-radius: 10px;
  background-color: ${vscEditorBackground};
  max-height: 300px;
  overflow-y: auto;
	font-size: ${getFontSize() - 2}px;
	user-select: none;
	outline:none;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
  -ms-overflow-style: none;

  & > * {
    margin: 4px 0;
  }
`;

interface ListboxOptionProps {
  isCurrentModel?: boolean;
}

const StyledListboxOption = styled(Listbox.Option) <ListboxOptionProps>`
  cursor: pointer;
  border-radius: 6px;
  padding: 5px 4px;

  &:hover {
    background: ${(props) =>
    props.isCurrentModel ? `${lightGray}66` : `${lightGray}33`};
  }

  background: ${(props) =>
    props.isCurrentModel ? `${lightGray}66` : "transparent"};
`;

const StyledTrashIcon = styled(TrashIcon)`
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 8px;
  &:hover {
    color: red;
  }
`;

const Divider = styled.div`
  height: 2px;
  background-color: ${lightGray}35;
  margin: 0px 4px;
`;

function ModelOption({
  option,
  idx,
  showDelete,
}: {
  option: Option;
  idx: number;
  showDelete?: boolean;
}) {
  const defaultModel = useSelector(defaultModelSelector);
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);

  function onClickDelete(e) {
    e.stopPropagation();
    e.preventDefault();

    dispatch(setShowDialog(true));
    dispatch(
      setDialogMessage(
        <ConfirmationDialog
          title={`Delete ${option.title}`}
          text={`Are you sure you want to remove ${option.title} from your configuration?`}
          onConfirm={() => {
            ideMessenger.post("config/deleteModel", {
              title: option.title,
            });
          }}
        />,
      ),
    );
  }

  return (
    <StyledListboxOption
      key={idx}
      value={option.value}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      isCurrentModel={defaultModel?.title === option.title}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {option.provider === 'pearai_server' ? (
            <div className="flex items-center gap-1 mr-2">
              <img
                src={`${window.vscMediaUrl}/logos/pearai-color.png`}
                className="w-4 h-4 object-contain"
              />
              {option.title !== 'PearAI Model (Recommended)' && <img
                src={`${window.vscMediaUrl}/logos/${(() => {
                  const modelTitle = option.title.toLowerCase();
                  switch (true) {
                    case modelTitle === 'PearAI Model (Recommended)':
                      return 'pearai-color.png';
                    case modelTitle.includes('claude'):
                      return 'anthropic.png';
                    case modelTitle.includes('deepseek'):
                      return 'deepseek-svg.svg';
                    case modelTitle.includes('gemini'):
                      return 'gemini-icon.png';
                    case modelTitle.includes('gpt') || modelTitle.startsWith('o'): // OpenAI naming :(
                      return 'openai.png';
                    default:
                      return 'default.png';
                  }
                })()}`}
                className="w-3.5 h-3.5 object-contain rounded-sm"
              />}
            </div>
          ) : (
            option.provider ? <img
              src={`${window.vscMediaUrl}/logos/${providers[option.provider]?.icon}`}
              className="w-3.5 h-3.5 mr-2 flex-shrink-0 object-contain rounded-sm"
            /> : <CubeIcon className="w-3.5 h-3.5 stroke-2 mr-2 flex-shrink-0" />
          )}
          <span>{option.title}</span>
        </div>
        <StyledTrashIcon
          style={{ visibility: hovered && showDelete ? "visible" : "hidden" }}
          className="ml-auto"
          width="1.2em"
          height="1.2em"
          onClick={onClickDelete}
        />
      </div>
    </StyledListboxOption>
  );
}

function modelSelectTitle(model: any): string {
  if (model?.title) return model?.title;
  if (model?.model !== undefined && model?.model.trim() !== "") {
    if (model?.class_name) {
      return `${model?.class_name} - ${model?.model}`;
    }
    return model?.model;
  }
  return model?.class_name;
}

interface Option {
  value: string;
  title: string;
  provider: string;
  isDefault: boolean;
}

function ModelSelect() {
  const state = useSelector((state: RootState) => state.state);
  const dispatch = useDispatch();
  const defaultModel = useSelector(defaultModelSelector);
  const aiderMode = isAiderMode();
  const allModels = useSelector((state: RootState) => state.state.config.models);
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const selectedProfileId = useSelector(
    (store: RootState) => store.state.selectedProfileId
  );

  useEffect(() => {
    setOptions(
      allModels
        .filter((model) => {
          if (aiderMode) {
            return model?.title?.toLowerCase().includes("creator");
          }
          return (
            !model?.title?.toLowerCase().includes("creator") &&
            !model?.title?.toLowerCase().includes("perplexity")
          );
        })
        .map((model) => ({
          value: model.title,
          title: modelSelectTitle(model),
          provider: model.provider,
          isDefault: model?.isDefault,
        }))
    );
  }, [allModels, aiderMode]);

  useEffect(() => {
    const calculatePosition = () => {
      if (!buttonRef.current || !isOpen) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const MENU_WIDTH = 312;
      const MENU_HEIGHT = 320;
      const PADDING = 10;

      let left = Math.max(PADDING, Math.min(
        buttonRect.left,
        window.innerWidth - MENU_WIDTH - PADDING
      ));

      let top = buttonRect.bottom + 5;
      if (top + MENU_HEIGHT > window.innerHeight - PADDING) {
        top = Math.max(PADDING, buttonRect.top - MENU_HEIGHT - 5);
      }

      setMenuPosition({ top, left });
    };

    calculatePosition();

    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "'" && isMetaEquivalentKeyPressed(event)) {
        const direction = event.shiftKey ? -1 : 1;
        const currentIndex = options.findIndex(
          (option) => option.value === defaultModel?.title
        );
        let nextIndex = (currentIndex + 1 * direction) % options.length;
        if (nextIndex < 0) nextIndex = options.length - 1;
        dispatch(setDefaultModel({ title: options[nextIndex].value }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, defaultModel]);

  return (
    <Listbox
      onChange={(val: string) => {
        if (val === defaultModel?.title) return;
        dispatch(setDefaultModel({ title: val }));
      }}
      as="div"
      className="relative inline-block"
    >
      {({ open }) => {
        useEffect(() => {
          setIsOpen(open);
        }, [open]);

        return (
          <>
            <StyledListboxButton
              ref={buttonRef}
              className="h-[18px] overflow-hidden"
            >
              {defaultModel?.provider === 'pearai_server' ? (
                <div className="flex items-center">
                  <img
                    src={`${window.vscMediaUrl}/logos/pearai-color.png`}
                    className="w-[15px] h-[15px] object-contain"
                  />
                  {defaultModel.title !== 'PearAI Model (Recommended)' && <img
                    src={`${window.vscMediaUrl}/logos/${(() => {
                      const modelTitle = defaultModel.title.toLowerCase();
                      switch (true) {
                        case modelTitle.includes('claude'):
                          return 'anthropic.png';
                        case modelTitle.includes('gpt'):
                          return 'openai.png';
                        case modelTitle.includes('deepseek'):
                          return 'deepseek-svg.svg';
                        case modelTitle.includes('gemini'):
                          return 'gemini-icon.png';
                        default:
                          return 'default.png';
                      }
                    })()}`}
                    className="w-[15px] h-[12px] object-contain rounded-sm  "
                  />}
                </div>
              ) : (
                <img
                  src={`${window.vscMediaUrl}/logos/${providers[defaultModel?.provider]?.icon}`}
                  width="18px"
                  height="18px"
                  style={{
                    objectFit: "contain",
                  }}
                />
              )}
              {modelSelectTitle(defaultModel) || "Select model"}{" "}
            </StyledListboxButton>

            {open && (
              <StyledListboxOptions
                newSession={state.history.length === 0}
                style={{
                  position: 'fixed',
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
              >
                <span
                  style={{
                    color: lightGray,
                    padding: "2px",
                    marginTop: "2px",
                    display: "block",
                    textAlign: "center",
                    fontSize: getFontSize() - 3,
                  }}
                >
                  Press <kbd className="font-mono">{getMetaKeyLabel()}</kbd>{" "}
                  <kbd className="font-mono">'</kbd> to cycle between models.
                </span>
                <Divider />
                <StyledListboxOption
                  key={options.length}
                  onClick={(e) => {
                    if (aiderMode) {
                      ideMessenger.post("openConfigJson", undefined);
                      return;
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    navigate("/addModel");
                  }}
                  value={"addModel" as any}
                >
                  <div className="flex items-center">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Model
                  </div>
                </StyledListboxOption>
                <Divider />
                {options
                  .filter((option) => option.isDefault)
                  .map((option, idx) => (
                    <ModelOption
                      option={option}
                      idx={idx}
                      key={idx}
                      showDelete={!option.isDefault}
                    />
                  ))}

                {selectedProfileId === "local" && (
                  <>
                    {options.length > 0 && <Divider />}
                    {options
                      .filter((option) => !option.isDefault)
                      .map((option, idx) => (
                        <ModelOption
                          key={idx}
                          option={option}
                          idx={idx}
                          showDelete={!option.isDefault}
                        />
                      ))}
                  </>
                )}
              </StyledListboxOptions>
            )}
          </>
        );
      }}
    </Listbox>
  );
}

export default ModelSelect;