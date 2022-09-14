import axios, { AxiosRequestConfig } from "axios";

const server = axios.create({
  baseURL: "http://192.168.1.238",
  timeout: 6000,
});

server.interceptors.request.use(
  function (config) {
    config.headers![
      "cookie"
    ] = `zentaosid=sj4q2b27sti0jftdhdd6p9qnrd; lang=zh-cn; device=desktop; theme=default`;
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
