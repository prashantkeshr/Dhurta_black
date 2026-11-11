export interface Tab {
  id: number
  url: string
  title: string
  favicon: string
  loading: boolean
  ghost: boolean
  active: boolean
  pinned?: boolean
  muted?: boolean
  playing?: boolean
  groupId?: number | null
  readerMode?: boolean
  containerId?: number | null
}

// ── Storage Containers (Phase 2) ────────────────────────────────────────────
export interface Container {
  id: number
  name: string
  color: string    // hex e.g. #00D4FF
  icon: string     // emoji or SVG key
  createdAt: number
}

// ── Proxy Matrix (Phase 6) ──────────────────────────────────────────────────
export type ProxyType = 'direct' | 'vpn' | 'tor' | 'socks5' | 'http'
export interface ProxyRule {
  id: number
  pattern: string    // e.g. "*.google.com"
  proxyType: ProxyType
  proxyAddress: string  // empty for direct/vpn/tor
  enabled: boolean
  sortOrder: number
}

// ── Code Sandbox (Phase 8) ──────────────────────────────────────────────────
export interface CodeSnippet {
  id: number
  name: string
  code: string
  createdAt: number
}

// ── Per-site Fingerprint Override (Phase 5) ─────────────────────────────────
export type FpMode = 'global' | 'real' | 'spoofed'
export interface FpOverride {
  origin: string   // e.g. "localhost" or "example.com"
  mode: FpMode
}

export interface TabGroup {
  id: number
  name: string
  color: string
  collapsed: boolean
}

export interface HistoryEntry {
  id: number
  url: string
  title: string
  favicon: string
  visited_at: number
}

export interface Bookmark {
  id: number
  url: string
  title: string
  favicon: string
  folder_id?: number | null
  created_at: number
}

export interface BookmarkFolder {
  id: number
  name: string
  sort_order: number
  created_at: number
}

export interface RequestEntry {
  id: string
  method: string
  url: string
  type: string
  timestamp: number
  status?: number
}

export type Panel =
  | null
  | 'history'
  | 'bookmarks'
  | 'interceptor'
  | 'network'
  | 'settings'
  | 'security'
  | 'connect'
  | 'downloads'
  | 'extensions'
  | 'data'
  | 'transparency'
  | 'shortcuts'
  | 'ai'
  // ── Dhurta Black developer panels ──
  | 'containers'
  | 'proxy'
  | 'sandbox'
  | 'animation'
  | 'profiles'

export interface LockStatus {
  locked: boolean
  hasPin: boolean
}

export interface TransparencyData {
  history:     { count: number; oldestDate: string | null; newestDate: string | null }
  bookmarks:   { count: number }
  extensions:  { count: number; names: string[] }
  settings:    Record<string, string>
  dbSizeKb:    number
  crashLogs:   number
}

export interface Download {
  id: string
  filename: string
  url: string
  savePath: string
  totalBytes: number
  receivedBytes: number
  percent: number        // 0-100, or -1 if size unknown
  state: 'progressing' | 'paused' | 'completed' | 'cancelled' | 'interrupted'
  startTime: number
  speed?: number         // bytes/sec, present during active downloads
}

export interface Extension {
  id: string
  name: string
  version: string
  description: string
  path?: string
  icons?: Record<string, string>
  optionsPage?: string
  popupPage?: string
  enabled?: boolean
}

export interface SecuritySettings {
  ipRotation: boolean
  antiFingerprint: boolean
  blockWebRTC: boolean
  autoClean: boolean
}

export interface BridgePeerState {
  url: string
  title: string
  favicon?: string
}

