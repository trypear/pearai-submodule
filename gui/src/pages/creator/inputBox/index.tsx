import { Button, ButtonProps } from "./../ui/button";
import { ArrowTurnDownLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { ButtonID } from "../utils";
import { cn } from "../../../lib/utils";
import { FileUpload, FileUploadProps } from "./FileUpload";
import { UploadIcon } from "lucide-react";

// Define our InputBoxButtonProps
export interface InputBoxButtonProps extends ButtonProps {
  id: string;
  icon?: React.ReactNode;
  label: string;
  togglable?: boolean;
}

export interface InputBoxProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  initialMessage: string;
  setInitialMessage: (value: string) => void;
  handleRequest: () => void;
  isDisabled: boolean;
  placeholder?: string;
  leftButtons?: InputBoxButtonProps[];
  rightButtons?: InputBoxButtonProps[];
  submitButton?: Omit<InputBoxButtonProps, "onClick"> & {
    onClick?: () => void;
  };
  maxHeight?: string | number;
  lockToWhite?: boolean;
  initialRows?: number;
  showBorder?: boolean;
  borderColor?: string;
  className?: string;
  fileUpload?: Omit<FileUploadProps, "setFileUploadCallback">;
  disabled?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({
  textareaRef,
  initialMessage,
  setInitialMessage,
  handleRequest,
  isDisabled,
  placeholder,
  leftButtons = [],
  rightButtons = [],
  submitButton,
  maxHeight = "40vh",
  lockToWhite = false,
  initialRows,
  showBorder = false,
  borderColor,
  className,
  fileUpload,
  disabled = false,
}) => {
  // Keep track of which buttons are toggled
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [fileUploadCallback, setFileUploadCallback] = useState<() => void>(
    () => {},
  );

  // Adjust textarea height on content change or when initialMessage changes
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";

      // Set the height to the scrollHeight, but not exceeding maxHeight
      // maxHeight will be handled by CSS max-height property
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [initialMessage, textareaRef]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInitialMessage(e.target.value);
    },
    [setInitialMessage],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (fileUpload) {
        const items = e.clipboardData.items;
        const imageItems = Array.from(items).filter((item) =>
          item.type.startsWith("image/"),
        );

        if (imageItems.length > 0) {
          e.preventDefault();
          const files = imageItems
            .map((item) => item.getAsFile())
            .filter(Boolean) as File[];
          fileUpload.setFiles([...fileUpload.files, ...files]);
        }
      }
    },
    [fileUpload],
  );

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        !isDisabled &&
        e.key === "Enter" &&
        !e.shiftKey &&
        initialMessage.trim()
      ) {
        e.preventDefault();
        handleRequest();
      }
    },
    [handleRequest, initialMessage, isDisabled],
  );

  useEffect(() => {
    setToggleStates((prev) => ({
      ...prev,
      ...leftButtons.reduce((acc, button) => {
        acc[button.id] = button.toggled ?? false;
        return acc;
      }, {} as Record<string, boolean>),
    }));
  }, [leftButtons, rightButtons]);

  const handleToggle = useCallback((buttonId: string, toggled: boolean) => {
    setToggleStates((prev) => ({
      ...prev,
      [buttonId]: toggled,
    }));
  }, []);

  // Render a button based on its props
  const renderButton = useCallback(
    (buttonProps: InputBoxButtonProps) => {
      const { id, icon, label, togglable, onToggle, ...rest } = buttonProps;

      // Determine if button is toggled
      const isToggled = toggleStates[id] ?? buttonProps.toggled ?? false;

      return (
        <Button
          key={id}
          toggled={togglable ? isToggled : undefined}
          onClick={() => {
            if (togglable) {
              console.log(`Button ${id} toggled: ${!isToggled}`);
              handleToggle(id, !isToggled);
              onToggle?.(!isToggled);
            }
          }}
          {...rest}
          className="rounded-lg p-1.5 cursor-pointer"
          disabled={disabled}
        >
          <div className="flex items-center gap-1">
            {icon}
            {label}
          </div>
        </Button>
      );
    },
    [toggleStates, handleToggle],
  );

  const renderedLeftButtons = useMemo(() => {
    const uploadButton = {
      id: "upload",
      label: "Upload",
      icon: <UploadIcon />,
      variant: "secondary",
      size: "sm",
      onClick: () => fileUploadCallback(),
    } satisfies InputBoxButtonProps;

    return [...leftButtons, ...(fileUpload ? [uploadButton] : [])].map(
      renderButton,
    );
  }, [leftButtons, renderButton, fileUpload]);

  const renderedRightButtons = useMemo(
    () => rightButtons.map(renderButton),
    [rightButtons, renderButton],
  );

  // Determine border style based on props
  const borderStyle = useMemo(() => {
    if (!showBorder) return {};

    return {
      border: `1px solid ${
        borderColor ||
        (lockToWhite
          ? "rgb(209, 213, 219)"
          : "var(--textSeparatorForeground, #e5e7eb)")
      }`,
    };
  }, [showBorder, borderColor, lockToWhite]);

  // Convert maxHeight to a CSS value
  const maxHeightStyle =
    typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  const isNewProjectSelected = useMemo(() => {
    return leftButtons.some(
      (button) => button.id === ButtonID.NEW_PROJECT && toggleStates[button.id],
    );
  }, [leftButtons, toggleStates]);

  return (
    <div
      className={cn(
        `flex flex-col p-2 items-center border border-solidd border-red-500 transition-all duration-300 ease-in-out ${
          isNewProjectSelected ? "rounded-t-xl" : "rounded-xl"
        } ${showBorder ? "border-box" : ""}`,
        className,
        "relative",
      )}
      style={{
        backgroundColor: lockToWhite ? "white" : "var(--widgetBackground)",
        ...borderStyle,
      }}
    >
      {fileUpload && (
        <div
          className="w-full overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
          style={{
            maxHeight: fileUpload?.files.length ? "500px" : "0px",
            opacity: fileUpload?.files.length ? 1 : 0,
          }}
        >
          <FileUpload
            files={fileUpload.files}
            setFiles={fileUpload.setFiles}
            fileTypes={fileUpload.fileTypes}
            maxFileSize={fileUpload.maxFileSize}
            className="w-full mb-2"
            setFileUploadCallback={setFileUploadCallback}
          />
        </div>
      )}

      <div className="flex w-full mb-1">
        <textarea
          ref={textareaRef}
          value={initialMessage}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={`w-full appearance-none bg-transparent outline-none resize-none focus:outline-none overflow-y-auto rounded-lg leading-normal flex items-center border-none border-solidd border-gray-300 min-h-5 font-inherit ${
            isNewProjectSelected ? "max-h-[200px]" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            color: lockToWhite ? "rgb(55, 65, 81)" : "var(--widgetForeground)",
            maxHeight: maxHeightStyle,
            overflowY: "auto",
            fontFamily: "inherit",
          }}
          autoFocus={true}
          tabIndex={1}
          rows={initialRows || 1}
          disabled={isDisabled || disabled}
        />
      </div>
      <div className="flex w-full justify-between space-x-2 border border-solidd border-red-500">
        <div className="flex flex-1 gap-2">
          {leftButtons.length > 0 && renderedLeftButtons}
        </div>
        <div className="flex gap-2 ml-auto">
          {rightButtons.length > 0 && renderedRightButtons}
          {submitButton && (
            <Button
              onClick={handleRequest}
              // disabled={!initialMessage.trim() || isDisabled}

              tabIndex={3}
              variant={submitButton.variant}
              size={submitButton.size}
              className="rounded-lg p-1.5"
              disabled={disabled}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                {submitButton.icon}
                {submitButton.label}
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
