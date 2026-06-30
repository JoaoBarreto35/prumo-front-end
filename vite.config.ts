import {
  defineConfig,
} from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    host: true,
  },

  preview: {
    host: true,
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes(
              "node_modules/react",
            )
            || id.includes(
              "node_modules/react-dom",
            )
            || id.includes(
              "node_modules/react-router",
            )
          ) {
            return "react-vendor";
          }

          if (
            id.includes(
              "/pages/Reports/",
            )
          ) {
            return "reports";
          }

          if (
            id.includes(
              "/pages/Lume/",
            )
          ) {
            return "lume";
          }

          if (
            id.includes(
              "/pages/Calendar/",
            )
          ) {
            return "calendar";
          }

          return undefined;
        },
      },
    },
  },
});
