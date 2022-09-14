import * as vscode from "vscode";

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
      return [
        new ZenTaoTreeViewItem(
          "我的任务",
          vscode.TreeItemCollapsibleState.Collapsed
        ),
        new ZenTaoTreeViewItem(
          "我的bug",
          vscode.TreeItemCollapsibleState.Collapsed
        ),
      ];
    }
  }
  //这个方法有用先留着后续再说
  getParent?(
    element: ZenTaoTreeViewItem
  ): vscode.ProviderResult<ZenTaoTreeViewItem> {
    return element;
  }
}
