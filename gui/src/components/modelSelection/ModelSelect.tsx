import { Listbox } from "@headlessui/react";
import {
  ChevronDownIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { defaultBorderRadius, lightGray, vscButtonBackground, vscEditorBackground, vscInputBackground, vscBadgeForeground, vscInputBorder, vscListActiveBackground, vscBadgeBackground, vscSidebarBorder } from "..";
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

const StyledListboxButton = styled(Listbox.Button)`
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 2px;
  border: none;
  cursor: pointer;
  font-size: ${getFontSize() - 2}px;
  background: transparent;
  color: ${lightGray};
  &:focus {
    outline: none;
  }
`;

const StyledListboxOptions = styled(Listbox.Options)<{ newSession: boolean }>`
  margin-top: 4px;
  position: absolute;
  bottom: ${(props) => props.newSession ? 'auto' : '100%'};
  left: 0;
  list-style: none;
  padding: 4px;
  white-space: nowrap;
  cursor: default;
  z-index: 1100;

  border-radius: 10px;
  background-color: ${vscEditorBackground};
  max-height: 450px;
  overflow-y: auto;

  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    margin: 4px 0; /* Add space at top and bottom of track */
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${lightGray}44;
    border-radius: 4px;
    
    &:hover {
      background: ${lightGray}88;
    }
  }

  /* Firefox Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${lightGray}44 transparent;

  /* Adjust content padding to account for rounded corners */
  & > * {
    margin: 2px 0;
  }

`;

const StyledListboxOption = styled(Listbox.Option)`
  cursor: pointer;
  border-radius: ${defaultBorderRadius};
  padding: 6px;

  &:hover {
    background: ${(props) => `${lightGray}33`};
  }
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
  height: 1px;
  background-color: ${lightGray}35;
  margin: 4px;
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
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center pr-4">
          <CubeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
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
  isDefault: boolean;
}

function ModelSelect() {
  const state = useSelector((state: RootState) => state.state);
  const dispatch = useDispatch();
  const defaultModel = useSelector(defaultModelSelector);
  const perplexityMode = isPerplexityMode();
  const aiderMode = isAiderMode();
  const allModels = useSelector(
    (state: RootState) => state.state.config.models,
  );

  const location = useLocation();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);

  const [options, setOptions] = useState<Option[]>([]);
  const selectedProfileId = useSelector(
    (store: RootState) => store.state.selectedProfileId,
  );

  useEffect(() => {
    setOptions(
      allModels
        .filter((model) => {
          if (aiderMode) {
            // In Aider mode, only include models with "aider" in title
            return model?.title?.toLowerCase().includes("creator");
          }
          // In normal mode, exclude aider and perplexity models
          return (
            !model?.title?.toLowerCase().includes("creator") &&
            !model?.title?.toLowerCase().includes("perplexity")
          );
        })
        .map((model) => {
          return {
            value: model.title,
            title: modelSelectTitle(model),
            isDefault: model?.isDefault,
          };
        }),
    );
  }, [allModels, aiderMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "'" && isMetaEquivalentKeyPressed(event)) {
        const direction = event.shiftKey ? -1 : 1;
        const currentIndex = options.findIndex(
          (option) => option.value === defaultModel?.title,
        );
        let nextIndex = (currentIndex + 1 * direction) % options.length;
        if (nextIndex < 0) nextIndex = options.length - 1;
        dispatch(setDefaultModel({ title: options[nextIndex].value }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [options, defaultModel]);

  return (
    <Listbox
      onChange={(val: string) => {
        if (val === defaultModel?.title) return;
        dispatch(setDefaultModel({ title: val }));
      }}
    >
      <div className="relative inline-block">
        <StyledListboxButton
          className="h-[18px] overflow-hidden"
          style={{ padding: 0 }}
        >
          <span className="hover:underline">
            {modelSelectTitle(defaultModel) || "Select model"}{" "}
            <ChevronDownIcon className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
        </StyledListboxButton>
        <StyledListboxOptions newSession={state.history.length === 0 ? true : false}>
          <span
            style={{
              color: lightGray,
              padding: "4px",
              marginTop: "4px",
              display: "block",
              textAlign: "right",
            }}
          >
            Press <kbd className="font-mono">{getMetaKeyLabel()}</kbd> <kbd className="font-mono">'</kbd> to cycle between models.
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
      </div>
    </Listbox>
  );
}

export default ModelSelect;
