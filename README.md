# Level This - Vencord Plugin

Automatically levels all voice participants to the same volume in Discord voice channels.

## Features

- 🎚️ **Automatic Leveling** - Sets all voice participants to a configurable target volume
- 🔄 **Real-time Updates** - Automatically adjusts when users join/leave voice channels
- ⚙️ **Configurable** - Target volume slider (50-200%)
- 🛡️ **Safe Development** - Dev container support to avoid affecting local Discord

## Quick Start

### Build (Windows or Dev Container)

**Run from the Level This repo root** (e.g. `G:\Repos\Level It`), not from inside `vencord/`:

```bash
# One-time setup: clone Vencord, copy plugin, install dependencies
npm run setup

# Build (production)
npm run build

# Or dev build (faster, source maps)
npm run build:dev
```

Output is in `vencord/dist/`. Use [scripts/safe-inject.ps1](scripts/safe-inject.ps1) to inject into Discord without touching your install until you're ready.

### Option 1: Dev Container (Recommended for Development)

**Safest way to develop without touching your local Discord:**

1. **Open in VS Code**
2. **Press `F1`** → `Dev Containers: Reopen in Container`
3. **Wait for setup** (first time: 5-10 minutes; runs `npm run setup` then `npm run build:dev`)
4. **Build again anytime:** `npm run build` or `npm run build:dev`

See [DEV_CONTAINER_GUIDE.md](DEV_CONTAINER_GUIDE.md) for details.

### Option 2: Local Vencord Setup

**Same scripts work locally on Windows:**

1. Install Node 18+ and ensure `git` is in PATH
2. Run `npm run setup` then `npm run build` (or use the dev container)
3. Optionally inject: **`npm run inject`** (from repo root; no pnpm needed) or use `scripts/safe-inject.ps1`

See [QUICKSTART.md](QUICKSTART.md) for details.

## Project Structure

```
.
├── src/
│   └── userplugins/
│       └── levelThis/        # Plugin source code
│           ├── index.ts      # Main plugin file
│           └── README.md     # Plugin documentation
├── .devcontainer/            # Dev container configuration
│   ├── devcontainer.json     # VS Code dev container config
│   ├── Dockerfile            # Container image
│   └── setup.sh              # Auto-setup script
├── scripts/                  # Utility scripts
│   ├── safe-inject.ps1       # Safe injection (PowerShell)
│   └── safe-inject.sh        # Safe injection (Bash)
└── docs/                     # Documentation
    ├── DEV_CONTAINER_GUIDE.md
    ├── QUICKSTART.md
    └── SETUP.md
```

## Documentation

- **[DEV_CONTAINER_GUIDE.md](DEV_CONTAINER_GUIDE.md)** - Complete dev container guide
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[VENCORD_INTEGRATION.md](VENCORD_INTEGRATION.md)** - Vencord integration guide
- **[INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)** - Testing checklist

## How It Works

The plugin uses Discord's internal APIs to set per-user volume:

1. **Finds Discord modules** via Vencord's webpack finders
2. **Gets voice participants** from VoiceStateStore
3. **Applies target volume** via `setLocalVolume()` API
4. **Updates automatically** on voice state changes

## Limitations

- **Desktop only**: Works on Vencord Desktop (Windows). Browser/Vesktop may have different APIs.
- **No raw audio processing**: Adjusts volume sliders, doesn't compress audio dynamics.
- **API dependency**: Relies on Discord's internal APIs which may change.

## Development

### Prerequisites

- **Node.js 18+**
- **pnpm** (`npm install -g pnpm`)
- **Docker Desktop** (for dev container)
- **VS Code** with Dev Containers extension (for dev container)

### Development Workflow

1. **Make changes** to `src/userplugins/levelThis/index.ts`
2. **Rebuild**: `npm run build` or `npm run build:dev` (from repo root or in dev container)
3. **Test** build output in `vencord/dist/`
4. **Extract** dist files for local testing (optional)

### Safe Testing

Use the safe injection scripts to test without risk:

**PowerShell:**
```powershell
.\scripts\safe-inject.ps1
```

**Bash/WSL:**
```bash
bash scripts/safe-inject.sh
```

These scripts automatically backup Discord before injection.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in dev container
5. Submit a pull request

## License

GPL-3.0-or-later (same as Vencord)

## Resources

- [Vencord GitHub](https://github.com/Vendicated/Vencord)
- [Vencord Documentation](https://docs.vencord.dev/)
- [Vencord Discord](https://discord.gg/D9uwnFnqmd)
- [Plugin Development Guide](https://docs.vencord.dev/plugins/)

## Status

✅ Plugin implemented  
✅ Dev container setup  
✅ Documentation complete  
🔄 Ready for testing  

## Support

For issues or questions:
1. Check [DEV_CONTAINER_GUIDE.md](DEV_CONTAINER_GUIDE.md) for troubleshooting
2. Check Vencord Discord server for API changes
3. Open an issue on GitHub

---

**Note**: Using Vencord violates Discord's Terms of Service. Use at your own risk. This plugin is for educational purposes.