export interface DhurtaAPI {
  platform: string
  minimize(): Promise<void>
  maximize(): Promise<void>
  close(): Promise<void>
  isMaximized(): Promise<boolean>
  loadURL(url: string): Promise<void>
  goBack(id: number): Promise<void>
  goForward(id: number): Promise<void>
  reload(id: number): Promise<void>
  stop(id: number): Promise<void>
  createTab(url?: string, ghost?: boolean): Promise<Tab>
  closeTab(id: number): Promise<void>
  switchTab(id: number): Promise<void>
  getTabs(): Promise<Tab[]>
  enableGhost(): Promise<void>
  disableGhost(): Promise<void>
  getGhostState(): Promise<boolean>
  getTorStatus(): Promise<boolean>
  setExitNode(country: string | null): Promise<{ success: boolean; restarted?: boolean; error?: string }>
  torNewnym(): Promise<{ success: boolean; count?: number; error?: string }>
  torCircuitCount(): Promise<number>
  getTorBootstrapProgress(): Promise<{
    percent: number; tag: string; summary: string; elapsedMs: number; etaMs: number | null
  }>
  setWarmth(level: number): Promise<void>
  getWarmth(): Promise<number>
  showDownloadPopup(pos: { x: number; y: number }): Promise<void>
  showWarmthPopup(pos: { x: number; y: number }): Promise<void>
  showSitePopup(pos: { x: number; y: number }, tabId: number, url: string): Promise<void>
  getWindowPos(): Promise<[number, number]>
  zoomIn(tabId: number): Promise<number>
  zoomOut(tabId: number): Promise<number>
  zoomReset(tabId: number): Promise<number>
  zoomGet(tabId: number): Promise<number>
  zoomStep(tabId: number, direction: 'in' | 'out'): Promise<number>
  zoomSet(tabId: number, level: number): Promise<number>
  nukeJS(tabId: number): Promise<boolean>
  nuclearWipe(): Promise<void>
  clearCookies(): Promise<void>
  openFile(): Promise<string | null>
  pickImage(): Promise<string | null>
  toggleFullscreen(): Promise<boolean>
  checkOnline(): Promise<boolean>
  vpnConnect(country?: string): Promise<{ success: boolean; proxy?: string; country?: string; error?: string }>
  vpnDisconnect(): Promise<void>
  vpnRotate(): Promise<{ success: boolean; proxy?: string; error?: string }>
  netKillSwitch(): Promise<void>
  netRelease(): Promise<void>
  checkPublicIp(tabId?: number): Promise<{
    success: boolean; ip?: string; country?: string; countryCode?: string
    city?: string; region?: string; lat?: number; lon?: number; org?: string; error?: string
  }>
  checkRealIp(): Promise<{
    success: boolean; ip?: string; country?: string; countryCode?: string
    city?: string; region?: string; lat?: number; lon?: number; org?: string; error?: string
  }>
  getBlockedCount(): Promise<number>
  getFingerprint(tabId?: number): Promise<{
    success?: boolean; error?: string
    userAgent?: string; platform?: string
    screenWidth?: number; screenHeight?: number; colorDepth?: number; devicePixelRatio?: number
    hardwareConcurrency?: number; deviceMemory?: number; languages?: string
    doNotTrack?: string | null; webdriver?: boolean; pluginsCount?: number
    timezone?: string; webglVendor?: string; webglRenderer?: string
  }>
  addHistory(entry: { url: string; title: string; favicon?: string }): Promise<void>
  getHistory(query?: string, limit?: number): Promise<HistoryEntry[]>
  deleteHistory(id: number): Promise<void>
  setIncinerate(days: number): Promise<void>
  addBookmark(b: { url: string; title: string; favicon?: string; folderId?: number | null }): Promise<void>
  getBookmarks(): Promise<Bookmark[]>
  deleteBookmark(id: number): Promise<void>
  getBookmarkFolders(): Promise<BookmarkFolder[]>
  createBookmarkFolder(name: string): Promise<{ id: number; name: string }>
  renameBookmarkFolder(id: number, name: string): Promise<boolean>
  deleteBookmarkFolder(id: number): Promise<boolean>
  moveBookmarkToFolder(bookmarkId: number, folderId: number | null): Promise<boolean>
  updateBookmark(id: number, updates: { url?: string; title?: string }): Promise<boolean>
  reorderBookmarks(orderedIds: number[]): Promise<void>
  getBookmarkOrder(): Promise<number[]>
  getSetting(key: string): Promise<string>
  setSetting(key: string, value: string): Promise<void>
  setPanelWidth(width: number): Promise<void>
  setChromeHeight(height: number): Promise<void>
  showConnTroublePopup(data: Record<string, unknown>): Promise<void>
  hideConnTroublePopup(): Promise<void>
  getSecuritySettings(): Promise<SecuritySettings>
  setIPRotation(enabled: boolean): Promise<{ success: boolean; proxy?: string; error?: string }>
  setAntiFingerprint(enabled: boolean): Promise<void>
  setBlockWebRTC(enabled: boolean): Promise<void>
  setAutoClean(enabled: boolean): Promise<void>
  rotateProxy(): Promise<{ success: boolean; proxy?: string; error?: string }>
  bridgeHost(): Promise<{ code: string; port: number }>
  bridgeStop(): Promise<void>
  bridgePeek(code: string): Promise<BridgePeerState | null>
  bridgePush(code: string, url: string, title: string): Promise<boolean>
  getRequests(tabId: number): Promise<RequestEntry[]>
  pipVideoMode(): Promise<{ success?: boolean; action?: string; error?: string }>
  pipOpenPage(url?: string): Promise<{ success?: boolean; error?: string }>
  pipClose(): Promise<void>
  pipStatus(): Promise<{ isOpen: boolean; url: string }>
  devToolsToggle(mode?: string): Promise<void>
  duplicateTab(): Promise<Tab | null>
  findInPage(text: string): Promise<void>
  findInPageNext(text: string, forward?: boolean): Promise<void>
  findInPageStop(): Promise<void>
  getDownloads(): Promise<Download[]>
  clearDownloads(): Promise<Download[]>
  openDownloadItem(id: string): Promise<void>
  showDownloadInFolder(id: string): Promise<void>
  pauseDownload(id: string): Promise<void>
  resumeDownload(id: string): Promise<void>
  cancelDownload(id: string): Promise<void>
  removeDownload(id: string): Promise<Download[]>
  deleteDownloadFile(id: string): Promise<Download[]>
  getDownloadDefaultPath(): Promise<string>
  setDownloadDefaultPath(): Promise<string | null>
  openExtensionPopup(id: string): Promise<{ ok?: boolean; error?: string } | void>
  loadExtension(): Promise<{ id?: string; name?: string; version?: string; error?: string }>
  loadCrxExtension(): Promise<{ id?: string; name?: string; version?: string; error?: string }>
  installExtensionFromAMO(slug: string): Promise<{ id?: string; name?: string; error?: string }>
  getExtensions(): Promise<Extension[]>
  removeExtension(id: string): Promise<boolean>
  toggleExtension(id: string): Promise<{ enabled?: boolean; newId?: string; error?: string }>
  printPage(): Promise<void>
  savePageAsPDF(): Promise<{ ok?: boolean; filePath?: string; cancelled?: boolean; error?: string }>
  pinTab(id: number): Promise<boolean>
  muteTab(id: number): Promise<boolean>
  getTabGroups(): Promise<{ groups: TabGroup[]; tabs: { id: number; groupId: number | null }[] }>
  createTabGroup(color: string, name?: string): Promise<TabGroup>
  assignTabToGroup(tabId: number, groupId: number | null): Promise<boolean>
  updateTabGroup(groupId: number, updates: { name?: string; color?: string }): Promise<boolean>
  deleteTabGroup(groupId: number): Promise<boolean>
  toggleTabGroup(groupId: number): Promise<boolean>
  toggleReaderMode(tabId: number): Promise<{ active: boolean; title: string } | null>
  openExtensionOptions(id: string): Promise<{ url?: string; error?: string }>
  showExtensionTrayMenu(): Promise<void>
  isBookmarked(url: string): Promise<boolean>
  showThreeDotMenu(opts: { url: string }): Promise<void>
  showTabContextMenu(opts: { tabId: number; tabCount: number; x: number; y: number }): Promise<void>
  showAppsPopup(pos: { x: number; y: number }): Promise<void>
  getAppIconDataUrl(url: string): Promise<string | null>
  closePip(): Promise<void>
  focusMain(): Promise<void>
  appLockStatus(): Promise<LockStatus>
  appLockSetup(pin: string): Promise<{ recovery: string }>
  appLockUnlock(pin: string): Promise<{ ok: boolean }>
  appLockLock(): Promise<boolean>
  appLockClear(pin: string): Promise<{ ok: boolean }>
  appLockChangePin(oldPin: string, newPin: string): Promise<{ ok: boolean }>
  appLockRecover(phrase: string): Promise<{ ok: boolean }>
  getTransparencyData(): Promise<TransparencyData>
  exportMyData(): Promise<string>
  sendCrashReport(): Promise<{ success: boolean; url?: string; error?: string }>
  getPageTextForAI(tabId: number): Promise<string>
  respondPermission(tabId: number, origin: string, allow: boolean, remember: boolean): Promise<boolean>
  forgetPermission(origin: string): Promise<void>
  torNewCircuit(): Promise<{ success: boolean; count?: number; error?: string }>
  on(channel: string, cb: (...args: unknown[]) => void): void
  off(channel: string, cb: (...args: unknown[]) => void): void

