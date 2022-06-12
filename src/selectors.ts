import * as vscode from "vscode";

const HTML_SELECTOR: vscode.DocumentFilter = {
  language: "html",
  scheme: "file",
};
const DJANGO_HTML_SELECTOR: vscode.DocumentFilter = {
  language: "django-html",
  scheme: "file",
};
const PYTHON_SELECTOR: vscode.DocumentFilter = {
  language: "python",
  scheme: "file",
};

export { HTML_SELECTOR, DJANGO_HTML_SELECTOR, PYTHON_SELECTOR };
