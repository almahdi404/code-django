import * as vscode from "vscode";
import { updateUrlsConfigsCache } from "./providers/urlNameProviders";
import { updateCachedStaticFiles } from "./providers/staticFileProviders";
import { updateTemplatesCompletions } from "./providers/templateNameProviders";

export function getEOL(document: vscode.TextDocument) {
  if (document.eol === vscode.EndOfLine["LF"]) {
    return "\n";
  } else if (document.eol === vscode.EndOfLine["CRLF"]) {
    return "\r\n";
  }
}

export const fileBeginningRange = new vscode.Range(
  new vscode.Position(0, 0),
  new vscode.Position(0, 0)
);

export function getCompleteStringFromLine(
  document: vscode.TextDocument,
  lineNumber: number,
  partialWord: string
) {
  const regex = new RegExp(
    String.raw`['"]([^'\s"]*${partialWord}[^'\s"]*)['"]`,
    "gi"
  );

  const line = document.lineAt(lineNumber).text;

  const matches = regex.exec(line);

  if (matches && matches[1]) {
    return matches[1];
  }
  return null;
}

export function createEndsWithRegex(strings: string[]) {
  const escapedStrings = strings.map((str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = escapedStrings.join("|") + "$";
  return new RegExp(pattern);
}

export function getCleanedLineUntilPosition(
  document: vscode.TextDocument,
  currentPosition: vscode.Position,
  linesToCheck: number
) {
  let lineIndex = currentPosition.line - linesToCheck;
  if (lineIndex < 0) {
    lineIndex = 0;
  }
  const initialPosition = new vscode.Position(lineIndex, 0);
  const line = document
    .getText(new vscode.Range(initialPosition, currentPosition))
    .replace(/['"|\t|\n\s]/g, "");
  return line;
}

export function createDocumentSelectorsForExtensions(extensions: string[]) {
  return extensions.map((languageCode) => ({
    scheme: "file",
    pattern: `**/*.${languageCode}`,
  }));
}

export async function updateProvidersCaches() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Code Django",
      cancellable: false,
    },
    async (progress) => {
      const steps = [
        {
          func: updateUrlsConfigsCache,
          message: "updating url names cache...",
        },
        {
          func: updateCachedStaticFiles,
          message: "updating staticfiles cache...",
        },
        {
          func: updateTemplatesCompletions,
          message: "updating template names cache...",
        },
      ];
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        progress.report({
          message: step.message,
          increment: (100 / steps.length) * index,
        });
        await step.func();
      }
      progress.report({
        increment: 100,
        message: "cache successfully updated!",
      });
      const p = new Promise<void>((resolve) => {
        resolve();
      });
      return p;
    }
  );
}
