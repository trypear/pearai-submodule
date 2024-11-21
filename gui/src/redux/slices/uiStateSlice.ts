import { PayloadAction, createSlice } from "@reduxjs/toolkit";
type UiState = {
  bottomMessage: JSX.Element | undefined;
  bottomMessageCloseTimeout: NodeJS.Timeout | undefined;
  displayBottomMessageOnBottom: boolean;
  showDialog: boolean;
  dialogMessage: string | JSX.Element;
  dialogEntryOn: boolean;
  activeFilePath: string | undefined;
  activeConversationActiveFile: string | undefined; // This is used to keep track of the active file in an active conversation
  useActiveFile: boolean;
};

export const uiStateSlice = createSlice({
  name: "uiState",
  initialState: {
    bottomMessage: undefined,
    bottomMessageCloseTimeout: undefined,
    showDialog: false,
    dialogMessage: "",
    dialogEntryOn: false,
    displayBottomMessageOnBottom: true,
    activeFilePath: undefined,
    useActiveFile: false,
    activeConversationActiveFile: undefined,
  } as UiState,
  reducers: {
    setBottomMessage: (
      state,
      action: PayloadAction<UiState["bottomMessage"]>
    ) => {
      state.bottomMessage = action.payload;
    },
    setBottomMessageCloseTimeout: (
      state,
      action: PayloadAction<UiState["bottomMessageCloseTimeout"]>
    ) => {
      if (state.bottomMessageCloseTimeout) {
        clearTimeout(state.bottomMessageCloseTimeout);
      }
      state.bottomMessageCloseTimeout = action.payload;
    },
    setDialogMessage: (
      state,
      action: PayloadAction<UiState["dialogMessage"]>
    ) => {
      state.dialogMessage = action.payload;
    },
    setDialogEntryOn: (
      state,
      action: PayloadAction<UiState["dialogEntryOn"]>
    ) => {
      state.dialogEntryOn = action.payload;
    },
    setShowDialog: (state, action: PayloadAction<UiState["showDialog"]>) => {
      state.showDialog = action.payload;
    },
    setDisplayBottomMessageOnBottom: (
      state,
      action: PayloadAction<UiState["displayBottomMessageOnBottom"]>
    ) => {
      state.displayBottomMessageOnBottom = action.payload;
    },
    setActiveFilePath: (state, action: PayloadAction<UiState["activeFilePath"]>) => {
      state.activeFilePath = action.payload ?? "";
    },
    setUseActiveFile: (state, action: PayloadAction<UiState["useActiveFile"]>) => {
      state.useActiveFile = action.payload;
    },
    setActiveConversationActiveFile: (state, action: PayloadAction<string>) => {
      state.activeConversationActiveFile = action.payload ?? undefined;
    },
  },
});

export const {
  setBottomMessage,
  setBottomMessageCloseTimeout,
  setDialogMessage,
  setDialogEntryOn,
  setShowDialog,
  setDisplayBottomMessageOnBottom,
  setActiveFilePath,
  setUseActiveFile,
  setActiveConversationActiveFile,
} = uiStateSlice.actions;
export default uiStateSlice.reducer;
