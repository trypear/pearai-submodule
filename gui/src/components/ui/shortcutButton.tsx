import styled from "styled-components";
import { Fragment } from "react";
import {
    defaultBorderRadius,
    lightGray,
    vscBadgeBackground,
    vscBadgeForeground,
    vscForeground,
} from "..";

interface ShortcutButtonProps {
    keys: string[];
    onClick?: () => void;
    offFocus?: boolean;
    className?: string;
    label?: string;
}

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    border-radius: 6px;
    color: ${vscForeground};
`;

const StyledShortcutButton = styled.div<{ offFocus: boolean }>`
    padding: 0rem 0.25rem;
    display: flex;
    align-items: center;
    gap: 2px;

    border: 1.5px solid ${(props) =>
        props.offFocus ? undefined : lightGray + "33"};
    border-radius: ${defaultBorderRadius};
`;

const KeySpan = styled.span`
`;

const PlusSpan = styled.span`
    opacity: 0.5;
`;

export function ShortcutButton({ keys, onClick, offFocus = false, className = "", label }: ShortcutButtonProps) {
    return (
        <Container onClick={onClick} className={className}>
            <StyledShortcutButton offFocus={offFocus}>
                {keys.map((key, index) => (
                    <Fragment key={index}>
                        <KeySpan>{key}</KeySpan>
                        {index < keys.length - 1 && <PlusSpan>+</PlusSpan>}
                    </Fragment>
                ))}
            </StyledShortcutButton>
            {label && <span className="text-[10px]">{label}</span>}
        </Container>
    );
}
