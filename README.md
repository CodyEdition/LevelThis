# LevelThis – Vencord Plugin

Automatically levels all voice participants to the same volume in Discord voice channels.

## Features

- **Automatic leveling** – Sets all voice participants to a configurable target volume
- **Real-time updates** – Adjusts when users join/leave voice channels
- **Configurable** – Target volume (50–200%), check interval, max participants, per-user exemptions
- **Performance** – Only runs when in a call; skips redundant volume updates

## Quick Start

**From the project root** (e.g. `G:\Level This`):

```bash
# One-time setup: clone Vencord, copy plugin, install dependencies
npm run setup

# Build
npm run build
```

Output is in `vencord/dist/`. Use `scripts/safe-inject.ps1` to inject into Discord with automatic backup.

## Project Structure

```
.
├── src/userplugins/levelThis/   # Plugin source
│   ├── index.ts
│   ├── author.png
│   └── README.md
├── scripts/
│   ├── build.mjs                # Build script
│   ├── safe-inject.ps1          # Safe injection (PowerShell)
│   └── safe-inject.sh           # Safe injection (Bash)
└── .devcontainer/               # Dev container config
```

## Development

### Local (Windows)

1. Node.js 18+, pnpm (`npm install -g pnpm`)
2. `npm run setup` then `npm run build`
3. Inject: run `pnpm run inject` from `vencord/`, or use `scripts/safe-inject.ps1`

### Dev Container

1. Open in VS Code
2. F1 → **Dev Containers: Reopen in Container**
3. Wait for setup (first time: 5–10 min)
4. Build: `npm run build` or `npm run build:dev`

See [.devcontainer/README.md](.devcontainer/README.md) for details.

## How It Works

The plugin uses Discord's internal APIs:

1. **MediaEngineStore** – Per-user volume
2. **VoiceStateStore** – Participants in the current channel
3. **setLocalVolume** – Applies target volume to each participant

## Limitations

- **Desktop only** – Vencord Desktop (Windows). Browser/Vesktop may differ.
- **No raw audio** – Adjusts volume sliders only; no dynamics compression.
- **API dependency** – Relies on Discord internals that may change.

## Resources

- [Vencord](https://github.com/Vendicated/Vencord)
- [Vencord Docs](https://docs.vencord.dev/)
- [Plugin Guide](https://docs.vencord.dev/plugins/)

## License

GPL-3.0-or-later (same as Vencord)

---

*Using Vencord violates Discord's Terms of Service. Use at your own risk.*
