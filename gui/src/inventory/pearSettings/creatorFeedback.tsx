// TODO: give text input from the user
// TODO: include a checkbox for the user to send their chat history
// TODO: have a big send btn

import { useState } from "react";

export const CreatorFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 text-white">
      <h2 className="text-lg font-bold">Feedback</h2>
      <textarea
        className="w-full h-32 p-2 border rounded bg-gray-950 text-white"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback here..."
      />
      <button
        className={`mt-2 px-4 py-2 text-white rounded ${
          isLoading ? "bg-gray-500" : "bg-blue-500"
        }`}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
      {isSuccess && <p className="mt-2 text-green-500">Feedback submitted!</p>}
    </div>
  );
};
