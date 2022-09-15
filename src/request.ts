import { request, baseURL } from "./axios";
import * as cheerio from "cheerio";

interface WorkTotal {
  task: number;
  bug: number;
  expired?: boolean; //过期
}

const taskAndBugNum = (path: string): Promise<WorkTotal> => {
  return new Promise((resolve) => {
    request({
      url: path,
      method: "get",
    }).then((res) => {
      const $ = cheerio.load(res.data as string);
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

export const getWorkTotal = () => taskAndBugNum("/my");