  // ── Containers (Phase 2) ──
  getContainers(): Promise<Container[]>
  createContainer(name: string, color: string, icon: string): Promise<Container>
  updateContainer(id: number, updates: { name?: string; color?: string; icon?: string }): Promise<boolean>
  deleteContainer(id: number): Promise<boolean>
  assignTabContainer(tabId: number, containerId: number | null): Promise<boolean>

  // ── Per-site fingerprint (Phase 5) ──
  getFpOverrides(): Promise<FpOverride[]>
  setFpOverride(origin: string, mode: FpMode): Promise<void>
  deleteFpOverride(origin: string): Promise<void>

  // ── Proxy matrix (Phase 6) ──
  getProxyRules(): Promise<ProxyRule[]>
  addProxyRule(rule: Omit<ProxyRule, 'id'>): Promise<ProxyRule>
  updateProxyRule(id: number, updates: Partial<ProxyRule>): Promise<boolean>
  deleteProxyRule(id: number): Promise<boolean>
  reorderProxyRules(orderedIds: number[]): Promise<void>

  // ── MCP server (Phase 7) ──
  mcpServerStart(): Promise<{ port: number }>
  mcpServerStop(): Promise<void>
  mcpServerStatus(): Promise<{ running: boolean; port: number | null }>

  // ── Code sandbox (Phase 8) ──
  executeInTab(tabId: number, code: string): Promise<{ result?: unknown; error?: string; logs: string[] }>
  getSnippets(): Promise<CodeSnippet[]>
  saveSnippet(name: string, code: string): Promise<CodeSnippet>
  deleteSnippet(id: number): Promise<boolean>

  // ── Profiles (Phase 10) ──
  getProfiles(): Promise<{ id: string; name: string; createdAt: number }[]>
  createProfile(name: string): Promise<{ id: string; name: string; createdAt: number }>
  switchProfile(id: string): Promise<void>
  deleteProfile(id: string): Promise<boolean>
  burnSession(): Promise<void>
}

declare global {
  interface Window {
    dhurta: DhurtaAPI
  }
}
