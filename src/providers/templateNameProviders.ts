import * as vscode from "vscode";
import {
  createDocumentSelectorsForExtensions,
  createEndsWithRegex,
  getCleanedLineUntilPosition,
} from "../utils";

const cacheSeconds = 240;

const triggers = ['"', "'"];

const linesToCheck = 2;

const configs: ProviderConfig[] = [
  {
    extensions: ["py"],
    checks: [
      "render(request,",
      "template_name=",
      "template_name:",
      "{%include",
      "{%extends",
    ],
  },
  { extensions: ["html"], checks: ["{%include", "{%extends"] },
];

let cachedTemplates: vscode.CompletionItem[] = [];
let cachedLastUpdatedTime = new Date().getTime();

async function getTemplatesFilesUris() {
  return await vscode.workspace.findFiles("**/templates/**/*.html");
}

function cleanTemplatesUris(uris: vscode.Uri[]) {
  return uris.map((url) => {
    const dir = url.fsPath;
    return dir.split("templates/")[1];
  });
}

function convertPathsToCompletionItems(cleanedTemplates: string[]) {
  return cleanedTemplates
    .map((cleanedTemplate) => ({
      label: cleanedTemplate,
      kind: vscode.CompletionItemKind.File,
      insertText: cleanedTemplate,
    }))
    .sort();
}

export async function updateTemplatesCompletions() {
  const templatesFilesUris = await getTemplatesFilesUris();
  const cleanedTemplates = cleanTemplatesUris(templatesFilesUris);
  const completionItems = convertPathsToCompletionItems(cleanedTemplates);
  cachedTemplates = completionItems;
  cachedLastUpdatedTime = new Date().getTime();
  return completionItems;
}

async function getOrUpdateCompletionItems() {
  const now = new Date().getTime();
  if (
    now - cachedLastUpdatedTime < cacheSeconds * 1000 &&
    cachedTemplates.length > 0
  ) {
    return cachedTemplates;
  }
  try {
    return await updateTemplatesCompletions();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function createAutocompletionProvider(config: ProviderConfig) {
  const languageFilters = createDocumentSelectorsForExtensions(
    config.extensions
  );
  const regexPattern = createEndsWithRegex(config.checks);
  return vscode.languages.registerCompletionItemProvider(
    languageFilters,
    {
      async provideCompletionItems(document, position) {
        const line = getCleanedLineUntilPosition(
          document,
          position,
          linesToCheck
        );
        if (regexPattern.test(line)) {
          return await getOrUpdateCompletionItems();
        }
        return await Promise.resolve([]);
      },
    },
    ...triggers
  );
}

export async function activateTemplatesAutocompletion(
  context: vscode.ExtensionContext
) {
  for (const config of configs) {
    const provider = createAutocompletionProvider(config);
    context.subscriptions.push(provider);
  }
}
