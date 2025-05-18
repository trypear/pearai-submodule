import { useRef, useState } from "react";
import { Button } from "./button";
import { useAccountSettings } from "../../../inventory/pearSettings/hooks/useAccountSettings";
import { SERVER_URL } from "core/util/parameters";
import { NewProjectType } from "core";
import { Card } from "../../../components/ui/card";
import { Info } from "lucide-react";

type ComingSoonFeedbackProps = {
  show: boolean;
  projectType: NewProjectType;
};

export const ComingSoonFeedback = ({
  show,
  projectType,
}: ComingSoonFeedbackProps) => {
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { auth } = useAccountSettings();

  const handleSubmit = async () => {
    if (!auth?.accessToken || !feedback.trim()) {
      setStatus("error");
      return;
    }

    const submissionData = {
      feedback,
      feedbackType: `coming_soon_${projectType}`,
      messages: [],
      contactConsent: false,
    };

    setIsLoading(true);
    setStatus("idle");
    try {
      const response = await fetch(
        `${SERVER_URL}/feedback/creator-app-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(submissionData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setStatus("success");
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div
        className={`flex gap-4 border-solid border-2 border-gray-300/80 rounded-lg ${
          show
            ? "opacity-100 h-full p-4 gap-4 mb-2"
            : "opacity-0 max-h-0 gap-0 p-0 border-0"
        }`}
      >
        <div className="flex justify-center align-middle">
          <Info className="text-blue-500 m-auto size-4" />
        </div>
        <div className="text-md text-gray-800 flex-1">
          This feature is coming soon! We're designing it with you in mind —
          tell us what you would like to build, and we'll ensure those
          capabilities are ready in our next release. Share your vision now to
          shape what's coming!
        </div>
      </div>
      <div
        className={`${
          status === "success" ? "border-dashed" : "border-solid"
        } border-gray-200 border-2 transition-all duration-300 ease-out rounded-lg flex flex-col relative ${
          show ? "opacity-100 h-full p-2" : "opacity-0 max-h-0"
        }`}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center bg-white z-10 transition-opacity duration-300 ${
            status === "success"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="text-gray-500">Feedback submitted</div>
        </div>
        <textarea
          ref={feedbackTextAreaRef}
          className="w-full appearance-none bg-transparent outline-none resize-none focus:outline-none overflow-y-auto rounded-lg leading-normal flex items-center border-none min-h-5 font-inherit"
          placeholder="I want to build X."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <div className="flex justify-end align-bottom">
            {!auth?.accessToken && (
              <p className="text-yellow-500 text-xs font-normal">
                Please log in to submit feedback
              </p>
            )}
            {status === "error" && (
              <p className="text-red-500 text-xs font-normal">
                Failed to submit feedback. Please try again.
              </p>
            )}
            <Button
              className="ml-auto"
              onClick={handleSubmit}
              disabled={isLoading || !auth?.accessToken || !feedback.trim()}
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
