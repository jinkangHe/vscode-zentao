import * as vscode from "vscode";
import { ZenTaoTreeView } from "./treeView";

export function activate(context: vscode.ExtensionContext) {
  const zenTaoTreeViewProvider = new ZenTaoTreeView();
  context.subscriptions.push(
    vscode.window.createTreeView("zentao_activitybar_work", {
      treeDataProvider: zenTaoTreeViewProvider,
    })
  );
}

export function deactivate() {}
