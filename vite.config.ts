import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { codeFromUrl, loadSecrets, metaFor, payloadFor, readEvent, renderPage } from './scripts/invite-data.mjs'

/**
 * Dev server: nhúng dữ liệu khách theo URL, giống hệt bản prerender lúc build.
 * Secret đọc từ .env.local (SECRET_*) hoặc data/guests.json. Không bao giờ vào bundle JS.
 */
function inviteDevData(mode: string, base: string): Plugin {
  return {
    name: 'invite-dev-data',
    apply: 'serve',
    transformIndexHtml(html, ctx) {
      const env = loadEnv(mode, process.cwd(), 'SECRET_')
      const secrets = loadSecrets({ ...process.env, ...env })
      const code = codeFromUrl(ctx.originalUrl ?? ctx.path, base)
      const guest = secrets.guests.find((g: { code: string }) => g.code === code) ?? null
      return renderPage(html, { payload: payloadFor(secrets, guest), ...metaFor(guest, readEvent()) })
    },
  }
}

export default defineConfig(({ mode }) => {
  const base = process.env.BASE_PATH || '/'
  return {
    base,
    plugins: [react(), tailwindcss(), inviteDevData(mode, base)],
    // Chặn mọi biến SECRET_* lọt vào import.meta.env phía client
    envPrefix: 'PUBLIC_',
  }
})
