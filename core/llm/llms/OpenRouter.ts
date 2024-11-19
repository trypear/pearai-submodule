import { LLMOptions, ModelProvider } from "../../index.js";
import OpenAI from "./OpenAI.js";

class OpenRouter extends OpenAI {
  static providerName: ModelProvider = "openrouter";
  static defaultOptions: Partial<LLMOptions> = {
    ...OpenAI.defaultOptions,
    apiBase: "https://openrouter.ai/api/v1/",
    model: "",
    useLegacyCompletionsEndpoint: false,
  };

  protected _getHeaders() {
    return {
      ...super._getHeaders(),
      "HTTP-Referer": "https://github.com/trypear/pearai-submodule",
      "X-Title": "pearai",
    };
  }
}

export default OpenRouter;
