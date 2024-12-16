import styled from "styled-components";
import { Fragment } from "react";
import {
    lightGray,
    vscEditorBackground,
    vscForeground,
} from "..";

interface ShortcutButtonProps {
    keys: string[];
    onClick?: () => void;
    offFocus?: boolean;
    className?: string;
    label?: string;
    labelInside?: boolean; // New prop
}

const StyledShortcutButton = styled.div<{ offFocus: boolean }>`
padding: 1px 4px;
gap: 2px;
    display: flex;
    align-items: center;
    color: ${vscForeground};
    background-color: ${vscEditorBackground};
    border: 1.5px solid ${(props) =>
    props.offFocus ? undefined : lightGray + "33"};
    border-radius: 6px;
`;

const LabelSpan = styled.span`
    opacity: 0.7;
    margin-left: 6px;
`;

const KeySpan = styled.span`
	font-weight: 500;
`;

const PlusSpan = styled.span`
	margin-bottom: 2px;
	font-weight: 600;
    opacity: 0.5;
`;

export function ShortcutButton({
    keys,
    onClick,
    offFocus = false,
    label,
    labelInside = false
}: ShortcutButtonProps) {
    return (
        <div onClick={onClick} className="flex items-center gap-1 text-[10px] cursor-pointer">
            <StyledShortcutButton offFocus={offFocus}>
                {keys.map((key, index) => (
                    <Fragment key={index}>
                        <KeySpan>{key}</KeySpan>
                        {index < keys.length - 1 && <PlusSpan>+</PlusSpan>}
                    </Fragment>
                ))}
                {labelInside && label && <LabelSpan>{label}</LabelSpan>}
            </StyledShortcutButton>
            {!labelInside && label}
        </div>
    );
}
