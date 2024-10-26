import { createSelector } from "@reduxjs/toolkit";
import { ComboBoxItemType } from "../../components/mainInput/types";
import { RootState } from "../store";
import { getBasename } from "core/util";

export const selectSlashCommands = createSelector(
  [(store: RootState) => store.state.config.slashCommands],
  (slashCommands) => {
    return (
      slashCommands?.map((cmd) => {
        return {
          title: `/${cmd.name}`,
          description: cmd.description,
          type: "slashCommand" as ComboBoxItemType,
        };
      }) || []
    );
  },
);

export const selectContextProviderDescriptions = createSelector(
  [(store: RootState) => store.state.config.contextProviders],
  (providers) => {
    return providers.filter((desc) => desc.type === "submenu") || [];
  },
);

export const selectUseActiveFile = createSelector(
  [(store: RootState) => store.state.config.experimental?.defaultContext],
  (defaultContext) => defaultContext?.includes("activeFile"),
);

export const selectActiveFileName = createSelector(
  [(state: RootState) => state.state.activeFile],
  (activeFile) => {
    if (!activeFile || activeFile.includes("extension-output")) {
      return "Active File";
    }
    const basename = getBasename(activeFile);

    return basename;
  },
);
