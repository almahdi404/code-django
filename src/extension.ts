import * as vscode from "vscode";
import { TemplateLinkProvider } from "./providers/documentLinkProviders";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const templateLink = new TemplateLinkProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      templateLink.selector,
      templateLink
    )
  );
}
