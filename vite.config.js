import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'docs',
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 0,
  },
  base: '/',
  resolve: {
    alias: {
      'phaser': 'phaser/dist/phaser.js'
    }
  }
})
