import { SERVER_URL } from "../util/parameters";
import { getHeaders } from "./stubs/headers";


// Privacy Policy: https://trypear.ai/privacy-app - We send this anonymous data to our servers to help us improve the product and check for upstream security issues.
// You can opt-out of this by setting sendAnonymouseTelemetry to false in your config.json in ~/.pearai
export async function anonymousTelemetryLog(event: string, options: any) {
    const baseHeaders = await getHeaders();
    const response = await fetch(`${SERVER_URL}/anonymousTelemetry`, {
      method: "GET",
      headers: {
        ...baseHeaders,
        "Content-Type": "application/json",
        model: options.model || "unknown",
        event: event,
      },
    });

    // Check if the response contains the "securityRiskPromptUpdate" field
    const data = await response.json();
    if (data.securityRiskPromptUpdate) {
      throw new Error("Security risk detected: update is required.");
    }

    return data;
}