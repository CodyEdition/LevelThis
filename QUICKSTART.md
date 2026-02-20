# Quick Start - Level This Plugin for Vencord

**Important:** `npm run setup` and `npm run build` must be run from the **Level This project root** (the folder that contains `package.json` and `vencord/`), not from inside `vencord/`.

## Quick Setup (5 minutes)

### 1. Clone Vencord
```bash
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Copy Plugin
Copy the `levelThis` folder to `Vencord/src/userplugins/`:
```bash
# Linux/Mac
cp -r /path/to/Level\ It/src/userplugins/levelThis src/userplugins/

# Windows PowerShell
Copy-Item -Recurse "..\Level It\src\userplugins\levelThis" src\userplugins\
```

### 4. Build & Inject
```bash
pnpm run build
pnpm run inject   # or: npx pnpm run inject (if pnpm not in PATH)
```
If you use the Level This repo (with `npm run setup` / `npm run build`), run **`npm run inject`** from the repo root instead—no pnpm required.

### 5. Use It!
1. Open Discord
2. Settings → Vencord → Plugins
3. Enable **"Level This"**
4. Join a voice channel
5. Toggle **"Level everyone to same volume"**

Done! 🎉

## What It Does

- Automatically sets all voice participants to the same volume
- Updates when users join/leave
- Configurable target volume (50-200%)
- Works on Vencord Desktop (Windows)

## Need Help?

See [SETUP.md](SETUP.md) for detailed instructions and troubleshooting.
