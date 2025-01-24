import { CircleAlert } from "lucide-react";
import { vscBackground, vscBadgeBackground, vscForeground } from "..";
import styled from "styled-components";
const StyledWarningCard = styled.div`
  margin: 16px auto;
  max-width: 600px;
  padding: 8px 16px;
  background-color: ${vscBadgeBackground}ee;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${vscForeground};
`;

const StyledCircleAlert = styled(CircleAlert)`
  margin-right: 2px;
  width: 19px;
  height: 19px;
  flex-shrink: 0;
`;

interface WarningCardProps {
    children?: React.ReactNode;
}

export default function WarningCard({ children }: WarningCardProps) {
    return (
        <div className="max-w-3xl mx-auto px-2">
            <StyledWarningCard>
                <StyledCircleAlert className="stroke-2" />
                <span>
                    {children}
                </span>
            </StyledWarningCard>
        </div>
    );
};
