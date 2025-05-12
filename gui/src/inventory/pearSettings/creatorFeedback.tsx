import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SERVER_URL } from "core/util/parameters";
import { useAccountSettings } from "./hooks/useAccountSettings";
import { IdeMessengerContext } from "../../context/IdeMessenger";

interface FeedbackForm {
  feedback: string;
  history: string | null;
}

export const CreatorFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [includeHistory, setIncludeHistory] = useState(false);
  const { auth } = useAccountSettings();
  const ideMessenger = useContext(IdeMessengerContext);

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const callback = async () => {
      const res = await ideMessenger.request(
        "getCreatorFeedbackMessages",
        undefined,
      );

      setMessages(res);
    };

    callback().catch((e) => {
      console.error("Error getting messages", e);
    });
  }, []);

  const form = useForm<FeedbackForm>({
    defaultValues: {
      feedback: "",
      history: null,
    },
  });

  const handleSubmit = async (data: FeedbackForm) => {
    const submissionData = {
      ...data,
      messages: includeHistory ? messages : [],
      includeHistory,
    };
    if (!auth?.accessToken) {
      setStatus("error");
      return;
    }

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
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-solid h-full flex-col justify-start items-start gap-5 inline-flex overflow-auto no-scrollbar">
      <div className="border border-solid w-full flex flex-col justify-start items-start gap-5">
        <div className="justify-center items-center inline-flex">
          <div className="text-lg font-['SF Pro']">Feedback</div>
        </div>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-4"
        >
          <Textarea
            className="min-h-[128px] bg-list-hoverBackground border border-solid rounded-lg"
            placeholder="Enter your feedback here..."
            {...form.register("feedback", { required: true })}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeHistory"
              checked={includeHistory}
              onCheckedChange={(checked) =>
                setIncludeHistory(checked as boolean)
              }
            />
            <label
              htmlFor="includeHistory"
              className="text-xs font-normal font-['SF Pro']"
            >
              Send current session history
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !auth?.accessToken}
          >
            {isLoading ? "Submitting..." : "Submit Feedback"}
          </Button>

          {!auth?.accessToken && (
            <p className="text-yellow-500 text-xs font-normal font-['SF Pro']">
              Please log in to submit feedback
            </p>
          )}
          {status === "success" && (
            <p className="text-green-500 text-xs font-normal font-['SF Pro']">
              Feedback submitted successfully!
            </p>
          )}
          {status === "error" && (
            <p className="text-red-500 text-xs font-normal font-['SF Pro']">
              Failed to submit feedback. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
