import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Inyecta CSS crítico inline en cada build (el hash del CSS cambia con cada build de Lovable)
    {
      name: "inject-critical-css",
      transformIndexHtml(html: string) {
        const critical = `<style>*,*::before,*::after{box-sizing:border-box}body{background:#1a0a00;color:#f5f0e8;font-family:Inter,system-ui,sans-serif;margin:0;-webkit-font-smoothing:antialiased}body>div#root{min-height:100vh}nav,header{position:sticky;top:0;z-index:50;min-height:64px}img{display:block;max-width:100%}</style>`;
        return html.replace("<head>", "<head>" + critical);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Hash de contenido para cache busting seguro con max-age=31536000
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-motion": ["framer-motion"],   // separado para reducir reflows en main bundle
          "vendor-charts": ["recharts"],         // solo se carga en páginas de analytics
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
}));
