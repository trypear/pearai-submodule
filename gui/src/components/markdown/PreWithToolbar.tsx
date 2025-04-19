import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import useUIConfig from "../../hooks/useUIConfig";
import CodeBlockToolBar from "./CodeBlockToolbar";
import FileCreateChip from "./FileCreateChip";
import { useSelector } from "react-redux";
import { defaultModelSelector } from "../../redux/selectors/modelSelectors";

function childToText(child: any): string {
  if (typeof child === "string") {
    return child;
  }

  if (Array.isArray(child)) {
    return child.map(childToText).join("");
  }

  if (child?.props?.children) {
    return childToText(child.props.children);
  }

  return "";
}

function childrenToText(children: any): string {
  return Array.isArray(children)
    ? children.map(childToText).join("")
    : childToText(children);
}

export type ToolbarOptions = {
  insertAtCursor?: boolean;
  copy?: boolean;
  runInTerminal?: boolean;
  copyAndReturn?: boolean;
  fastApply?: boolean;
}

interface PreWithToolbarProps {
  children: any;
  language: string | undefined;
  toolbarOptions?: ToolbarOptions;
  onBlockEditClick?: (editedContent: string) => void;
  codeString: string;
}

function PreWithToolbar(props: PreWithToolbarProps) {
  const uiConfig = useUIConfig();
  const toolbarBottom = uiConfig?.codeBlockToolbarPosition == "bottom";

  const [rawCodeBlock, setRawCodeBlock] = useState("");
  const [isCreateFile, setIsCreateFile] = useState(false);
  const [checkedForCreateFile, setCheckedForCreateFile] = useState(false);

  const defaultModel = useSelector(defaultModelSelector);

  useEffect(() => {
    const debouncedEffect = debounce(() => {
      setRawCodeBlock(childrenToText(props.children.props.children));
    }, 50);

    debouncedEffect();

    return () => {
      debouncedEffect.cancel();
    };
  }, [props.children]);

  useEffect(() => {
    if (isCreateFile || checkedForCreateFile) return;

    const lines = childrenToText(props.children.props.children)
      .trim()
      .split("\n");
    // file creation code block will only have 1 line
    if (lines.length > 2) {
      setCheckedForCreateFile(true);
    }

    if (lines[0].startsWith("pearCreateFile:")) {
      setIsCreateFile(true);
    } else {
      setIsCreateFile(false);
    }
  }, [props.children]);

  return isCreateFile ? (
    <FileCreateChip rawCodeBlock={rawCodeBlock}></FileCreateChip>
  ) : (
    <div style={{ padding: "0px" }} className="relative">
      {!toolbarBottom && (
        <CodeBlockToolBar
          text={rawCodeBlock}
          bottom={toolbarBottom}
          language={props.language}
          toolbarOptions={props.toolbarOptions}
          onBlockEditClick={props.onBlockEditClick}
        ></CodeBlockToolBar>
      )}
      {props.children}
      {toolbarBottom && (
        <CodeBlockToolBar
          text={rawCodeBlock}
          bottom={toolbarBottom}
          language={props.language}
          toolbarOptions={props.toolbarOptions}
          onBlockEditClick={props.onBlockEditClick}
        ></CodeBlockToolBar>
      )}
    </div>
  );
}

export default PreWithToolbar;
