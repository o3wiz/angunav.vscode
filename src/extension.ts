import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  // prettier-ignore
  context.subscriptions.push(
    vscode.commands.registerCommand("angunav.navigateToComponent", navigateToComponent),
    vscode.commands.registerCommand("angunav.navigateToTemplate", navigateToTemplate),
    vscode.commands.registerCommand("angunav.navigateToStyle", navigateToStyle),
  );
  // prettier-ignore-end
}

function getConfig() {
  const config = vscode.workspace.getConfiguration("angunav");
  return {
    componentSuffix: config.get<string>("componentSuffix", ".component.ts"),
    templateSuffix: config.get<string>("templateSuffix", ".component.html"),
    styleSuffix: config.get<string>("styleSuffix", ".component.scss"),
  };
}

async function navigateToComponent() {
  const conf = getConfig();
  navigateToFile(conf.componentSuffix);
}

async function navigateToTemplate() {
  const conf = getConfig();
  navigateToFile(conf.templateSuffix);
}

async function navigateToStyle() {
  const conf = getConfig();
  navigateToFile(conf.styleSuffix);
}

async function navigateToFile(targetSuffix: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor!");
    return false;
  }

  const currentFilePath = editor.document.uri.fsPath;
  const basePath = currentFilePath.split(".", 1)[0];

  const targetPath = `${basePath}.${targetSuffix}`;

  if (!fs.existsSync(targetPath)) {
    // prettier-ignore
    vscode.window.showWarningMessage(`Couldn't find a matching file: ${targetPath}`);
    return false;
  }

  const targetUri = vscode.Uri.file(targetPath);
  await vscode.window.showTextDocument(targetUri);

  return true;
}

export function deactivate() {}
