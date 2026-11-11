import React, { useEffect, useRef, useState } from 'react'
import type { CodeSnippet } from '../../types'

const api = () => (window as any).dhurta

const STARTER = `// Run JavaScript in the active tab's context
// console.log() output appears below
document.title`

export default function CodeSandboxPanel({ activeTabId }: { activeTabId: number | null }) {
  const [code, setCode]           = useState(STARTER)
  const [output, setOutput]       = useState<string[]>([])
  const [running, setRunning]     = useState(false)
  const [snippets, setSnippets]   = useState<CodeSnippet[]>([])
  const [saveName, setSaveName]   = useState('')
  const [showSave, setShowSave]   = useState(false)
  const [showLib, setShowLib]     = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function loadSnippets() {
    try { setSnippets(await api().getSnippets()) } catch {}
  }

  useEffect(() => { loadSnippets() }, [])

  async function run() {
    if (!activeTabId) { setOutput(['⚠ No active tab']); return }
    setRunning(true)
    setOutput([])
    try {
      const res = await api().executeInTab(activeTabId, code)
      const lines: string[] = [...(res.logs ?? [])]
      if (res.error) lines.push(`✕ ${res.error}`)
      else if (res.result !== undefined) lines.push(`⇒ ${JSON.stringify(res.result, null, 2)}`)
      setOutput(lines.length ? lines : ['(no output)'])
    } catch (e) {
      setOutput([`✕ ${String(e)}`])
    }
    setRunning(false)
  }

  async function saveSnippet() {
    if (!saveName.trim()) return
    await api().saveSnippet(saveName.trim(), code)
    setSaveName(''); setShowSave(false); loadSnippets()
  }

  async function deleteSnippet(id: number) {
    await api().deleteSnippet(id); loadSnippets()
  }

  function loadSnippet(s: CodeSnippet) {
    setCode(s.code); setShowLib(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() }
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target as HTMLTextAreaElement
      const s = el.selectionStart; const end = el.selectionEnd
      const next = code.substring(0, s) + '  ' + code.substring(end)
      setCode(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2 })
    }
  }

  return (
    <div className="flex flex-col h-full text-text font-mono">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <h2 className="text-sm font-semibold text-cyan font-sans flex-1">Code Sandbox</h2>
        <button onClick={() => setShowLib(!showLib)}
          className={`text-[10px] px-2 py-1 rounded-lg transition-colors font-sans ${showLib ? 'bg-cyan/20 text-cyan' : 'text-text/50 hover:text-text hover:bg-surface3'}`}>
          Snippets
        </button>
        <button onClick={run} disabled={running}
          className="text-[10px] bg-cyan/20 hover:bg-cyan/30 text-cyan px-3 py-1 rounded-lg transition-colors disabled:opacity-50 font-sans">
          {running ? '…' : '▶ Run'}
        </button>
      </div>

      {showLib ? (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {snippets.length === 0 && (
            <div className="text-center py-8 text-text/40 text-xs font-sans">No saved snippets.</div>
          )}
          {snippets.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface2/60 cursor-pointer group border border-transparent hover:border-border/40"
              onClick={() => loadSnippet(s)}>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-text/90 font-sans font-medium truncate">{s.name}</div>
                <div className="text-[10px] text-text/40 font-mono truncate">{s.code.split('\n')[0]}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteSnippet(s.id) }}
                className="text-[10px] text-text/40 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Editor */}
          <div className="flex-1 relative">
            <textarea ref={textareaRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleKeyDown}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent resize-none text-xs text-text/90 p-3 outline-none leading-relaxed"
              style={{ fontFamily: 'Menlo, Consolas, monospace', tabSize: 2 }} />
          </div>

          {/* Output */}
          <div className="border-t border-border/40 bg-surface2/40 max-h-40 overflow-y-auto">
            <div className="text-[10px] text-text/40 px-3 pt-1.5 pb-0.5 font-sans">Output</div>
            {output.length === 0
              ? <div className="px-3 pb-2 text-[10px] text-text/25 font-sans">Press Ctrl+Enter to run</div>
              : output.map((line, i) => (
                <div key={i} className={`px-3 py-0.5 text-[11px] leading-relaxed whitespace-pre-wrap break-all ${line.startsWith('✕') ? 'text-red-400' : line.startsWith('⇒') ? 'text-cyan' : 'text-text/70'}`}>
                  {line}
                </div>
              ))
            }
          </div>

          {/* Save bar */}
          <div className="px-3 py-2 border-t border-border/40 shrink-0">
            {showSave ? (
              <div className="flex gap-2">
                <input autoFocus placeholder="Snippet name" value={saveName} onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveSnippet(); if (e.key === 'Escape') setShowSave(false) }}
                  className="flex-1 text-xs bg-surface2 border border-border/60 rounded-lg px-2 py-1 outline-none focus:border-cyan/50 font-sans" />
                <button onClick={saveSnippet} className="text-xs text-cyan bg-cyan/20 hover:bg-cyan/30 px-2 py-1 rounded-lg font-sans transition-colors">Save</button>
                <button onClick={() => setShowSave(false)} className="text-xs text-text/40 px-1 py-1 font-sans">✕</button>
              </div>
            ) : (
              <button onClick={() => setShowSave(true)}
                className="text-[10px] text-text/40 hover:text-cyan transition-colors font-sans">
                + Save as snippet
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
