import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'docs',
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 0,
  },
  base: process.env.GITHUB_PAGES ? '/shmup-party-phaser3/' : '/',
  resolve: {
    alias: {
      'phaser': 'phaser/dist/phaser.js'
    }
  }
})
