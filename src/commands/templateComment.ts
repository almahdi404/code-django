import * as vscode from "vscode";

export async function commentLine(
  editor: vscode.TextEditor,
  editorEdit: vscode.TextEditorEdit
) {
  const document = editor.document;
  const edit = new vscode.WorkspaceEdit();
  for (const selection of editor.selections) {
    const line = selection.start.line;
    if (selection.isEmpty) {
      const text = document.lineAt(line).text;
      const commentMatch = text.match(/{#\s*(.+?)\s*#}/);
      if (commentMatch && commentMatch.index) {
        const uncommented = commentMatch[1];
        const start = new vscode.Position(line, commentMatch.index);
        const end = new vscode.Position(
          line,
          commentMatch.index + commentMatch[0].length
        );
        const range = new vscode.Range(start, end);
        edit.replace(document.uri, range, uncommented);
      } else {
        const wordsMatch = text.match(text.trim());
        if (wordsMatch && wordsMatch.index) {
          const commented = `{# ${wordsMatch[0]} #}`;
          const start = new vscode.Position(line, wordsMatch.index);
          const end = new vscode.Position(
            line,
            wordsMatch.index + wordsMatch[0].length
          );
          const range = new vscode.Range(start, end);
          edit.replace(document.uri, range, commented);
        }
      }
    } else if (selection.start.line === selection.end.line) {
      const text = document.getText(selection);
      const commentMatch = text.match(/^{#\s*(.+?)\s*#}$/);
      if (commentMatch) {
        const uncommented = commentMatch[1];
        const start = selection.start;
        const end = new vscode.Position(
          line,
          selection.start.character + text.length
        );
        const range = new vscode.Range(start, end);
        editorEdit.replace(range, uncommented);
      } else {
        const commented = `{# ${text} #}`;
        const start = selection.start;
        const end = new vscode.Position(
          line,
          selection.start.character + text.length
        );
        const range = new vscode.Range(start, end);
        editorEdit.replace(range, commented);
      }
    }
  }
  await vscode.workspace.applyEdit(edit);
}
