import { defineConfig } from 'vite'

const isCordova = process.env.BUILD_TARGET === 'cordova'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: isCordova ? 'cordova/www' : 'dist',
    assetsDir: 'assets',
    sourcemap: !isCordova,
  },
  server: {
    // host: '0.0.0.0', // to test on a mobile device
  },
  base: isCordova ? './' : '/',
})
