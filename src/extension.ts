import * as vscode from "vscode";
import { TemplateLinkProvider } from "./providers/documentLinkProviders";
import { toggleComment } from "./commands/templateComment";
import {
  activateUrlNamesAutocompletion,
  updateUrlsConfigsCache,
} from "./providers/urlNameProviders";
import {
  activateStaticFilesAutocompletion,
  updateCachedStaticFiles,
} from "./providers/staticFileProviders";
import {
  activateTemplatesAutocompletion,
  updateTemplatesCompletions,
} from "./providers/templateNameProviders";

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
    vscode.commands.registerTextEditorCommand("code-django.updateCache", () => {
      vscode.window.showInformationMessage(
        "Code Django: cache update incomming."
      );
      updateUrlsConfigsCache()
        .then(() => {})
        .catch(() => {});
      updateCachedStaticFiles()
        .then(() => {})
        .catch(() => {});
      updateTemplatesCompletions()
        .then(() => {})
        .catch(() => {});
    })
  );
}
