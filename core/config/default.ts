import {
  ContextProviderWithParams,
  ModelDescription,
  SerializedContinueConfig,
  SlashCommandDescription,
  CustomCommand,
} from "../index.js";
import { SERVER_URL } from "../util/parameters";


export const FREE_TRIAL_MODELS: ModelDescription[] = [
  {
    title: "GPT-4o (Free Trial)",
    provider: "free-trial",
    model: "gpt-4o",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "Llama3 70b (Free Trial)",
    provider: "free-trial",
    model: "llama3-70b",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses. Whenever you write a code block you include the language after the opening ticks.",
  },
  {
    title: "Codestral (Free Trial)",
    provider: "free-trial",
    model: "codestral",
  },
  {
    title: "Claude 3 Sonnet (Free Trial)",
    provider: "free-trial",
    model: "claude-3-sonnet-20240229",
  },
];

export const defaultContextProvidersVsCode: ContextProviderWithParams[] = [
  { name: "file", params: {} },
  { name: "directory", params: {} },
  { name: "code", params: {} },
  { name: "docs", params: {} },
  { name: "diff", params: {} },
  { name: "terminal", params: {} },
  { name: "problems", params: {} },
  { name: "folder", params: {} },
  // { name: "relativefilecontext", params: {} }, // This is unused currently
  { name: "relativegitfilecontext", params: {} },
  // TODO: Known bug v.1.3.0. codebase works on its own, but doesnt send a message if there is text in the same message as the @Codebase
  { name: "codebase", params: {} },
];

export const defaultContextProvidersJetBrains: ContextProviderWithParams[] = [];

export const defaultSlashCommandsVscode: SlashCommandDescription[] = [
  {
    name: "edit",
    description: "Edit selected code",
  },
  {
    name: "comment",
    description: "Write comments for the selected code",
  },
  {
    name: "share",
    description: "Export the current chat session to markdown",
  },
  {
    name: "cmd",
    description: "Generate a shell command",
  },
  {
    name: "commit",
    description: "Generate a git commit message",
  },
  {
    name: "component",
    description: "Generate a component using v0",
  },
];

export const defaultSlashCommandsJetBrains = [
  {
    name: "edit",
    description: "Edit selected code",
  },
  {
    name: "comment",
    description: "Write comments for the selected code",
  },
  {
    name: "share",
    description: "Export the current chat session to markdown",
  },
  {
    name: "commit",
    description: "Generate a git commit message",
  },
];

export const defaultConfig: SerializedContinueConfig = {
  models: [],
  customCommands: [
    {
      name: "test",
      prompt:
        "{{{ input }}}\n\nWrite a comprehensive set of unit tests for the selected code. It should setup, run tests that check for correctness including important edge cases, and teardown. Ensure that the tests are complete and sophisticated. Give the tests just as chat output, don't edit any file.",
      description: "Write unit tests for highlighted code",
    },
  ],
  contextProviders: defaultContextProvidersVsCode,
  slashCommands: defaultSlashCommandsVscode,
  integrations: [
    {
      name: "mem0",
      description: "PearAI Personalized Chat powered by Mem0",
      enabled: true,
    }
  ],
};

export const defaultCustomCommands: CustomCommand[] = [
  {
    name: "leetcode",
    description:
      "Receive interviewer-style guidance. Usage: `/leetcode [LINK_TO_PROBLEM] @[LEETCODE_FILE_NAME]`",
    prompt:
      "{{{ input }}}\n\nThe input should be of the format: [LINK_TO_LEETCODE_PROBLEM] @[LEETCODE_ATTEMPT_FILE]. If this is not the case, please respond reminding the user the usage is: `/leetcode [LINK_TO_PROBLEM] @[LEETCODE_FILE_NAME]`. If there are no issues, proceed: \n\nPlease analyze my attempt and provide feedback on a conceptual level, that is digestible. Remember than I want to Learn, as I am preparing for interviews. \n\nExplain what I did wrong or could improve, along with specific parts to my code I have to change. Don't tell me exactly what i need to change, show me problematic parts in a hinting manner. Then, tell me that I can ask you for more specific guidance the actual code changes to make.",
  },
  {
    name: "sensei",
    description:
      "Promotes learning by guiding rather than providing direct answers (good for students/beginners).",
    prompt: `You are a senior software engineer acting as a mentor for a junior developer or student.

    This is the user's prompt:

{{{ input }}}

Please review the prompt provided by the user. Instead of giving direct solutions, guide the user by:

1. Identifying any apparent issues or areas of improvement in their code, if any.
2. Asking probing questions that encourage the user to think critically about their approach.
3. Providing hints or suggestions that can help the user arrive at the solution independently.
4. Encouraging best practices and good coding habits.
5. Suggesting to use latest technologies if the user isn't already.

Ensure your feedback is clear, constructive, and aimed at enhancing the user's understanding and skills. Avoid giving away the complete answer; instead, empower the user to solve the problem through guidance.`,
  },
];

export const defaultConfigJetBrains: SerializedContinueConfig = {
  models: FREE_TRIAL_MODELS,
  customCommands: [
    {
      name: "test",
      prompt:
        "{{{ input }}}\n\nWrite a comprehensive set of unit tests for the selected code. It should setup, run tests that check for correctness including important edge cases, and teardown. Ensure that the tests are complete and sophisticated. Give the tests just as chat output, don't edit any file.",
      description: "Write unit tests for highlighted code",
    },
  ],
  tabAutocompleteModel: {
    title: "Starcoder2 3b",
    provider: "ollama",
    model: "starcoder2:3b",
  },
  contextProviders: defaultContextProvidersJetBrains,
  slashCommands: defaultSlashCommandsJetBrains,
};