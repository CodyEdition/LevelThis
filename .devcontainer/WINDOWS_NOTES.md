# Windows Dev Container Notes

## Important: Linux Container on Windows

The dev container runs **Linux** (Debian), not Windows. This is fine because:

✅ Vencord builds are cross-platform (Node.js/TypeScript)  
✅ The plugin code is platform-agnostic  
✅ Build output works on Windows Discord  

## What Works

- ✅ Building Vencord
- ✅ TypeScript compilation
- ✅ Plugin development
- ✅ Code testing
- ✅ Build verification

## What Doesn't Work Directly

- ❌ Direct Discord injection (needs Windows paths)
- ❌ Running Discord desktop app in container

## Solutions

### Option 1: Build in Container, Inject Locally

1. Build plugin in container
2. Copy `dist/` folder to Windows
3. Use safe injection script on Windows

### Option 2: Use WSL 2 (Recommended)

If you have WSL 2 installed:

1. Container runs faster (WSL 2 backend)
2. Better file I/O performance
3. Can access Windows paths via `/mnt/c/`

### Option 3: Test Build Only

Just verify the plugin builds correctly:
- No TypeScript errors
- Plugin files generated
- Structure is correct

Then inject manually into test Discord installation.

## File Paths

**In Container (Linux):**
```
/workspace/src/userplugins/levelThis/
```

**On Windows Host:**
```
g:\Repos\Level It\src\userplugins\levelThis\
```

**Accessing Windows from Container:**
```
/mnt/g/Repos/Level It/
```

## Performance Tips

1. **Use WSL 2 backend** in Docker Desktop (faster)
2. **Exclude node_modules** from mounts (use volumes)
3. **Use volume mounts** for large directories

## Discord Paths (Windows)

If you need to access Discord from container:

```bash
# Discord typically at:
/mnt/c/Users/YourName/AppData/Local/Discord

# Or set environment variable:
export DISCORD_PATH="/mnt/c/Users/YourName/AppData/Local/Discord"
```

## Building for Windows

The build output is platform-agnostic:
- JavaScript files work on Windows
- No native compilation needed
- Just copy `dist/` to Windows and inject

## Next Steps

1. Open in dev container (Linux)
2. Build plugin
3. Copy dist/ to Windows
4. Inject using PowerShell script
5. Test in Discord
