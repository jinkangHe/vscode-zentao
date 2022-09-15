import * as vscode from "vscode";
import {
  getWorkTotal,
  getProjectList,
  getTaskList,
  getBugList,
} from "./request";
import type { ProjectTotal } from "./request";
import { iconSvg } from "./utils";

class ZenTaoTreeViewItem extends vscode.TreeItem {}

export class ZenTaoTreeView
  implements vscode.TreeDataProvider<ZenTaoTreeViewItem>
{
  onDidChangeTreeData?:
    | vscode.Event<
        void | ZenTaoTreeViewItem | ZenTaoTreeViewItem[] | null | undefined
      >
    | undefined;
  private _projectList: Array<ProjectTotal> = []; //用来过滤不同项目的任务

  getTreeItem(
    element: ZenTaoTreeViewItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(
    element?: ZenTaoTreeViewItem | undefined
  ): vscode.ProviderResult<ZenTaoTreeViewItem[]> {
    if (element) {
      const { contextValue } = element;
      if (contextValue === "task") {
        return new Promise((resolve) => {
          getProjectList().then((projects) => {
            this._projectList = projects;
            resolve(
              projects.map(({ name, number }) => {
                const projectItem = new ZenTaoTreeViewItem(
                  `${name}(${number})`,
                  vscode.TreeItemCollapsibleState.Collapsed
                );
                projectItem.contextValue = name;
                return projectItem;
              })
            );
          });
        });
      } else if (contextValue === "bug") {
        return new Promise((resolve) => {
          getBugList().then((bugs) => {
            resolve(
              bugs.map((bug) => {
                const node = new ZenTaoTreeViewItem(
                  `${bug.id}-${bug.title}`,
                  vscode.TreeItemCollapsibleState.None
                );
                node.tooltip = `类型：${bug.type} 所属产品：${bug.product} 创建人：${bug.create}`;
                node.iconPath = iconSvg(bug.icon);
                node.command = {
                  title: "bug详情",
                  command: "zentao_bug_detail",
                };
                return node;
              })
            );
          });
        });
      } else if (this._projectList.some((item) => item.name === contextValue)) {
        return new Promise((resolve) => {
          getTaskList().then((tasks) => {
            resolve(
              tasks
                .filter((item) => item.project === contextValue)
                .map((task) => {
                  const node = new ZenTaoTreeViewItem(
                    `${task.id}-${task.title}`
                  );
                  node.tooltip = `紧急程度：${task.level} 创建人：${task.create}`;
                  node.iconPath = iconSvg(task.icon);
                  node.command = {
                    title: "任务详情",
                    command: "zentao_task_detail",
                    arguments:[task,node]
                  };
                  return node;
                })
            );
          });
        });
      }
    } else {
      return new Promise((resolve) => {
        getWorkTotal().then((res) => {
          const { task, bug } = res;
          const taskItem = new ZenTaoTreeViewItem(
            `我的任务-${task}`,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          taskItem.contextValue = "task";
          const bugItem = new ZenTaoTreeViewItem(
            `我的bug-${bug}`,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          bugItem.contextValue = "bug";
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
