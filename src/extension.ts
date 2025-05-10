import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  // prettier-ignore
  context.subscriptions.push(
    vscode.commands.registerCommand("angunav.navigateToComponent", navigateToComponent),
    vscode.commands.registerCommand("angunav.navigateToTemplate", navigateToTemplate),
    vscode.commands.registerCommand("angunav.navigateToStyle", navigateToStyle),
  );

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor?.document) {
      updateContext(editor.document);
    }
  });
}

function isComponent(filePath: string): boolean {
  const conf = getConfig();
  return filePath.endsWith(conf.componentSuffix);
}

function isTemplate(filePath: string): boolean {
  const conf = getConfig();
  return filePath.endsWith(conf.templateSuffix);
}

function isStyle(filePath: string): boolean {
  const conf = getConfig();
  return filePath.endsWith(conf.styleSuffix);
}

function updateContext(doc: vscode.TextDocument) {
  const component = isComponent(doc.fileName);
  const template = isTemplate(doc.fileName);
  const style = isStyle(doc.fileName);
  // prettier-ignore
  vscode.commands.executeCommand("setContext", "angunav.canNavigateToComponent", template || style);
  // prettier-ignore
  vscode.commands.executeCommand("setContext", "angunav.canNavigateToTemplate", component || style);
  // prettier-ignore
  vscode.commands.executeCommand("setContext", "angunav.canNavigateToStyle", component || template);
}

function stripSuffix(s: string, suffixes: Array<string>): string {
  for (const suffix of suffixes) {
    if (s.endsWith(suffix)) {
      return s.slice(0, -suffix.length);
    }
  }

  return s;
}

function getConfig() {
  const config = vscode.workspace.getConfiguration("angunav");
  return {
    componentSuffix: config.get<string>("componentSuffix")!,
    templateSuffix: config.get<string>("templateSuffix")!,
    styleSuffix: config.get<string>("styleSuffix")!,
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
  if (currentFilePath.endsWith(targetSuffix)) {
    // prettier-ignore
    vscode.window.showInformationMessage(`You're already in the ${targetSuffix} file.`);
    return true;
  }

  const conf = getConfig();
  const basePath = stripSuffix(currentFilePath, [
    `.${conf.componentSuffix}`,
    `.${conf.templateSuffix}`,
    `.${conf.styleSuffix}`,
  ]);

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
