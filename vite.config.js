import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  publicPath: "./",
  publicDir: "./public",
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
  server: {
    // host: '192.168.88.249', // 允许局域网访问
    // port: 5173,       // 确保端口正确
    proxy: {
      // 新增 /luqiao 代理配置
      "/luqiao": {
        target: "https://oa.scnjwh.com", // 后端基础地址
        changeOrigin: true, // 开启跨域
      },
    },
  },
});
