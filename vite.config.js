import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

// JS files from the `src/js`
const jsDir = path.resolve(__dirname, "src/js");
const jsEntries = {};

fs.readdirSync(jsDir).forEach((file) => {
  const fullPath = path.join(jsDir, file);
  if (fs.statSync(fullPath).isFile() && file.endsWith(".js")) {
    jsEntries[path.basename(file, ".js")] = fullPath;
  } else if (fs.statSync(fullPath).isDirectory()) {
    fs.readdirSync(fullPath).forEach((subFile) => {
      if (subFile.endsWith(".js")) {
        const entryName = path.basename(subFile, ".js");
        jsEntries[entryName] = path.join(fullPath, subFile);
      }
    });
  }
});

// CSS files from the `src/styles`
const styleDir = path.resolve(__dirname, "src/styles");
const cssEntries = {};

function addStyleEntries(subPath, prefix = "") {
  const fullDir = path.join(styleDir, subPath);
  if (!fs.existsSync(fullDir)) return;

  fs.readdirSync(fullDir).forEach((file) => {
    if (file.endsWith(".css")) {
      const name = path.basename(file, ".css");
      const entryName = prefix ? `${prefix}${name}` : name;
      cssEntries[entryName] = path.join(fullDir, file);
    }
  });
}

// Add styles from the base, components, sections, templates, and helpers
addStyleEntries(".");
addStyleEntries("components", "component-");
addStyleEntries("sections", "section-");
addStyleEntries("templates", "template-");
addStyleEntries("helpers");

export default defineConfig({
  build: {
    outDir: "assets",
    rollupOptions: {
      input: {
        ...jsEntries,
        ...cssEntries,
      },
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name].[ext]",
      },
      treeshake: false,
    },
    minify: "terser",
    terserOptions: {
      toplevel: false, // Disable top-level optimizations
      keep_classnames: true, // Keep class names
      keep_fnames: true, // Keep function names
      compress: {
        defaults: false,
        toplevel: false,
      },
      mangle: {
        toplevel: false, // Disable top-level name mangling
      },
      format: {
        comments: false, // Remove comments
      },
    },
    cssCodeSplit: true, // Split CSS files per entry
  },
});
