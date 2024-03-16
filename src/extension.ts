import * as vscode from "vscode";
import { TemplateLinkProvider } from "./providers/documentLinkProviders";
import { toggleComment } from "./commands/templateComment";

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

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "code-django.toggleComment",
      toggleComment
    )
  );
}
