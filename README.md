# ◼ Dhurta Black

**Dhurta Black** is the developer & advanced privacy edition of the Dhurta Browser — built for engineers, security researchers, and power users who need a sovereign, deeply private, developer-first browsing experience.

> Built on the same privacy-native foundation as Dhurta, with a deeper black identity and a developer-first feature set.

---

## What Makes Dhurta Black Different

| Feature | Dhurta | Dhurta Black |
|---|---|---|
| Zero telemetry | ✅ | ✅ |
| Tor / VPN routing | ✅ | ✅ |
| Anti-fingerprint | ✅ | ✅ + advanced controls |
| Local AI integration (Ollama) | — | ✅ |
| MCP server bridge | — | ✅ |
| CSS inspector overlays | — | ✅ |
| Storage containers (isolation) | — | ✅ |
| Network proxy matrix | — | ✅ |
| Developer dark theme | — | ✅ Deeper black + cyan |

---

## Installation

Download the latest release from [GitHub Releases](https://github.com/prashantkeshr/DhurtaBlack/releases).

**Windows (MS Store):** Available separately on the Microsoft Store as *Dhurta Black*.

---

## Building from Source

```bash
git clone https://github.com/prashantkeshr/DhurtaBlack.git
cd DhurtaBlack
npm install --legacy-peer-deps
npm run dev
```

Production build:
```bash
npm run build:renderer
npm run build:electron
npx electron-builder
```

---

## Licence

© 2026 Dhurta.inc — All Rights Reserved. See [LICENSE](LICENSE).
