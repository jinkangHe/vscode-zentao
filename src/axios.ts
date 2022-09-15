import axios, { AxiosRequestConfig } from "axios";
import { getConfiguration, BASEURL, SID,getCooKie } from "./config";

export const baseURL = getConfiguration(BASEURL) as string;

 const server = axios.create({
  baseURL,
  timeout: 6000,
});

server.interceptors.request.use(
  function (config) {
    const ck=getCooKie();
    // console.log(ck);
    config.headers!["cookie"] = ck;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

server.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

 

interface MyResponseType {
  code: number;
  message: string;
  data: any;
}

export const request = async (
  config: AxiosRequestConfig
): Promise<MyResponseType> => {
  const {
    status: code,
    statusText: message,
    data,
  } = await server.request<MyResponseType>(config);
  return {
    code,
    message,
    data,
  };
};
