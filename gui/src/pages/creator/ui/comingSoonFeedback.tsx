import { useRef, useState } from "react";
import { Button } from "./button";
import { useAccountSettings } from "../../../inventory/pearSettings/hooks/useAccountSettings";
import { SERVER_URL } from "core/util/parameters";
import { NewProjectType } from "core";

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
    <div
      className={` border-solid border-gray-200 border-2 transition-all duration-300 ease-out rounded-lg flex flex-col ${
        show ? "opacity-100 h-full p-2" : "opacity-0 h-0"
      }`}
    >
      <div className="text-md text-gray-700">What would you like to build?</div>
      <textarea
        ref={feedbackTextAreaRef}
        // className="w-full h-full bg-background/50 backdrop-blur-sm rounded-lg p-2 text-black"
        className={`w-full appearance-none bg-transparent outline-none resize-none focus:outline-none overflow-y-auto rounded-lg leading-normal flex items-center border-none border-solidd border-gray-300 min-h-5 font-inherit`}
        placeholder="I want to build an app that solves X problem."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        {!auth?.accessToken && (
          <p className="text-yellow-500 text-xs font-normal">
            Please log in to submit feedback
          </p>
        )}
        {status === "success" && (
          <p className="text-green-500 text-xs font-normal">
            Feedback submitted successfully!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500 text-xs font-normal">
            Failed to submit feedback. Please try again.
          </p>
        )}
        <div className="flex justify-end align-bottom">
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
  );
};
