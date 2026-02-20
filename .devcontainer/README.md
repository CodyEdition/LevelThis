# Dev Container Setup for Level This Plugin

This dev container provides an isolated environment for developing and testing the Vencord Level This plugin without affecting your local Discord installation.

## Prerequisites

- **Docker Desktop** (Windows) installed and running
- **VS Code** with the **Dev Containers** extension installed
- **Git** (for cloning repositories)

## Quick Start

### Option 1: VS Code Dev Containers (Recommended)

1. **Open VS Code** in this workspace
2. **Install Dev Containers extension** if not already installed:
   - Press `F1` → Type "Extensions: Install Extensions"
   - Search for "Dev Containers" by Microsoft
   - Install it
3. **Open in Container:**
   - Press `F1` → Type "Dev Containers: Reopen in Container"
   - Wait for container to build and start (first time takes a few minutes)
4. **Once container is ready:**
   - Terminal will open automatically
   - Dependencies are installed automatically via `postCreateCommand`

### Option 2: Manual Docker Setup

```bash
# Build the container
docker-compose -f .devcontainer/docker-compose.yml build

# Start the container
docker-compose -f .devcontainer/docker-compose.yml up -d

# Enter the container
docker-compose -f .devcontainer/docker-compose.yml exec vencord-dev bash
```

## Container Environment

The container includes:
- **Node.js 18** (required for Vencord)
- **pnpm** (Vencord's package manager)
- **TypeScript** and build tools
- **Git** for version control

## Development Workflow

### 1. Clone Vencord Inside Container

```bash
# Inside the container
cd /workspace
git clone https://github.com/Vendicated/Vencord.git vencord
cd vencord
```

### 2. Install Vencord Dependencies

```bash
pnpm install
```

### 3. Copy Plugin

```bash
# Copy Level This plugin to Vencord
cp -r /workspace/src/userplugins/levelThis vencord/src/userplugins/
```

### 4. Build Vencord

```bash
cd vencord
pnpm run build
# or for dev builds
pnpm run build:dev
```

## Testing Options

### Option A: Build Only (No Injection)

Test the build process without injecting into Discord:

```bash
# Build and verify no errors
pnpm run build

# Check plugin structure
ls -la src/userplugins/levelThis/

# Verify TypeScript compiles
pnpm run typecheck  # if available
```

### Option B: Extract Build Artifacts

Build and extract the plugin files for manual testing:

```bash
# Build
pnpm run build

# The built files will be in vencord/dist/
# You can copy these to your local machine for testing
```

### Option C: Use Portable Discord (Advanced)

If you want to test injection in the container:

1. **Download Discord Portable** (if available) or use a test Discord installation
2. **Mount Discord directory** in docker-compose.yml:
   ```yaml
   volumes:
     - /path/to/discord:/discord:ro
   ```
3. **Run inject script** pointing to mounted Discord:
   ```bash
   DISCORD_PATH=/discord pnpm run inject
   ```

## File Structure in Container

```
/workspace/
├── src/
│   └── userplugins/
│       └── levelThis/       # Your plugin source
├── vencord/                   # Cloned Vencord repo
│   ├── src/
│   │   └── userplugins/
│   │       └── levelThis/    # Copied plugin
│   └── dist/                  # Built files
└── .devcontainer/             # Dev container config
```

## VS Code Integration

The dev container is configured with:
- **TypeScript support** (uses workspace TypeScript)
- **ESLint** for code quality
- **Prettier** for formatting
- **Format on save** enabled

## Troubleshooting

### Container won't start

```bash
# Check Docker is running
docker ps

# Check logs
docker-compose -f .devcontainer/docker-compose.yml logs
```

### pnpm not found

```bash
# Install manually
npm install -g pnpm
```

### Permission errors

```bash
# Fix permissions (Linux containers)
sudo chown -R $USER:$USER /workspace
```

### Port conflicts

Edit `.devcontainer/devcontainer.json` and remove/modify `forwardPorts` if needed.

## Benefits of Dev Container

✅ **Isolated environment** - Won't affect your local Discord  
✅ **Reproducible builds** - Same environment every time  
✅ **Easy cleanup** - Just delete the container  
✅ **Team consistency** - Everyone uses the same setup  
✅ **No local pollution** - No global npm/pnpm packages  

## Limitations

⚠️ **Discord injection** - Harder to test full injection in container  
⚠️ **Windows-specific** - Container runs Linux, but builds should work  
⚠️ **Performance** - Slightly slower than native (file I/O)  

## Alternative: Local Testing Script

If you prefer to test locally but safely, create a script that:
1. Backs up your Discord installation
2. Injects Vencord
3. Provides easy rollback

See `scripts/safe-inject.sh` (create if needed).

## Next Steps

1. ✅ Open in dev container
2. ✅ Clone Vencord
3. ✅ Copy plugin
4. ✅ Build
5. ✅ Test build output
6. 🎉 Ready for development!

For local testing, you can copy the built files out of the container and inject manually into a test Discord installation.
