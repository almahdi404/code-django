import * as vscode from "vscode";
import {
  createDocumentSelectorsForExtensions,
  createEndsWithRegex,
  fileBeginningRange,
  getCleanedLineUntilPosition,
  getCompleteStringFromLine,
} from "../utils";

const cacheSeconds = 240;

const triggers = ['"', "'"];

const extensionsForUrlsDefinitionProvider = ["py", "html"];

const providerConfigs: ProviderConfig[] = [
  {
    extensions: ["py"],
    checks: [
      "reverse_lazy(",
      "reverse(",
      "redirect(",
      "redirect(to=",
      "url=",
      "url_name=",
      "url_name:",
      "url:",
      "{%url",
    ],
  },
  { extensions: ["html"], checks: ["{%url", "url_name", "url"] },
];

type GroupedUrls = {
  [key: string]: vscode.Uri[];
};

type UrlFileConfig = {
  uri: vscode.Uri;
  appName: string | null;
  urlNames: string[];
};

let cachedUrlsConfigs: vscode.CompletionItem[] = [];
let cachedGroupUrls: GroupedUrls = {};
let cachedLastUpdatedTime = new Date().getTime();

async function getUrlsFilesUris() {
  return await vscode.workspace.findFiles("**/urls.py");
}

async function getUrlsConfigsFromFile(uri: vscode.Uri): Promise<UrlFileConfig> {
  const data = (await vscode.workspace.fs.readFile(uri)).toString();
  const appNameRegex = /app_name\s*=\s*(.*)/;
  let appName = null;
  const appNameMatch = appNameRegex.exec(data);
  if (appNameMatch && appNameMatch[1]) {
    appName = appNameMatch[1].trim().replace(/['"]/g, "");
  }
  const nameArgRegex = /\b(name)( *=*)*['"](.*)['"]/g;
  const urlNames = [];
  let match;

  while ((match = nameArgRegex.exec(data)) !== null) {
    const urlName = match[match.length - 1].trim();
    if (urlName !== "") {
      urlNames.push(urlName);
    }
  }
  return { appName, urlNames, uri };
}

export async function updateUrlsConfigsCache() {
  const urls = await getUrlsFilesUris();
  cachedUrlsConfigs = [];
  cachedGroupUrls = {};
  for (const url of urls) {
    const configs = await getUrlsConfigsFromFile(url);
    for (const urlName of configs.urlNames) {
      const completeUrl = `${configs.appName}${
        configs.appName ? ":" : ""
      }${urlName}`;
      cachedUrlsConfigs.push({
        label: completeUrl,
        insertText: completeUrl,
        kind: vscode.CompletionItemKind.Text,
      });
      if (!cachedGroupUrls[completeUrl]) {
        cachedGroupUrls[completeUrl] = [];
      }
      cachedGroupUrls[completeUrl].push(configs.uri);
    }
  }
  cachedLastUpdatedTime = new Date().getTime();
  return cachedUrlsConfigs;
}

async function getOrUpdateCompletionItems() {
  const now = new Date().getTime();
  if (
    now - cachedLastUpdatedTime < cacheSeconds * 1000 &&
    cachedUrlsConfigs.length > 0
  ) {
    return cachedUrlsConfigs;
  }
  try {
    return await updateUrlsConfigsCache();
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
        const line = getCleanedLineUntilPosition(document, position, 1);
        if (regexPattern.test(line)) {
          return await getOrUpdateCompletionItems();
        }
        return await Promise.resolve([]);
      },
    },
    ...triggers
  );
}

async function urlProviderDefinition(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const wordRange = document.getWordRangeAtPosition(position);
  if (!wordRange || wordRange.isEmpty) {
    return [];
  }
  let urlName = document.getText(wordRange);
  const completeUrlName = getCompleteStringFromLine(
    document,
    position.line,
    urlName
  );
  if (completeUrlName) {
    urlName = completeUrlName;
  }
  await getOrUpdateCompletionItems();
  if (urlName in cachedGroupUrls) {
    return cachedGroupUrls[urlName].map((uri) => ({
      uri,
      range: fileBeginningRange,
    }));
  }

  return [];
}

function activateDefinitionProviderForUrls() {
  const languageFilters = createDocumentSelectorsForExtensions(
    extensionsForUrlsDefinitionProvider
  );
  return vscode.languages.registerDefinitionProvider(languageFilters, {
    provideDefinition: urlProviderDefinition,
  });
}

export async function activateUrlNamesAutocompletion(
  context: vscode.ExtensionContext
) {
  activateDefinitionProviderForUrls();
  for (const config of providerConfigs) {
    const provider = createAutocompletionProvider(config);
    context.subscriptions.push(provider);
  }
}
