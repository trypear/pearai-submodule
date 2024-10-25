import axios from "axios";

interface OpenRouterModel {
  description: any;
  context_length: any;
  id: string;
  name: string;
}

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const response = await axios.get("https://openrouter.ai/api/v1/models");

    return response.data.data.map((model: any) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      context_length: model.context_length,
    }));
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);

    return [];
  }
}
