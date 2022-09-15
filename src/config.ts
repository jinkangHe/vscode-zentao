import * as vscode from "vscode";

// export const getBaseUrl = () =>
//   vscode.workspace.getConfiguration().get("zentao.baseurl");
// export const getUserInfo = () =>
//   vscode.workspace.getConfiguration().get("zentao.userinfo");
// export const getSid = () =>
//   vscode.workspace.getConfiguration().get("zentao.sid");
export const BASEURL = "zentao.baseurl";
export const USERINFO = "zentao.userinfo";
export const SID = "zentao.sid";



export const getConfiguration = (key: string) =>
  vscode.workspace.getConfiguration().get(key);

export const setConfiguration = (key: string, value: any) =>
  vscode.workspace.getConfiguration().update(key, value);

  export const getCooKie=()=>`zentaosid=${getConfiguration(
    SID
  )}; lang=zh-cn; device=desktop; theme=default`;
