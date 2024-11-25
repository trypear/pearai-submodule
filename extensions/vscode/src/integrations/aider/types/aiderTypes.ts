export interface AiderState {
  state: "undefined" | "starting" | "uninstalled" | "ready" |  "stopped" |"crashed" | "signedOut" | "notgitrepo";
  timeStamp?: number;
}