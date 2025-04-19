import { Button, ButtonProps } from "./../ui/button"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"
import React, { useCallback, useState, useMemo, useEffect } from "react"

// Define our InputBoxButtonProps
export interface InputBoxButtonProps extends ButtonProps {
  id: string
  icon?: React.ReactNode
  label: string
  togglable?: boolean
}

// Define main component props
export interface InputBoxProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>
  initialMessage: string
  setInitialMessage: (value: string) => void
  handleRequest: () => void
  isDisabled: boolean
  placeholder?: string
  leftButtons?: InputBoxButtonProps[]
  rightButtons?: InputBoxButtonProps[]
  submitButton?: Omit<InputBoxButtonProps, 'onClick'> & { onClick?: () => void }
  maxHeight?: string | number // Modified to accept string values like '50vh'
  lockToWhite?: boolean
  initialRows?: number
  showBorder?: boolean
  borderColor?: string
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
  maxHeight = '40vh', // Default to 50vh instead of a fixed pixel value
  lockToWhite = false,
  initialRows,
  showBorder = false,
  borderColor,
}) => {
  // Keep track of which buttons are toggled
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});

  // Adjust textarea height on content change or when initialMessage changes
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';

      // Set the height to the scrollHeight, but not exceeding maxHeight
      // maxHeight will be handled by CSS max-height property
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [initialMessage, textareaRef]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInitialMessage(e.target.value);

      // The height adjustment is now handled by the useEffect
    },
    [setInitialMessage],
  )

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isDisabled && e.key === "Enter" && !e.shiftKey && initialMessage.trim()) {
        e.preventDefault()
        handleRequest()
      }
    },
    [handleRequest, initialMessage, isDisabled],
  )

  const handleToggle = useCallback((buttonId: string, toggled: boolean) => {
    setToggleStates(prev => ({
      ...prev,
      [buttonId]: toggled
    }));
  }, []);

  // Render a button based on its props
  const renderButton = useCallback((buttonProps: InputBoxButtonProps) => {
    const { id, icon, label, togglable, onToggle, ...rest } = buttonProps;

    // Determine if button is toggled
    const isToggled = toggleStates[id] ?? buttonProps.toggled ?? false;

    return (
      <Button
        key={id}
        toggled={togglable ? isToggled : undefined}
        onToggle={togglable ? (newToggled) => {
          handleToggle(id, newToggled);
          onToggle?.(newToggled);
        } : undefined}
        {...rest}
      >
        {icon}
        {label}
      </Button>
    );
  }, [toggleStates, handleToggle]);

  const renderedLeftButtons = useMemo(() =>
    leftButtons.map(renderButton),
    [leftButtons, renderButton]
  );

  const renderedRightButtons = useMemo(() =>
    rightButtons.map(renderButton),
    [rightButtons, renderButton]
  );

  // Determine border style based on props
  const borderStyle = useMemo(() => {
    if (!showBorder) return {};

    return {
      border: `1px solid ${borderColor || (lockToWhite ? 'rgb(209, 213, 219)' : 'var(--textSeparatorForeground, #e5e7eb)')}`,
    };
  }, [showBorder, borderColor, lockToWhite]);

  // Convert maxHeight to a CSS value
  const maxHeightStyle = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div
        className={`min-h-32 flex items-center rounded-md flex-col px-4 ${showBorder ? 'border-box' : ''}`}
        style={{
          backgroundColor: lockToWhite ? 'white' : 'var(--widgetBackground)',
          ...borderStyle
        }}
      >
        <div className="flex-1 w-full">
          <textarea
            ref={textareaRef}
            value={initialMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder={placeholder}
            className="w-full appearance-none bg-transparent outline-none focus:outline-none resize-none overflow-y-auto rounded-lg leading-normal py-3 px-4 flex items-center border-none min-h-5"
            style={{
              color: lockToWhite ? 'rgb(55, 65, 81)' : 'var(--widgetForeground)',
              maxHeight: maxHeightStyle, // Apply the maxHeight as a style
              overflowY: 'auto' // Ensure scrolling is enabled when content exceeds maxHeight
            }}
            autoFocus={true}
            tabIndex={1}
            rows={initialRows || 1}
            disabled={isDisabled}
          />
        </div>
        <div className="flex justify-between space-x-2 p-2 w-full">
          <div className="flex flex-1 gap-2">
            {leftButtons.length > 0 && renderedLeftButtons}
          </div>
          <div className="flex gap-2 ml-auto">
            {rightButtons.length > 0 && renderedRightButtons}
            {submitButton && (
              <Button
                onClick={handleRequest}
                disabled={!initialMessage.trim() || isDisabled}
                tabIndex={3}
                variant={submitButton.variant}
                size={submitButton.size}
                {...submitButton}
              >
                {submitButton.icon}
                {submitButton.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}