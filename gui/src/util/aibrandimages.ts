export function getModelImage(modelTitle: string) {
  const modelTitleLower = modelTitle.toLowerCase();
  switch (true) {
    case modelTitleLower.includes('pearai'):
      return 'pearai-color.png';
    case modelTitleLower.includes('claude'):
      return 'anthropic.png';
    case modelTitleLower.includes('gpt'):
      return 'openai.png';
    case modelTitleLower.includes('deepseek'):
      return 'deepseek-svg.svg';
    case modelTitleLower.includes('gemini'):
      return 'gemini-icon.png';
    case modelTitleLower.includes('llama'):
      return 'llama.png';
    case modelTitleLower.includes("mistral"):
      return 'mistral.png';
    case modelTitleLower.includes('perplexity'):
      return 'perplexityai.png';
    default:
      return 'not found';
  }
}
