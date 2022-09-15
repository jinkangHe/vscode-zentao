import * as vscode from "vscode";
import { ZenTaoTreeView } from "./treeView";
import { taskWebView, bugWebView } from "./webview";

export function activate(context: vscode.ExtensionContext) {
  const zenTaoTreeViewProvider = new ZenTaoTreeView();
  const treeView = vscode.window.createTreeView("zentao_activitybar_work", {
    treeDataProvider: zenTaoTreeViewProvider,
  });
  context.subscriptions.push(treeView);

  let taskPanelList: Array<vscode.WebviewPanel> = [];
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "zentao_task_detail",
      (task, taskTreeItem) => {
        if (!task && !taskTreeItem) {
          return;
        }
        //查找是否存在
        const list = taskPanelList.filter(
          (panel) => panel.viewType === task.id
        );
        if (list.length) {
          list[0].reveal(vscode.ViewColumn.One);
        } else {
          const taskPanel = taskWebView(
            task.id,
            `${task.id}-任务`,
            vscode.ViewColumn.One,
            task,
            { treeItem: taskTreeItem }
          );
          taskPanelList.push(taskPanel);
          //销毁时
          taskPanel.onDidDispose(() => {
            taskPanelList = taskPanelList.filter(
              (panel) => panel !== taskPanel
            );
          });
          //切换任务webview时
          taskPanel.onDidChangeViewState(({ webviewPanel }) => {
            if (webviewPanel.active) {
              treeView.reveal((webviewPanel.options as any).treeItem, {
                select: true,
              });
            }
          });
        }
      }
    )
  );

  let bugPanelList: Array<vscode.WebviewPanel> = [];
  context.subscriptions.push(
    vscode.commands.registerCommand("zentao_bug_detail", (bug, bugTreeItem) => {
      if (!bug && !bugTreeItem) {
        return;
      }
      const list = bugPanelList.filter((panel) => panel.viewType === bug.id);
      if (list.length) {
        list[0].reveal(vscode.ViewColumn.One);
      } else {
        const bugPanel = bugWebView(
          bug.id,
          `${bug.id}-bug`,
          vscode.ViewColumn.One,
          bug,
          { treeItem: bugTreeItem }
        );
        bugPanelList.push(bugPanel);
        bugPanel.onDidDispose(() => {
          bugPanelList = bugPanelList.filter((item) => item !== bugPanel);
        });
        bugPanel.onDidChangeViewState(({ webviewPanel }) => {
          if (webviewPanel.active) {
            treeView.reveal((webviewPanel.options as any).treeItem, {
              select: true,
            });
          }
        });
      }
    })
  );
}

export function deactivate() {}
