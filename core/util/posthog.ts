import os from "node:os";
import { TeamAnalytics } from "../control-plane/TeamAnalytics.js";

export class Telemetry {
  // Set to undefined whenever telemetry is disabled
  static client: any = undefined;
  static uniqueId = "NOT_UNIQUE";
  static os: string | undefined = undefined;
  static extensionVersion: string | undefined = undefined;
  static allow: boolean = true;

  static async capture(
    event: string,
    properties: { [key: string]: any },
    sendToTeam: boolean = false,
  ) {
    Telemetry.client?.capture({
      distinctId: Telemetry.uniqueId,
      event,
      properties: {
        ...properties,
        os: Telemetry.os,
        extensionVersion: Telemetry.extensionVersion,
      },
    });

    if (sendToTeam) {
      TeamAnalytics.capture(event, properties);
    }
  }

  static shutdownPosthogClient() {
    Telemetry.client?.shutdown();
  }

  static async setup(
    allow: boolean,
    uniqueId: string,
    extensionVersion: string,
  ) {
    Telemetry.uniqueId = uniqueId;
    Telemetry.os = os.platform();
    Telemetry.extensionVersion = extensionVersion;
    Telemetry.allow = allow;

    if (!allow) {
      Telemetry.client = undefined;
    }
    // else {
    //   try {
    //     if (!Telemetry.client) {
    //       const { PostHog } = await import("posthog-node");
    //       Telemetry.client = new PostHog(
    //         "phc_EixCfQZYA5It6ZjtZG2C8THsUQzPzXZsdCsvR8AYhfh",
    //         {
    //           host: "https://app.posthog.com",
    //         },
    //       );
    //     }
    //   } catch (e) {
    //     console.error(`Failed to setup telemetry: ${e}`);
    //   }
    // }
  }
}
