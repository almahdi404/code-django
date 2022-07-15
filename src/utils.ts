import * as vscode from "vscode";

export function getEOL(document: vscode.TextDocument) {
  if (document.eol === vscode.EndOfLine["LF"]) {
    return "\n";
  } else if (document.eol === vscode.EndOfLine["CRLF"]) {
    return "\r\n";
  }
}
