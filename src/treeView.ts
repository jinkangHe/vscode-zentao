import * as vscode from "vscode";
import { getWorkTotal } from "./request";

class ZenTaoTreeViewItem extends vscode.TreeItem {}

export class ZenTaoTreeView
  implements vscode.TreeDataProvider<ZenTaoTreeViewItem>
{
  onDidChangeTreeData?:
    | vscode.Event<
        void | ZenTaoTreeViewItem | ZenTaoTreeViewItem[] | null | undefined
      >
    | undefined;

  getTreeItem(
    element: ZenTaoTreeViewItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(
    element?: ZenTaoTreeViewItem | undefined
  ): vscode.ProviderResult<ZenTaoTreeViewItem[]> {
    if (element) {
    } else {
      return new Promise((resolve) => {
        getWorkTotal().then((res) => {
          const { task, bug } = res;
          const taskItem = new ZenTaoTreeViewItem(
            `我的任务-${task}`,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          const bugItem = new ZenTaoTreeViewItem(
            `我的bug-${bug}`,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          resolve([taskItem, bugItem]);
        });
      });
    }
  }
  //这个方法有用先留着后续再说
  getParent?(
    element: ZenTaoTreeViewItem
  ): vscode.ProviderResult<ZenTaoTreeViewItem> {
    return element;
  }
}
