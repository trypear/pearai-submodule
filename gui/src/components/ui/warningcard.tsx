import { CircleAlert } from "lucide-react";
import { vscBackground, vscBadgeBackground, vscForeground } from "..";
import styled from "styled-components";

const StyledWarningCard = styled.div`
  margin: 12px auto;
  max-width: 600px;
  padding: 8px 16px;
  background-color: ${vscBadgeBackground}ee;
  border: 2px solid ${vscForeground};
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${vscForeground};
`;


interface WarningCardProps {
    children?: React.ReactNode;
}

export default function WarningCard({ children }: WarningCardProps) {
    return (
        <div className="max-w-3xl mx-auto px-2">
            <StyledWarningCard>
                <CircleAlert className="w-6 h-6 stroke-2" />
                <span>
                    {children}
                </span>
            </StyledWarningCard>
        </div>
    );
};
