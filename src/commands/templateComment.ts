import * as vscode from "vscode";
import { getEOL } from "../utils";

export async function commentLine(
  editor: vscode.TextEditor,
  editorEdit: vscode.TextEditorEdit
) {
  const document = editor.document;
  const edit = new vscode.WorkspaceEdit();
  for (const selection of editor.selections) {
    const sLine = selection.start.line;
    const eLine = selection.end.line;
    if (selection.isEmpty) {
      const text = document.lineAt(sLine).text;
      const commentMatch = text.match(/{#\s?(.*?)\s?#}/);
      if (commentMatch && commentMatch.index !== undefined) {
        const uncommented = commentMatch[1];
        const start = new vscode.Position(sLine, commentMatch.index);
        const end = new vscode.Position(
          sLine,
          commentMatch.index + commentMatch[0].length
        );
        const range = new vscode.Range(start, end);
        edit.replace(document.uri, range, uncommented);
      } else {
        const firstWordMatch = text.match(/\S/);
        if (firstWordMatch && firstWordMatch.index !== undefined) {
          const commented = `{# ${text.trim()} #}`;
          const start = new vscode.Position(sLine, firstWordMatch.index);
          const end = new vscode.Position(
            sLine,
            firstWordMatch.index + text.trim().length
          );
          const range = new vscode.Range(start, end);
          edit.replace(document.uri, range, commented);
        }
      }
    } else if (sLine === eLine) {
      const text = document.getText(selection);
      const commentMatch = text.match(/^{#\s?(.*?)\s?#}$/);
      const end = new vscode.Position(
        sLine,
        selection.start.character + text.length
      );
      const range = new vscode.Range(selection.start, end);
      if (commentMatch) {
        const uncommented = commentMatch[1];
        editorEdit.replace(range, uncommented);
      } else {
        const commented = `{# ${text} #}`;
        editorEdit.replace(range, commented);
      }
    } else {
      const commentStartMatch = document
        .lineAt(sLine)
        .text.match(
          /^\s*{%\s*comment\s*(?:"(?:\\"|[^"])*?"|'(?:\\'|[^'])*?')?\s*%}\s*$/
        );
      const commentEndMatch = document
        .lineAt(eLine)
        .text.match(/^\s*{%\s*endcomment\s*%}\s*$/);

      if (commentStartMatch && commentEndMatch) {
        const lines: string[] = [];
        if (sLine + 1 !== eLine) {
          for (let i = sLine + 1; i < eLine; i++) {
            const firstLineChar = document.lineAt(sLine).text.match(/\s*/);
            const secondLineChar = document.lineAt(sLine + 1).text.match(/\s*/);
            if (
              firstLineChar &&
              firstLineChar.index !== undefined &&
              secondLineChar &&
              secondLineChar.index !== undefined
            ) {
              const diff = secondLineChar[0].length - firstLineChar[0].length;
              if (diff) {
                lines.push(
                  document
                    .lineAt(i)
                    .text.replace(new RegExp(`\\s{0,${diff}}`), "")
                );
              } else {
                lines.push(document.lineAt(i).text);
              }
            } else {
              lines.push(document.lineAt(i).text);
            }
          }
        }
        const start = new vscode.Position(sLine, 0);
        const end = new vscode.Position(
          eLine,
          document.lineAt(eLine).text.length
        );
        const range = new vscode.Range(start, end);
        editorEdit.replace(range, lines.join(getEOL(document)));
      } else {
        const lines: string[] = [];
        lines.push(`${document.lineAt(sLine).text.match(/\s*/)}{% comment %}`);
        for (let i = sLine; i <= eLine; i++) {
          lines.push(`  ${document.lineAt(i).text}`);
        }
        lines.push(
          `${document.lineAt(eLine).text.match(/\s*/)}{% endcomment %}`
        );
        const start = new vscode.Position(sLine, 0);
        const end = new vscode.Position(
          eLine,
          document.lineAt(eLine).text.length
        );
        const range = new vscode.Range(start, end);
        editorEdit.replace(range, lines.join(getEOL(document)));
      }
    }
  }
  if (edit.has(document.uri)) {
    await vscode.workspace.applyEdit(edit);
  }
}
