import React, { useEffect, useState } from 'react'
import type { ProxyRule, ProxyType } from '../../types'

const api = () => (window as any).dhurta

const PROXY_TYPES: { value: ProxyType; label: string; color: string }[] = [
  { value: 'direct',  label: 'Direct',  color: '#888' },
  { value: 'vpn',     label: 'VPN',     color: '#00C853' },
  { value: 'tor',     label: 'Tor',     color: '#FF4500' },
  { value: 'socks5',  label: 'SOCKS5',  color: '#7C3AED' },
  { value: 'http',    label: 'HTTP',    color: '#00D4FF' },
]

export default function ProxyMatrixPanel() {
  const [rules, setRules]       = useState<ProxyRule[]>([])
  const [creating, setCreating] = useState(false)
  const [pattern, setPattern]   = useState('')
  const [proxyType, setProxyType] = useState<ProxyType>('direct')
  const [proxyAddr, setProxyAddr] = useState('')

  async function load() {
    try { setRules(await api().getProxyRules()) } catch {}
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!pattern.trim()) return
    await api().addProxyRule({ pattern: pattern.trim(), proxyType, proxyAddress: proxyAddr.trim(), enabled: true, sortOrder: rules.length })
    setCreating(false); setPattern(''); setProxyType('direct'); setProxyAddr('')
    load()
  }

  async function toggleRule(id: number, enabled: boolean) {
    await api().updateProxyRule(id, { enabled: !enabled }); load()
  }

  async function deleteRule(id: number) {
    await api().deleteProxyRule(id); load()
  }

  const typeInfo = (t: ProxyType) => PROXY_TYPES.find(x => x.value === t)!

  return (
    <div className="flex flex-col h-full text-text">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-cyan">Proxy Matrix</h2>
        <button onClick={() => setCreating(true)}
          className="text-xs text-cyan/70 hover:text-cyan px-2 py-1 rounded-lg hover:bg-cyan/10 transition-colors">
          + Rule
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {rules.length === 0 && !creating && (
          <div className="text-center py-8 text-text/40 text-xs">
            No proxy rules yet.<br />Add rules to route domains through different proxies.
          </div>
        )}

        {rules.map(r => {
          const ti = typeInfo(r.proxyType)
          return (
            <div key={r.id} className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${r.enabled ? 'border-border/40 bg-surface2/30' : 'border-border/20 bg-surface2/10 opacity-50'}`}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ti.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono truncate text-text/90">{r.pattern}</div>
                <div className="text-[10px] flex gap-1 items-center" style={{ color: ti.color }}>
                  <span>{ti.label}</span>
                  {r.proxyAddress && <span className="text-text/40">· {r.proxyAddress}</span>}
                </div>
              </div>
              <div className="flex gap-1 items-center shrink-0">
                <button onClick={() => toggleRule(r.id, r.enabled)}
                  className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${r.enabled ? 'text-cyan bg-cyan/15 hover:bg-cyan/25' : 'text-text/40 bg-surface3/40 hover:bg-surface3'}`}>
                  {r.enabled ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => deleteRule(r.id)} className="text-[10px] text-text/40 hover:text-red-400 px-1 py-0.5 rounded">✕</button>
              </div>
            </div>
          )
        })}

        {creating && (
          <div className="border border-cyan/40 rounded-xl p-3 bg-surface2/40 space-y-2">
            <input autoFocus placeholder="Domain pattern  e.g. *.example.com" value={pattern} onChange={e => setPattern(e.target.value)}
              className="text-xs font-mono bg-surface2 border border-border/60 rounded-lg px-2 py-1.5 w-full outline-none focus:border-cyan/50" />
            <div className="flex gap-1 flex-wrap">
              {PROXY_TYPES.map(t => (
                <button key={t.value} onClick={() => setProxyType(t.value)}
                  className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${proxyType === t.value ? 'text-black font-semibold' : 'text-text/60 bg-surface3 hover:bg-surface3/80'}`}
                  style={proxyType === t.value ? { background: t.color } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
            {(proxyType === 'socks5' || proxyType === 'http') && (
              <input placeholder="host:port  e.g. 127.0.0.1:1080" value={proxyAddr} onChange={e => setProxyAddr(e.target.value)}
                className="text-xs font-mono bg-surface2 border border-border/60 rounded-lg px-2 py-1.5 w-full outline-none focus:border-cyan/50" />
            )}
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 text-xs bg-cyan/20 hover:bg-cyan/30 text-cyan py-1.5 rounded-lg transition-colors">Add Rule</button>
              <button onClick={() => setCreating(false)} className="flex-1 text-xs text-text/50 hover:text-text py-1.5 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border/40 shrink-0">
        <p className="text-[10px] text-text/35 leading-snug">
          Rules are matched top-to-bottom. Use wildcards: <code className="bg-surface3 px-0.5 rounded">*.domain.com</code>
        </p>
      </div>
    </div>
  )
}
