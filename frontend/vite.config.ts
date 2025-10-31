import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/chat": "http://127.0.0.1:5000",
      "/reset": "http://127.0.0.1:5000",
      "/health": "http://127.0.0.1:5000"
    }
  }
});
