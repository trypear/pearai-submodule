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
    posthog.init("phc_EixCfQZYA5It6ZjtZG2C8THsUQzPzXZsdCsvR8AYhfh", {
      api_host: "https://us.i.posthog.com",
      disable_session_recording: true,
      // We need to manually track pageviews since we're a SPA
      capture_pageview: false,
    });

    // If user is logged in, use their account ID as the primary identifier
    if (userId) {
      posthog.identify(window.vscMachineId, {
        pearAiId: userId,
      });
      // Merging the user id with the machine ID
      // Not amazing but it's fine for now
      posthog.alias(userId, window.vscMachineId);
    } else {
      // Otherwise fall back to machine ID
      posthog.identify(window.vscMachineId);
    }

    posthog.opt_in_capturing();
    setClient(client);
  }, [allowAnonymousTelemetry, userId]);

  return allowAnonymousTelemetry ? (
    <PostHogProvider client={client}>{children}</PostHogProvider>
  ) : (
    <>{children}</>
  );
};

export default CustomPostHogProvider;
