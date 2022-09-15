import { request } from "./axios";
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
  icon:string;
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
          level:$(level).text().trim(),
          icon:levelToSvgTask[$(level).text().trim()] ,
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

export const getTaskList = () => taskList("/my-work-task.html");

export const getProjectList = () => projectList("/my-work-task.html");

export const getWorkTotal = () => taskAndBugNum("/my");
