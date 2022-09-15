import * as vscode from "vscode";
import { baseURL } from "./axios";
import { getTaskDetail, getBugDetail } from "./request";

interface InfoType {
  id: string;
  title: string;
}

const createTaskHtml = ({ id, title }: InfoType): Promise<string> => {
  return new Promise((resolve) => {
    getTaskDetail(`/task-view-${id}.html`).then((res) => {
      resolve(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
         .headline a{
           text-decoration: none;
         }

         .part,
         .part div,
         .part p,
         .part span{
          color: #ffffff7f !important;
          background-color:transparent !important;
         }
         .part a{
          color:#1e80ff;
         }

         .part,
         .part div,
         .part p,
         .part span,
         .part a,
         .part h1,
         .part h2,
         .part h3,
         .part h4,
         .part h5,
         .part h6{
          font-size: 14px;
         }

         .part > h3.title{
          color:#1e80ff;
          font-size: 16px;
         }
        </style>
      </head>
      <body>
          <h2 class='headline'><a href='${baseURL}/task-view-${id}.html'>${id}-${title}</a></h2>
          <div class='part' >
            <h3 class='title'>任务描述<h3/>
            ${res.taskDescribe}
          </div>
          <div class='part' >
            <h3 class='title'>研发需求描述<h3/>
            ${res.requirementDescribe}
          </div>
          <div class='part' >
            <h3 class='title'>验收标准<h3/>
            ${res.acceptanceCriteria}
          </div>
          <div class='part' >
           <h3 class='title'>修改说明<h3/>
           ${res.modifyDescription}
          </div>
      </body>
      </html>`);
    });
  });
};

export const taskWebView = (
  id: string,
  name: string,
  column: vscode.ViewColumn,
  taskInfo: InfoType,
  options: Object = {}
): vscode.WebviewPanel => {
  const panel = vscode.window.createWebviewPanel(
    id, // Identifies the type of the webview. Used internally
    name, // Title of the panel displayed to the user
    column, // Editor column to show the new webview panel in.
    options // Webview options. More on these later.
  );
  createTaskHtml(taskInfo).then((html) => {
    panel.webview.html = html;
  });
  return panel;
};

const createBugHtml = ({ id, title }: InfoType): Promise<string> => {
  return new Promise((resolve) => {
    getBugDetail(`/bug-view-${id}.html`).then((res) => {
      resolve(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
         .headline a{
           text-decoration: none;
         }
        </style>
      </head>
      <body>
          <h2 class='headline'><a href='${baseURL}/task-view-${id}.html'>${id}-${title}</a></h2>
          <div >${res === null ? "已解决" : res}</div>
      </body>
      </html>`);
    });
  });
};

export const bugWebView = (
  id: string,
  name: string,
  column: vscode.ViewColumn,
  bugInfo: InfoType,
  options: Object = {}
): vscode.WebviewPanel => {
  const panel = vscode.window.createWebviewPanel(
    id, // Identifies the type of the webview. Used internally
    name, // Title of the panel displayed to the user
    column, // Editor column to show the new webview panel in.
    options // Webview options. More on these later.
  );
  createBugHtml(bugInfo).then((html) => {
    panel.webview.html = html;
  });
  return panel;
};
