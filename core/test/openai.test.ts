import { jest } from "@jest/globals";
import OpenAI from "../llm/llms/OpenAI.js";
import { Telemetry } from "../util/posthog.js";

describe("OpenAI", () => {
  beforeAll(() => {
    Telemetry.allow = false;
  });

  test("uses the Responses API for GPT Pro models", async () => {
    const llm = new OpenAI({
      apiKey: "test-api-key",
      model: "gpt-5.5-pro",
    });
    let requestUrl = "";
    let requestBody: any;

    jest.spyOn(llm, "fetch").mockImplementation(async (url, init) => {
      requestUrl = url.toString();
      requestBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({ output_text: "hello" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const chunks = [];
    for await (const chunk of llm.streamChat(
      [
        { role: "system", content: "Be concise." },
        { role: "user", content: "Say hello" },
      ],
      { log: false, maxTokens: 123 },
    )) {
      chunks.push(chunk);
    }

    expect(requestUrl).toBe("https://api.openai.com/v1/responses");
    expect(requestBody).toMatchObject({
      model: "gpt-5.5-pro",
      instructions: "Be concise.",
      max_output_tokens: 123,
      reasoning: { effort: "xhigh" },
      stream: false,
    });
    expect(requestBody.input).toEqual([
      {
        role: "user",
        content: "Say hello",
      },
    ]);
    expect(chunks).toEqual([{ role: "assistant", content: "hello" }]);
  });

  test("keeps GPT Pro models on chat completions for custom OpenAI-compatible endpoints", async () => {
    const llm = new OpenAI({
      apiKey: "test-api-key",
      apiBase: "https://example.com/v1/",
      model: "gpt-5.5-pro",
    });
    let requestUrl = "";

    jest.spyOn(llm, "fetch").mockImplementation(async (url) => {
      requestUrl = url.toString();
      return new Response(
        'data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: [DONE]\n\n',
        {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        },
      );
    });

    const chunks = [];
    for await (const chunk of llm.streamChat(
      [{ role: "user", content: "Say hello" }],
      { log: false },
    )) {
      chunks.push(chunk);
    }

    expect(requestUrl).toBe("https://example.com/v1/chat/completions");
    expect(chunks).toEqual([{ content: "hello" }]);
  });
});
