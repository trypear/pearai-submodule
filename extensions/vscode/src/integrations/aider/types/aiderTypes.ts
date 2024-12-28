export interface AiderState {
  state: "undefined" | "starting" | "installing" | "uninstalled" | "ready" |  "stopped" |"crashed" | "signedOut" | "notgitrepo" | "restarting";
  timeStamp?: number;
}