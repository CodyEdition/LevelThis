# Dev Container Quick Start

## 30-Second Setup

1. **Open VS Code** in this folder
2. **Press `F1`** → Type `Dev Containers: Reopen in Container`
3. **Wait** for setup (first time: 5-10 min)
4. **Done!** Container is ready

## What Happens Automatically

✅ Clones Vencord repo  
✅ Installs dependencies  
✅ Copies your plugin  
✅ Builds Vencord  

## Common Commands

```bash
# Rebuild (from repo root)
npm run build
# or
npm run build:dev

# Setup from scratch
npm run setup

# Clean and re-setup
npm run clean && npm run setup && npm run build
```

**Check build output:**
```bash
ls -la vencord/dist/
```

## Testing

**Build only (safe):**
```bash
npm run build
```

**Extract for Windows:**
```powershell
# From Windows PowerShell
docker cp vencord-dev:/workspace/vencord/dist ./vencord-dist
```

Then use `scripts/safe-inject.ps1` to inject safely.

## Troubleshooting

**Container won't start?**
- Check Docker Desktop is running
- Check Docker has enough memory (4GB+)

**pnpm not found?**
```bash
npm install -g pnpm
```

**Need help?**
See `DEV_CONTAINER_GUIDE.md` for detailed instructions.
