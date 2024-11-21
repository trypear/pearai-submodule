import { useContext } from "react";
import ActiveFileIndicator from "./ActiveFileIndicator";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import styled from "styled-components";
import {
  defaultBorderRadius,
  lightGray,
  vscBadgeBackground,
  vscBadgeForeground,
  vscForeground,
} from "..";
import {
  getMetaKeyLabel,
} from "../../util";

export const MenuButton = styled.div`
  padding: 2px 4px;
  display: flex;
  align-items: center;

  background-color: ${lightGray + "33"};
  border-radius: ${defaultBorderRadius};
  color: ${vscForeground};

  &:hover {
    background-color: ${vscBadgeBackground};
    color: ${vscBadgeForeground};
  }

  cursor: pointer;
`;

export default function TopBar() {
  const ideMessenger = useContext(IdeMessengerContext);

  const handleClick = () => {
    ideMessenger.post("openInventory", undefined);
}
  return (
    <div className="flex justify-between items-center mb-2 text-xs w-full">
      <div className="flex items-center gap-1">
      <ActiveFileIndicator />
      </div>
        <MenuButton 
        onClick={handleClick}
      >
        {getMetaKeyLabel()}+1 Inventory
      </MenuButton>
    </div>
  );
};