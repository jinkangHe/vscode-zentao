import { request } from "./axios";
import * as cheerio from "cheerio";

interface WorkTotal {
  task: number;
  bug: number;
  expired?: boolean; //过期
}

export const taskAndBugNum = async (path: string): Promise<WorkTotal> => {
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

export const getWorkTotal = () => taskAndBugNum("/my");
