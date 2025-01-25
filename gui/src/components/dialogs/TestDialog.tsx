import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Button } from "..";
import {
  setDialogMessage,
  setShowDialog,
} from "../../redux/slices/uiStateSlice";

const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 8px;
  align-items: center;
`;

function TestDialog() {
  const dispatch = useDispatch();

  return (
    <div className="p-4">
      <h3>Test Dialog</h3>
      <p>This is a test dialog</p>

      <GridDiv>
        <Button
          onClick={() => {
            dispatch(setShowDialog(false));
            dispatch(setDialogMessage(undefined));
          }}
        >
          Close
        </Button>
      </GridDiv>
    </div>
  );
}

export default TestDialog;
