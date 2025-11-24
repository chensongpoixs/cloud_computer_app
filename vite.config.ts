import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

interface DevServerConfig {
  host?: string
  port?: number
  open?: boolean
  https?: {
    enable?: boolean
    keyPath?: string
    certPath?: string
    caPath?: string
  }
}

function loadDevServerConfig(): DevServerConfig {
  const configPath = path.resolve(__dirname, './config/devServer.config.json')
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(raw)
  } catch (error) {
    console.warn('[devServer] 未找到配置文件，采用默认配置。', error instanceof Error ? error.message : error)
    return {}
  }
}

function buildHttpsOptions(config: DevServerConfig['https']) {
  if (!config?.enable) return undefined

  const keyPath = config.keyPath ? path.resolve(__dirname, config.keyPath) : ''
  const certPath = config.certPath ? path.resolve(__dirname, config.certPath) : ''
  const caPath = config.caPath ? path.resolve(__dirname, config.caPath) : ''

  if (!keyPath || !certPath || !fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.warn('[devServer] HTTPS 已启用但证书文件缺失，将回退到 HTTP。')
    return undefined
  }

  const httpsOptions: Record<string, Buffer | Buffer[]> = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }

  if (caPath && fs.existsSync(caPath)) {
    httpsOptions.ca = fs.readFileSync(caPath)
  }

  return httpsOptions
}

const devServerConfig = loadDevServerConfig()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: devServerConfig.host ?? 'localhost',
    port: devServerConfig.port ?? 3001,
    open: devServerConfig.open ?? true,
    https: buildHttpsOptions(devServerConfig.https),
  },
})

