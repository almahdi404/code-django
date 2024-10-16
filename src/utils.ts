import * as vscode from "vscode";

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
