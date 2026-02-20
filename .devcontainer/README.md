# Dev Container – LevelThis Plugin

Isolated environment for developing the LevelThis plugin without affecting your local Discord.

## Prerequisites

- **Docker Desktop** (Windows) with WSL 2 backend recommended
- **VS Code** with **Dev Containers** extension

## Quick Start

1. Open this folder in VS Code
2. F1 → **Dev Containers: Reopen in Container**
3. Wait for setup (first time: 5–10 min)
4. Build: `npm run build` or `npm run build:dev`

## What Runs Automatically

- Clones Vencord
- Installs dependencies
- Copies plugin
- Builds Vencord

## Development Workflow

```bash
# Rebuild after changes
npm run build
# or faster dev build
npm run build:dev

# Setup from scratch
npm run setup
```

## Testing

The container runs **Linux**; Discord injection requires Windows. Options:

1. **Build only** – Verify plugin compiles
2. **Extract dist** – Copy `vencord/dist/` to Windows, use `scripts/safe-inject.ps1`
3. **WSL 2** – Better file I/O; access Windows paths via `/mnt/c/`

## Troubleshooting

- **Container won't start** – Ensure Docker is running; allocate 4GB+ memory
- **pnpm not found** – `npm install -g pnpm`
- **Slow builds** – Use WSL 2 backend in Docker Desktop
