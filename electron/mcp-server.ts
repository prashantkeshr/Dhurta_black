import http from 'http'
import { getMainWindow } from './main'

let server: http.Server | null = null
let currentPort: number | null = null

function getBrowserState() {
  const win = getMainWindow()
  if (!win) return { url: '', title: '', tabCount: 0 }
  return { url: win.webContents.getURL(), title: win.getTitle(), tabCount: 1 }
}

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(json)
}

export function startMcpServer(): Promise<{ port: number }> {
  return new Promise((resolve, reject) => {
    if (server) { resolve({ port: currentPort! }); return }

    const s = http.createServer((req, res) => {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' })
        res.end(); return
      }

      const url = new URL(req.url ?? '/', `http://localhost`)

      if (req.method === 'GET' && url.pathname === '/state') {
        sendJson(res, 200, getBrowserState()); return
      }

      if (req.method === 'POST' && url.pathname === '/navigate') {
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', () => {
          try {
            const { url: navUrl } = JSON.parse(body)
            const win = getMainWindow()
            if (win && navUrl) win.webContents.send('mcp:navigate', navUrl)
            sendJson(res, 200, { ok: true })
          } catch (e) { sendJson(res, 400, { error: String(e) }) }
        }); return
      }

      if (req.method === 'POST' && url.pathname === '/eval') {
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', () => {
          try {
            const { code } = JSON.parse(body)
            const win = getMainWindow()
            if (win && code) win.webContents.send('mcp:eval', code)
            sendJson(res, 200, { ok: true, note: 'eval queued' })
          } catch (e) { sendJson(res, 400, { error: String(e) }) }
        }); return
      }

      sendJson(res, 404, { error: 'Not found' })
    })

    s.listen(0, '127.0.0.1', () => {
      const addr = s.address() as { port: number }
      currentPort = addr.port
      server = s
      console.log('[MCP] HTTP server listening on port', currentPort)
      resolve({ port: currentPort })
    })
    s.on('error', reject)
  })
}

export function stopMcpServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) { resolve(); return }
    server.close(() => { server = null; currentPort = null; console.log('[MCP] Server stopped'); resolve() })
  })
}

export function getMcpStatus() {
  return { running: !!server, port: currentPort }
}
