import { ReactElement, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Using native HTML checkboxes instead of Radix UI
import { SERVER_URL } from "core/util/parameters";
import { useAccountSettings } from "./hooks/useAccountSettings";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { ThumbsDown, ThumbsUp, AlertTriangle } from "lucide-react";

interface FeedbackForm {
  feedback: string;
  messages: any[];
  feedbackType: "worked" | "issues" | "didnt_work" | null;
  includeMessages: boolean;
  contactConsent: boolean;
}

interface FeedbackOptionProps {
  type: "worked" | "issues" | "didnt_work";
  icon: ReactElement;
  label: string;
  selectedType: "worked" | "issues" | "didnt_work" | null;
  onClick: (type: "worked" | "issues" | "didnt_work") => void;
}

const FeedbackOption = ({
  type,
  icon,
  label,
  selectedType,
  onClick,
}: FeedbackOptionProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg border shadow-sm cursor-pointer transition-all border-solid ${
        selectedType === type
          ? "bg-blue-500/20 border-2 border-blue-500 text-blue-500"
          : "bg-muted border-muted-foreground/20 hover:bg-muted/80 hover:border-muted-foreground/30"
      }`}
      onClick={() => onClick(type)}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <span className="text-center">{label}</span>
    </div>
  );
};

export const CreatorFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
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
    },
  });

  const handleSubmit = async (data: FeedbackForm) => {
    if (!auth?.accessToken) {
      setStatus("error");
      return;
    }

    const submissionData = {
      feedback: data.feedback,
      feedbackType: data.feedbackType,
      messages: data.includeMessages ? messages : [],
      contactConsent: data.contactConsent ?? false,
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
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 box-border">
      <div className="w-full max-w-full md:max-w-2xl flex flex-col gap-4 box-border">
        <h1 className="text-2xl font-medium text-center">How did it go?</h1>

        <div className="grid grid-cols-3 gap-4">
          <FeedbackOption
            type="worked"
            icon={<ThumbsUp className="h-6 w-6" />}
            label="Worked as expected"
            selectedType={form.watch("feedbackType")}
            onClick={(type) => form.setValue("feedbackType", type)}
          />

          <FeedbackOption
            type="issues"
            icon={<AlertTriangle className="h-6 w-6" />}
            label="Some issues"
            selectedType={form.watch("feedbackType")}
            onClick={(type) => form.setValue("feedbackType", type)}
          />

          <FeedbackOption
            type="didnt_work"
            icon={<ThumbsDown className="h-6 w-6" />}
            label="Didn't work"
            selectedType={form.watch("feedbackType")}
            onClick={(type) => form.setValue("feedbackType", type)}
          />
        </div>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-4 box-border"
        >
          <h2 className="text-lg font-medium mb-2">Tell us what happened.</h2>
          <Textarea
            className="min-h-[128px] bg-background border border-gray-300 rounded-lg text-primary w-full box-border resize-y focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            placeholder="Enter your feedback here..."
            {...form.register("feedback", { required: true })}
          />

          <div className="space-y-2">
            <h2 className="text-lg font-medium mb-2">Attachments</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeMessages"
                checked={form.watch("includeMessages")}
                onChange={(e) =>
                  form.setValue("includeMessages", e.target.checked)
                }
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeMessages" className="text-sm font-normal">
                Recent Assistant Messages
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium mb-2">Follow-up</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="contactConsent"
                checked={form.watch("contactConsent")}
                onChange={(e) =>
                  form.setValue("contactConsent", e.target.checked)
                }
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="contactConsent" className="text-sm font-normal">
                I'm open to being contacted by the PearAI team.
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-black text-white hover:bg-black/90 border border-black rounded-lg shadow-sm"
            disabled={isLoading || !auth?.accessToken}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>

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
        </form>
      </div>
    </div>
  );
};
