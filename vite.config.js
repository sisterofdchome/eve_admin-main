import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path, { resolve } from "path";

// Helper to resolve paths
const pathResolve = (dir) => resolve(__dirname, dir);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const apiPrefix = env.VITE_GLOB_API_URL_PREFIX?.trim() || '/'; // 拿到 VITE_GLOB_API_URL_PREFIX
  const target = env.VITE_GLOB_DOMAIN_URL; // 拿到完整后端地址
  

  return {
    filePath: "./library/file_img",
    fileDir: "./library/file_img",

    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]",
      }),
    ],
    define: {
      'process.env': {},
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    base: env.VITE_ENV === 'production' ? './' : './',
    server: {
      port: 5173,
      proxy: {
        [apiPrefix]: {
          target: target,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiPrefix}`), ''),
        },
      },
    },
    transpileDependencies: true,
    lintOnSave: false,
    css: {
      preprocessorOptions: {
        css: {
          charset: false,
        },
      },
    },
    build: {
      outDir: env.VITE_APP_NAME || 'dist',
      assetsDir: 'assets',
      assetsPublicPath: './',
    },
  };
});
