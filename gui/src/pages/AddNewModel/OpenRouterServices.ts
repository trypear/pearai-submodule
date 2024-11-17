import { providers } from "./configs/providers";

interface OpenRouterModel {
  description: any;
  context_length: any;
  id: string;
  name: string;
}

export const loadOpenRouterPackages = async () => {
  try {
    const models = await fetchOpenRouterModels();

    providers.openrouter.packages = models
      .map((model) => ({
        title: model.name,
        description: model.description,
        params: {
          model: model.id,
          contextLength: model.context_length,
        },
        isOpenSource: false,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    providers.openrouter.packages = [];
  }
};

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.data.map((model: any) => ({
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
