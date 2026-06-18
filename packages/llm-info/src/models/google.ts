import { AllMediaTypes, LlmInfo } from "../types.js";

export const GoogleLlms: LlmInfo[] = [
  {
    model: "gemini-3.5-flash",
    displayName: "Gemini 3.5 Flash",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-3\.5-flash/i,
  },
  {
    model: "gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro Preview",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-3\.1-pro/i,
  },
  {
    model: "gemini-3.1-flash-lite",
    displayName: "Gemini 3.1 Flash-Lite",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-3\.1-flash-lite/i,
  },
  {
    model: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-2\.5-pro/i,
  },
  {
    model: "gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash-Lite",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-2\.5-flash-lite/i,
  },
  {
    model: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-2\.5-flash/i,
  },
  {
    model: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    contextLength: 1_048_576,
    mediaTypes: AllMediaTypes,
    regex: /gemini-1\.5-flash/i,
  },
  {
    model: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    contextLength: 2_097_152,
    regex: /gemini-1\.5-pro/i,
  },
  {
    model: "gemini-1.0-pro",
    displayName: "Gemini 1.0 Pro",
    regex: /gemini-1\.0-pro/i,
  },
];
