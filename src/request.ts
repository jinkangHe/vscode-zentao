import * as vscode from "vscode";
import axiso from "axios";
import { request, baseURL } from "./axios";
import * as cheerio from "cheerio";
const md5 = require("md5");
import { getConfiguration, USERINFO, SID, getCooKie } from "./config";

const getCookie = (path: string): Promise<string> => {
  return new Promise((resolve) => {
    axiso({
      url: baseURL + path,
      method: "get",
    }).then((res: any) => {
      const cookie = res.headers["set-cookie"]
        .map((item: string) => {
          const [v] = item.split(";");
          return v;
        })
        .join("; ");
      // console.log("cookie", cookie);
      resolve(cookie);
    });
  });
};

const getVerifyRand = (path: string): Promise<number> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      // console.log("verifyRand", res.data);
      resolve(res.data);
    });
  });
};

interface LoginParamsType {
  verifyRand: number;
  account: string;
  password: string;
  passwordStrength: number;
  referer: string;
  keepLogin: number;
  captcha: string;
}

const login = (path: string, data: LoginParamsType): Promise<boolean> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "post",
      params: data,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "X-Requested-With": "XMLHttpRequest",
      },
    }).then((res: any) => {
      // console.log("login", res.data);
      // console.log(res.config);
      resolve(res.data.result === "success");
    });
  });
};

interface UserInfo {
  account?: string;
  password?: string;
}

const checkIdentity = (ck: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      let cookie = ck ? ck : await getCookie("/user-login.html");
      let verifyRand = await getVerifyRand("/user-refreshRandom.html");
      const userinfo: UserInfo = getConfiguration(USERINFO) as UserInfo;
      const loginParams: LoginParamsType = {
        verifyRand,
        account: userinfo.account || "",
        password: md5(md5(userinfo.password) + verifyRand),
        passwordStrength: 1,
        referer: "/",
        keepLogin: 1,
        captcha: "",
      };
      let isOk = await login("/user-login.html", loginParams);

      isOk ? resolve(cookie) : reject("err");
    } catch (error) {
      console.log(error);
      reject("err");
    }
  });
};

interface WorkTotal {
  task: number;
  bug: number;
  expired?: boolean; //过期
}

const taskAndBugNum = (path: string): Promise<WorkTotal> => {
  return new Promise((resolve, reject) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
      const [useName] = $(
        ".panel-body.conatiner-fluid .table-row .col-left > h4"
      )
        .text()
        .split("，");
      if (!useName) {
        return reject();
      }
      const [task, bug] = Array.from(
        $(
          ".panel-body.conatiner-fluid .table-row .col.col-right .tiles .tile .tile-amount"
        )
      );
      resolve({
        task: +$(task).text(),
        bug: +$(bug).text(),
      });
    });
  });
};

export interface ProjectTotal {
  name: string;
  number: number;
}

const projectList = (path: string): Promise<ProjectTotal[]> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
      const nameList = Array.from($("#myTaskList > tr td.c-project a"));
      const map: { [key: string]: number } = {};
      nameList.forEach((item) => {
        const key = $(item).text().trim();
        map[key] ? (map[key] += 1) : (map[key] = 1);
      });
      resolve(Object.entries(map).map(([k, v]) => ({ name: k, number: v })));
    });
  });
};

interface TaskType {
  id: string;
  title: string;
  project: string;
  level: string;
  create: string;
  icon: string;
}

const taskList = (path: string): Promise<TaskType[]> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
      const urgentList: TaskType[] = [],
        importantList: TaskType[] = [],
        generallyList: TaskType[] = [];
      Array.from($("#myTaskList > tr ")).forEach((item) => {
        const [id, level, name, project, create] = $(item).children();
        const levelToSvgTask: { [key: string]: string } = {
          紧急: "task_urgent",
          重要: "task_important",
          一般: "task_generally",
        };
        const task: TaskType = {
          id: $(id).text().trim(),
          level: $(level).text().trim(),
          icon: levelToSvgTask[$(level).text().trim()],
          title: $(name).children("a").text().trim(),
          project: $(project).text().trim(),
          create: $(create).text().trim(),
        };
        task.level === "紧急"
          ? urgentList.push(task)
          : task.level === "重要"
          ? importantList.push(task)
          : generallyList.push(task);
      });
      resolve([...urgentList, ...importantList, ...generallyList]);
    });
  });
};

