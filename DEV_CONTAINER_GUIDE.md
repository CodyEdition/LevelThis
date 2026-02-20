# Windows Dev Container Guide for Level This Plugin

This guide explains how to use a Windows dev container to develop and test the Vencord Level This plugin without affecting your local Discord installation.

## Why Use a Dev Container?

✅ **Isolated Environment** - Won't touch your local Discord  
✅ **Clean Builds** - Fresh environment every time  
✅ **Easy Cleanup** - Delete container when done  
✅ **Reproducible** - Same setup for everyone  
✅ **No Local Pollution** - No global npm/pnpm packages  

## Prerequisites

### Windows Requirements

1. **Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop/
   - Enable WSL 2 backend (recommended)
   - Ensure Docker is running

2. **Visual Studio Code**
   - Download: https://code.visualstudio.com/
   - Install the **Dev Containers** extension:
     - Press `F1` → "Extensions: Install Extensions"
     - Search "Dev Containers" by Microsoft
     - Install it

3. **Git for Windows** (optional, VS Code includes it)

## Quick Start

### Method 1: VS Code Dev Containers (Easiest)

1. **Open this folder in VS Code:**
   ```powershell
   code "g:\Repos\Level It"
   ```

2. **Open in Container:**
   - Press `F1` (or `Ctrl+Shift+P`)
   - Type: `Dev Containers: Reopen in Container`
   - Select it
   - Wait for container to build (first time: 5-10 minutes)

3. **Container will automatically:**
   - Clone Vencord repository
   - Install dependencies
   - Copy your plugin
   - Build Vencord

4. **Start developing!**
   - Terminal opens automatically
   - All tools are ready

### Method 2: Manual Docker (Advanced)

```powershell
# Build container
docker-compose -f .devcontainer/docker-compose.yml build

# Start container
docker-compose -f .devcontainer/docker-compose.yml up -d

# Enter container
docker-compose -f .devcontainer/docker-compose.yml exec vencord-dev bash
```

## Container Structure

```
/workspace/
├── src/
│   └── userplugins/
│       └── levelThis/        ← Your plugin source
├── vencord/                  ← Cloned Vencord repo
│   ├── src/
│   │   └── userplugins/
│   │       └── levelThis/    ← Copied plugin
│   └── dist/                 ← Built files
└── .devcontainer/            ← Container config
```

## Development Workflow

### 1. Make Changes

Edit `src/userplugins/levelThis/index.ts` in VS Code (or your editor)

### 2. Rebuild Plugin

```bash
# Inside container terminal
cd vencord
pnpm run build:dev
```

### 3. Test Build Output

```bash
# Check for errors
cd vencord
pnpm run build

# Verify plugin files exist
ls -la dist/userplugins/levelThis/
```

### 4. Extract for Local Testing (Optional)

Copy built files to your Windows machine:

```powershell
# From Windows PowerShell (outside container)
docker cp vencord-dev:/workspace/vencord/dist ./vencord-dist
```

Then manually inject into a test Discord installation.

## Testing Without Local Discord

### Option A: Build Verification Only

Test that the plugin compiles and builds correctly:

```bash
cd vencord
pnpm run build
# Check for TypeScript errors
# Verify dist/ contains plugin files
```

### Option B: Use Portable Discord

1. Download Discord Portable (if available) or install Discord to a test location
2. Mount it in container (edit `.devcontainer/docker-compose.yml`):
   ```yaml
   volumes:
     - C:/path/to/test-discord:/discord:ro
   ```
3. Inject to test location:
   ```bash
   DISCORD_PATH=/discord pnpm run inject
   ```

### Option C: Extract and Test Locally

```bash
# Build in container
cd vencord && pnpm run build

# Copy dist folder to Windows
# Then use safe-inject script (see below)
```

## Safe Injection Scripts

We've included scripts to safely inject into your local Discord with automatic backup:

### PowerShell (Windows Native)

```powershell
# From project root
.\scripts\safe-inject.ps1

# Or specify Discord path
.\scripts\safe-inject.ps1 -DiscordPath "C:\Users\YourName\AppData\Local\Discord"
```

### Bash (WSL/Git Bash)

```bash
# From project root
bash scripts/safe-inject.sh

# Or set Discord path
DISCORD_PATH="/mnt/c/Users/YourName/AppData/Local/Discord" bash scripts/safe-inject.sh
```

**What it does:**
1. ✅ Creates timestamped backup of Discord
2. ✅ Injects Vencord
3. ✅ If injection fails, restores backup automatically
4. ✅ Shows restore command if you need to rollback

## VS Code Features in Container

The dev container includes:

- ✅ **TypeScript** - Full IntelliSense and type checking
- ✅ **ESLint** - Code quality checks
- ✅ **Prettier** - Auto-formatting on save
- ✅ **Git** - Version control
- ✅ **Terminal** - Integrated terminal with bash

## Common Tasks

### Rebuild After Changes

```bash
cd vencord
pnpm run build:dev
```

### Check for Errors

```bash
cd vencord
pnpm run build 2>&1 | grep -i error
```

### Clean Build

```bash
cd vencord
rm -rf dist node_modules
pnpm install
pnpm run build
```

### Update Vencord

```bash
cd vencord
git pull
pnpm install
pnpm run build
```

### View Logs

```bash
# In VS Code, open Output panel
# Select "Dev Containers" from dropdown
```

## Troubleshooting

### Container Won't Start

**Check Docker:**
```powershell
docker ps
docker version
```

**Check logs:**
```powershell
docker-compose -f .devcontainer/docker-compose.yml logs
```

### pnpm Not Found

```bash
npm install -g pnpm
```

### Permission Errors

```bash
# Fix ownership (if needed)
sudo chown -R $USER:$USER /workspace
```

### Port Conflicts

Edit `.devcontainer/devcontainer.json` and modify `forwardPorts` array.

### Slow File I/O

This is normal with Docker on Windows. Consider:
- Using WSL 2 backend (faster)
- Excluding `node_modules` from mounts
- Using volume mounts instead of bind mounts

### Container Keeps Restarting

Check Docker Desktop → Settings → Resources → Memory (needs at least 4GB)

## File Persistence

Files in `/workspace` are persisted between container restarts:
- Your plugin source code
- Vencord repository (cloned once)
- Build artifacts

To start fresh:
```bash
# Remove Vencord clone
rm -rf vencord

# Re-run setup
bash .devcontainer/setup.sh
```

## Integration with Local VS Code

The dev container integrates seamlessly:
- ✅ File explorer shows container files
- ✅ Terminal runs inside container
- ✅ IntelliSense works with container TypeScript
- ✅ Debugging works (with configuration)

## Next Steps

1. ✅ Open in dev container
2. ✅ Wait for setup to complete
3. ✅ Make changes to plugin
4. ✅ Rebuild: `cd vencord && pnpm run build:dev`
5. ✅ Test build output
6. 🎉 Ready for development!

## Alternative: Local Development

If you prefer local development but want safety:

1. Use the safe injection scripts (`scripts/safe-inject.ps1`)
2. They automatically backup Discord before injection
3. Easy rollback if something goes wrong

## Resources

- [VS Code Dev Containers Docs](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- [Vencord GitHub](https://github.com/Vendicated/Vencord)
