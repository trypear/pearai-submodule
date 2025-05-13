import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { IdeMessengerContext } from "../context/IdeMessenger";

const CustomPostHogProvider = ({ children }: PropsWithChildren) => {
  const allowAnonymousTelemetry = useSelector(
    (store: RootState) => store?.state?.config.allowAnonymousTelemetry,
  );
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [client, setClient] = useState<any>(undefined);
  const ideMessenger = useContext(IdeMessengerContext);

  useEffect(() => {
    const callback = async () => {
      const userId = await ideMessenger.request("llm/getUserId", undefined);
      setUserId(userId);
    };

    void callback();
  }, []);

  useEffect(() => {
    if (allowAnonymousTelemetry) {
      posthog.init("phc_RRjQ4roADRjH6xMbXDUDTA9WLeM5ePPvAJK19w3yj0z", {
        api_host: "https://us.i.posthog.com",
        disable_session_recording: true,
        // We need to manually track pageviews since we're a SPA
        capture_pageview: false,
      });

      // If user is logged in, use their account ID as the primary identifier
      if (userId) {
        posthog.identify(userId, {
          vscMachineId: window.vscMachineId, // Keep machine ID as a property
        });

        // Merging the user id with the machine ID
        // Not amazing but it's fine for now
        posthog.capture("$merge_dangerously", {
          properties: {
            alias: window.vscMachineId,
          },
        });
      } else {
        // Otherwise fall back to machine ID
        posthog.identify(window.vscMachineId);
      }

      posthog.opt_in_capturing();
      setClient(client);
    } else {
      setClient(undefined);
    }
  }, [allowAnonymousTelemetry, userId]);

  return allowAnonymousTelemetry ? (
    <PostHogProvider client={client}>{children}</PostHogProvider>
  ) : (
    <>{children}</>
  );
};

export default CustomPostHogProvider;
