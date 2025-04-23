import axios from "axios";
import {message} from "ant-design-vue";

export const baseURL = "http://localhost:9015/luqiao/supervise/"

//创建一个新的请求实例instance,instance.的用法和axios.的用法一致，可以使用instance({})、instance.get（）、instance.post()
const instace = axios.create({
    // baseURL: import.meta.env.VITE_API_URL, //默认配置(这里不要用process.env,个人百度这个在vite中被废弃掉了,属性名必须以VITE_API_开头,否则 import.meta.env检测不到)
    // baseURL: "https://oa.scnjwh.com/luqiao/",
    baseURL: baseURL,
    timeout: 5000, //超时时间
});

//配置请求拦截器,在请求之前的数据处理,比如在请求头添加token,所有的请求都会经过拦截器
instace.interceptors.request.use(
    //config:该参数表示当前请求的配置对象
    (config) => {
        config.headers["Authorization"] =
            "Basic " +
            "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTYyNjQwMzMyMiwiaWF0IjoxNjI1Nzk4NTIyfQ.2G4Adf3TxOJofPrsatygjN6b-vF64A5QDig9PkpExqffRyarNYG6ZLLV7ig7vDbNt7b-vjhWcnwZXvliJLzSZA"; // 这里自定义配置，这里传的是token
        config.headers["Content-Type"] = "application/x-www-form-urlencoded";
        return config;
    },
    (err) => {
        return Promise.reject(err); //将错误消息挂到promise的失败函数上
    }
);

//配置响应拦截器
// 响应拦截器:在请求响应之后对数据处理，比如:登录失败、请求数据失败的处理
// instance.interceptors.response.use(response=>{l}, err=>{});
// 响应成功:执行回调函数1;响应失败，执行回调函数2
instace.interceptors.response.use(
    (response) => {
        return response; //这里的response就是请求成功后的res , response.data即是请求成功后回调函数内的参数res.data
    },
    (err) => {
        return Promise.reject(err); //将错误消息挂到promise的失败函数上
    }
);

//封装请求的api
const callapi = (method = "GET", url, data = {}) => {
    return instace({
        method,
        url,
        params: method === "GET" ? data : {},
        data: method === "POST" ? data : {},
    });
};
//封装GET请求函数
export const getapi = (url, data) => callapi("GET", url, data);
export const postapi = (url, data) => callapi("POST", url, data);
