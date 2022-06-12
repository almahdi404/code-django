import * as vscode from "vscode";
import { dirname, join } from "path";
import {
  HTML_SELECTOR,
  DJANGO_HTML_SELECTOR,
  PYTHON_SELECTOR,
} from "../selectors";

export class TemplateLinkProvider implements vscode.DocumentLinkProvider {
  public selector = [HTML_SELECTOR, DJANGO_HTML_SELECTOR, PYTHON_SELECTOR];

  private getRange(document: vscode.TextDocument, match: RegExpMatchArray) {
    if (!match.index) return null;
    const start = document.positionAt(match.index + 1);
    const end = document.positionAt(match.index + 1 + match[1].length);
    return new vscode.Range(start, end);
  }

  private async getDocumentLink(
    range: vscode.Range,
    search: vscode.GlobPattern,
    token: vscode.CancellationToken
  ) {
    const results = await vscode.workspace.findFiles(
      search,
      "**/node_modules/",
      1,
      token
    );
    const uri = results.length ? results[0] : null;
    return uri && new vscode.DocumentLink(range, uri);
  }

  public async provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ) {
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();
    const matchesAbsolute = text.matchAll(
      /(?:'|")([\w-]+(\/[\w-]+)*\.\w+)(?:'|")/g
    );
    const matchesRelative = text.matchAll(
      /(?:'|")((?:\.\/|(?:\.\.\/)+)[\w-]+(\/[\w-]+)*\.\w+)(?:'|")/g
    );

    for (const match of matchesAbsolute) {
      const range = this.getRange(document, match);
      const search = `**/${match[1]}`;
      const link = range && (await this.getDocumentLink(range, search, token));
      link && links.push(link);
    }

    for (const match of matchesRelative) {
      const range = this.getRange(document, match);
      const search = vscode.workspace.asRelativePath(
        join(dirname(document.uri.path), match[1])
      );
      const link = range && (await this.getDocumentLink(range, search, token));
      link && links.push(link);
    }

    if (token.isCancellationRequested) {
      return [];
    }

    return links;
  }
}
