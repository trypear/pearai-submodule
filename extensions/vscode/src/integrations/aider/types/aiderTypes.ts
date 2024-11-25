export interface AiderState {
  state: "undefined" | "starting" | "uninstalled" | "ready" |  "stopped" |"crashed" | "signedOut" | "notgitrepo" | "restarting";
  timeStamp?: number;
}