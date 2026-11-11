import React, { useEffect, useRef, useState } from 'react'

interface AnimEntry {
  name: string
  duration: string
  delay: string
  easing: string
  iterCount: string
  state: string
  selector: string
}

const api = () => (window as any).dhurta

const SCAN_SCRIPT = `
(function() {
  const all = document.getAnimations()
  return all.map(a => {
    const el = a.effect?.target
    return {
      name: a.animationName ?? (a instanceof CSSTransition ? a.transitionProperty : 'transition'),
      duration: (a.effect?.getTiming()?.duration ?? 0) + 'ms',
      delay: (a.effect?.getTiming()?.delay ?? 0) + 'ms',
      easing: a.effect?.getTiming()?.easing ?? 'linear',
      iterCount: String(a.effect?.getTiming()?.iterations ?? 1),
      state: a.playState,
      selector: el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : '')) : '?',
    }
  })
})()
`

export default function AnimationPanel({ activeTabId }: { activeTabId: number | null }) {
  const [anims, setAnims]       = useState<AnimEntry[]>([])
  const [scanning, setScanning] = useState(false)
  const [paused, setPaused]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function scan() {
    if (!activeTabId) return
    setScanning(true)
    try {
      const res = await api().executeInTab(activeTabId, SCAN_SCRIPT)
      if (Array.isArray(res.result)) setAnims(res.result as AnimEntry[])
    } catch {}
    setScanning(false)
  }

  async function pauseAll() {
    if (!activeTabId) return
    await api().executeInTab(activeTabId, `document.getAnimations().forEach(a => a.pause())`)
    setPaused(true); scan()
  }

  async function playAll() {
    if (!activeTabId) return
    await api().executeInTab(activeTabId, `document.getAnimations().forEach(a => a.play())`)
    setPaused(false); scan()
  }

  useEffect(() => {
    scan()
    intervalRef.current = setInterval(scan, 2000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId])

  const stateColor = (s: string) => s === 'running' ? '#00C853' : s === 'paused' ? '#FF9500' : '#888'

  return (
    <div className="flex flex-col h-full text-text">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <h2 className="text-sm font-semibold text-cyan flex-1">Animations</h2>
        <button onClick={scan} disabled={scanning}
          className="text-[10px] text-text/50 hover:text-text px-2 py-1 rounded-lg hover:bg-surface3 transition-colors disabled:opacity-50">
          {scanning ? '…' : '↺ Scan'}
        </button>
        {paused
          ? <button onClick={playAll} className="text-[10px] bg-cyan/20 hover:bg-cyan/30 text-cyan px-2 py-1 rounded-lg transition-colors">▶ Play All</button>
          : <button onClick={pauseAll} className="text-[10px] bg-surface3 hover:bg-surface3/80 text-text/70 px-2 py-1 rounded-lg transition-colors">⏸ Pause All</button>
        }
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {anims.length === 0 ? (
          <div className="text-center py-10 text-text/40 text-xs">
            {scanning ? 'Scanning…' : 'No animations found on active tab.'}
          </div>
        ) : (
          <div className="space-y-1">
            {anims.map((a, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-surface2/30 p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: stateColor(a.state) }} />
                  <span className="text-xs font-mono text-text/90 font-semibold flex-1 truncate">{a.name}</span>
                  <span className="text-[10px] text-text/40 shrink-0">{a.state}</span>
                </div>
                <div className="text-[10px] text-text/50 font-mono truncate mb-1">on <span className="text-cyan/70">{a.selector}</span></div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div>
                    <div className="text-text/35">Duration</div>
                    <div className="text-text/70 font-mono">{a.duration}</div>
                  </div>
                  <div>
                    <div className="text-text/35">Delay</div>
                    <div className="text-text/70 font-mono">{a.delay}</div>
                  </div>
                  <div>
                    <div className="text-text/35">Iterations</div>
                    <div className="text-text/70 font-mono">{a.iterCount}</div>
                  </div>
                </div>
                {/* Timeline bar */}
                <div className="mt-2 h-1.5 bg-surface3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: a.state === 'running' ? '50%' : a.state === 'finished' ? '100%' : '0%',
                    background: stateColor(a.state),
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
