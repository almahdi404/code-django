import * as vscode from "vscode";
import { TemplateLinkProvider } from "./providers/documentLinkProviders";
import { toggleComment } from "./commands/templateComment";
import { activateUrlNamesAutocompletion } from "./providers/urlNameProviders";
import { activateStaticFilesAutocompletion } from "./providers/staticFileProviders";
import { activateTemplatesAutocompletion } from "./providers/templateNameProviders";
import { updateProvidersCaches } from "./utils";

export function activate(context: vscode.ExtensionContext): void {
  const templateLink = new TemplateLinkProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      templateLink.selector,
      templateLink
    )
  );

  activateUrlNamesAutocompletion(context);
  activateStaticFilesAutocompletion(context);
  activateTemplatesAutocompletion(context);

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "code-django.toggleComment",
      toggleComment
    )
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "code-django.updateCache",
      updateProvidersCaches
    )
  );
}
