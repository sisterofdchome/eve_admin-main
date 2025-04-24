import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
import fs from 'fs';
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  filePath: "./library/file_img",
  fileDir: "./library/file_img",
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[dir]-[name]",
    }),
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  transpileDependencies: true,
  lintOnSave: false,

  //下面是配置代理的所有内容
  //这里用server,和vue之前配置的有所不同
  // server: {
  //   // host: '192.168.88.249', // 允许局域网访问
  //   // port: 5173,       // 确保端口正确
  //   proxy: {
  //     // 新增 /luqiao 代理配置
  //     "/luqiao": {
  //       target: "https://oa.scnjwh.com", // 后端基础地址
  //       changeOrigin: true, // 开启跨域
  //     },
  //   },
  // },

  // http://192.168.88.245/
  server: {
    port: 5173, // 可省略
    host: '192.168.88.245',
    // https: {
    //   // 主要是下面两行的配置文件，不要忘记引入 fs 和 path 两个对象
    //   cert: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.crt')),
    //   key: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.key'))
    // },
    proxy: {
      '/luqiao': {
        target: 'http://192.168.88.245:9015', // 你的后端服务地址
        changeOrigin: true,
      },
    },
  }

});
