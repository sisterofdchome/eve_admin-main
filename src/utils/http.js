import axios from "axios";
import router from "@/router";
import {message} from "ant-design-vue";

// 从 vite 的环境变量中读取，注意要加 `import.meta.env`
export const baseURL = import.meta.env.VITE_GLOB_DOMAIN_URL;
let isRefreshing = false; // 防止多次跳转
// 创建实例
const instance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    withCredentials: true,
});

function getToken() {
    console.log(localStorage.getItem("token"));
    return localStorage.getItem("token") || "";
}

//配置请求拦截器,在请求之前的数据处理,比如在请求头添加token,所有的请求都会经过拦截器
instance.interceptors.request.use(
    // config: 该参数表示当前请求的配置对象
    (config) => {
        config.headers["Authorization"] = "Bearer " + getToken(); // 使用 Bearer token
        return config;
    },
    (err) => {
        return Promise.reject(err); // 将错误消息挂到 promise 的失败函数上
    }
);


instance.interceptors.response.use(
    (response) => {
        // if (response.data.code === 401){

        // }
        if (response.data.code === 40002) {
            if (!isRefreshing) {
                isRefreshing = true;
                message.error("登录失效，请重新登录");
                router.push('/login').finally(() => {
                    isRefreshing = false; // 跳转完成后恢复
                });
            }
            return Promise.reject("未授权或登录已失效");
        } else if (response.data.code !== 1) {
            // message.error(response.data.msg || "请求失败");
            // return Promise.reject(response.data.msg || "请求失败");
        }

        // .data.rows || response.data.data; //这里的response就是请求成功后的res , response.data即是请求成功后回调函数内的参数res.data

        return response
    },
    (err) => {
        return Promise.reject(err); //将错误消息挂到promise的失败函数上
    }
);


//配置响应拦截器
// 响应拦截器:在请求响应之后对数据处理，比如:登录失败、请求数据失败的处理
// instance.interceptors.response.use(response=>{l}, err=>{});
// 响应成功:执行回调函数1;响应失败，执行回调函数2
instance.interceptors.response.use(
    (response) => {
        return response; //这里的response就是请求成功后的res , response.data即是请求成功后回调函数内的参数res.data
    },
    (err) => {
        return Promise.reject(err); //将错误消息挂到promise的失败函数上
    }
);

//封装请求的api
const callapi = (method = "GET", url, data = {}) => {
    return instance({
        method,
        url,
        params: method === "GET" ? data : {},
        data: method === "POST" ? data : {},
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

const callContentJSONPostApi = (method = "POST", url, data = {}) => {
    return instance({
        method,
        url,
        data: data,
        headers: {
            "Content-Type": "application/json",
        },
    });
};

//封装GET请求函数
export const getapi = (url, data) => callapi("GET", url, data);
export const postapi = (url, data) => callapi("POST", url, data);
export const postContentJSONPostApi = (url, data) => callContentJSONPostApi("POST", url, data);
