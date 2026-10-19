import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const wasmShim = fileURLToPath(new URL("./src/shims/satellite-wasm.ts", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "#wasm-single-thread": wasmShim,
      "#wasm-multi-thread": wasmShim,
    },
  },
  worker: {
    format: "es",
  },
  plugins: [
    react(),
    {
      name: "github-pages-base",
      transformIndexHtml: {
        order: "post",
        handler(html) {
          const script = `<script>(function(){var project="/DarksideRF.com";var path=location.pathname;var href=path===project||path.indexOf(project+"/")===0?project+"/":"/";document.write('<base href="'+href+'">');})();</script>`;
          return html.replace("<head>", `<head>\n    ${script}`);
        },
      },
    },
    {
      name: "github-pages-spa-fallback",
      closeBundle() {
        copyFileSync("dist/index.html", "dist/404.html");
      },
    },
  ],
  base: "./",
});
