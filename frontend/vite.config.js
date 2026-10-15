// Import the React plugin for Vite (enables JSX transform and Fast Refresh)
import react from '@vitejs/plugin-react'

// Import Vite's defineConfig helper for type-safe configuration
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Export the Vite configuration object
export default defineConfig({
  // Register the React plugin so Vite understands JSX files
  plugins: [react()],

  // Configure the local development server settings
  server: {
    // Set the port the frontend dev server listens on
    port: 5173,

    // Proxy configuration: forwards API calls from frontend to the Node.js backend
    // This prevents CORS errors and avoids hardcoding http://localhost:8000 in every fetch call
    proxy: {
      // Any frontend request starting with /api will be forwarded to the backend
      '/api': {
        // The Node.js Express backend server address
        target: 'http://localhost:8000',

        // Change the origin header so the backend sees the request as coming from itself
        changeOrigin: true,

        // Do not rewrite the path — keep /api/match as /api/match on the backend
        rewrite: (path) => path,
      },
    },
  },
})