interface BugType {
  id: string;
  level: string;
  title: string;
  product: string;
  type: string;
  create: string;
  icon: string;
}

const bugList = (path: string): Promise<BugType[]> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
      const bugList = Array.from($("#bugList tbody > tr "));
      const seriousL: BugType[] = [],
        generallyL: BugType[] = [],
        optimizationL: BugType[] = [];
      bugList.forEach((item) => {
        const [id, level, _, __, title, product, type, create] = Array.from(
          $(item).children("td")
        );
        const levelToSvgBug: { [key: string]: string } = {
          严重: "bug_serious",
          一般: "bug_generally",
          优化: "bug_optimization",
        };
        const bug: BugType = {
          id: $(id).text().trim(),
          level: $(level).text().trim(),
          title: $(title).text().trim(),
          product: $(product).text().trim(),
          type: $(type).text().trim(),
          create: $(create).text().trim(),
          icon: levelToSvgBug[$(level).text().trim()],
        };
        const { level: L } = bug;
        L === "严重"
          ? seriousL.push(bug)
          : L === "一般"
          ? generallyL.push(bug)
          : optimizationL.push(bug);
      });
      resolve([...seriousL, ...generallyL, ...optimizationL]);
    });
  });
};

interface TaskDetail {
  taskDescribe: string;
  requirementDescribe: string;
  acceptanceCriteria: string;
  modifyDescription: string;
}

export const getBugDetail = (path: string): Promise<string> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
      const imgs = $(
        "#mainContent .main-col.col-8 .cell > .detail .detail-content.article-content img"
      );
      Array.from(imgs).forEach((item: any) => {
        const src = item.attribs.src;
        $(item).attr("src", `${baseURL}${src}`);
      });
      const detail = $(
        "#mainContent .main-col.col-8 .cell > .detail .detail-content.article-content"
      );
      resolve(detail.html()!);
    });
  });
};

export const getTaskDetail = (path: string): Promise<TaskDetail> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
      const imgs = $(
        "#mainContent .main-col.col-8 .cell > .detail .detail-content.article-content img"
      );
      Array.from(imgs).forEach((item: any) => {
        const src = item.attribs.src;
        $(item).attr("src", `${baseURL}${src}`);
      });
      const taskDetail = $(
        "#mainContent .main-col.col-8 .cell > .detail .detail-content.article-content"
      );
      resolve({
        taskDescribe: $(taskDetail[0]).html()!,
        requirementDescribe: $(taskDetail[1]).html()!,
        acceptanceCriteria: $(taskDetail[2]).html()!,
        modifyDescription: $(taskDetail[3]).html()!,
      });
    });
  });
};

export const getBugList = () => bugList("/my-work-bug.html");

export const getTaskList = () => taskList("/my-work-task.html");

export const getProjectList = () => projectList("/my-work-task.html");

export const getWorkTotal = (): Promise<WorkTotal> => {
  return new Promise(async (resolve) => {
    try {
      const res = await taskAndBugNum("/my");
      resolve(res);
    } catch (error) {
      const userInfo: UserInfo = getConfiguration(USERINFO) as UserInfo;
      if (!(userInfo.account && userInfo.password)) {
        vscode.window.showErrorMessage("用户登陆凭证无效或过期，请重新设置");
        return resolve({
          task: 0,
          bug: 0,
          expired: true,
        });
      }
      const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
      );
      try {
        statusBar.text = "正在尝试获取用户凭证";
        statusBar.show();
        await checkIdentity(getCooKie()); //重新获取用户cookie
        statusBar.text = "正在重新获取数据";
        const total = await taskAndBugNum("/my");
        statusBar.dispose();
        resolve(total);
      } catch (error) {
        vscode.window.showErrorMessage("获取数据失败,请检查账号密码");
        statusBar.dispose();
        resolve({
          task: 0,
          bug: 0,
          expired: true,
        });
      }
    }
  });
};
