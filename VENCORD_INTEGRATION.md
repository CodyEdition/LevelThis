# Integrating Level This with Vencord GitHub Repository

This document explains how to use the [Vencord GitHub repository](https://github.com/Vendicated/Vencord) to build and test the Level This plugin.

## Overview

The Level This plugin is designed to work as a **userplugin** in Vencord. Userplugins are custom plugins that live in `src/userplugins/` and are not tracked by git (so they won't conflict with Vencord updates).

## Repository Structure

When integrated, your Vencord directory will look like:

```
Vencord/                          # Cloned from GitHub
├── src/
│   ├── plugins/                  # Official Vencord plugins (git-tracked)
│   └── userplugins/              # Custom plugins (git-ignored)
│       └── levelThis/            # Your plugin
│           ├── index.ts
│           └── README.md
├── package.json
├── pnpm-lock.yaml
└── ...
```

## Step-by-Step Integration

### 1. Clone Vencord Repository

```bash
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
```

### 2. Install Dependencies

Vencord uses `pnpm` as its package manager:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install Vencord dependencies
pnpm install
```

### 3. Add the Plugin

Copy the `levelThis` folder to Vencord's `src/userplugins/` directory:

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse "..\Level It\src\userplugins\levelThis" "src\userplugins\"
```

**Linux/Mac:**
```bash
cp -r ../Level\ It/src/userplugins/levelThis src/userplugins/
```

**Or manually:**
1. Navigate to `Vencord/src/userplugins/`
2. Create folder `levelThis`
3. Copy `index.ts` and `README.md` into it

### 4. Build Vencord

Build Vencord with your plugin included:

```bash
# Production build
pnpm run build

# Development build (faster, includes source maps)
pnpm run build:dev
```

### 5. Inject into Discord

**Windows Desktop:**
```bash
pnpm run inject
```

This will automatically find your Discord installation and inject Vencord.

**Manual injection:**
- Follow Vencord's installation guide: https://vencord.dev/download
- Or check `scripts/inject.js` for manual steps

### 6. Verify Plugin Loads

1. Open Discord
2. Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac) to open DevTools
3. Go to Console tab
4. Look for: `[LevelThis] Volume API resolved successfully`
5. Go to Settings → Vencord → Plugins
6. Find "Level This" in the list

## Development Workflow

### Watch Mode (Recommended for Development)

For active development, use watch mode which rebuilds on file changes:

```bash
# Terminal 1: Watch and rebuild
pnpm run dev

# Terminal 2: Inject (run once, or when needed)
pnpm run inject
```

Then:
1. Make changes to `src/userplugins/levelThis/index.ts`
2. Wait for rebuild (watch mode auto-rebuilds)
3. Reload Discord (`Ctrl+R` or restart)
4. Test changes

### Manual Rebuild

```bash
# Make changes to plugin
# Then rebuild
pnpm run build:dev

# Reload Discord
```

## Plugin Development Tips

### Testing Changes

1. **Enable plugin** in Settings → Vencord → Plugins
2. **Join a voice channel** with other participants
3. **Toggle "Level everyone to same volume"** ON
4. **Check Discord's user volume sliders** - they should all be set to your target volume
5. **Adjust target volume slider** - volumes should update
6. **Have someone join/leave** - their volume should auto-adjust

### Debugging

Check the browser console (F12) for logs:
- `[LevelThis] Volume API resolved successfully` - Good!
- `[LevelThis] Voice context API resolved successfully` - Good!
- `[LevelThis] Failed to resolve...` - API changed, needs update
- `[LevelThis] LevelThis plugin started` - Plugin loaded

### Common Issues

**Plugin doesn't appear:**
- Check folder name is `levelThis` (camelCase)
- Verify `index.ts` exports default plugin
- Rebuild: `pnpm run build`

**Volume leveling doesn't work:**
- Check console for API resolution errors
- Ensure you're in a voice channel
- Verify plugin is enabled
- Check target volume slider is set

**Build errors:**
- Run `pnpm install` again
- Check Node.js version: `node --version` (needs 18+)
- Clear cache: `pnpm run clean && pnpm install`

## Updating Vencord

When Vencord updates:

```bash
# Pull latest changes
git pull

# Reinstall dependencies (if package.json changed)
pnpm install

# Rebuild
pnpm run build

# Your userplugin in src/userplugins/levelThis/ is preserved
```

## Submitting to Official Vencord

If you want to submit this plugin to Vencord's official repository:

1. **Move plugin:**
   ```bash
   mv src/userplugins/levelThis src/plugins/levelThis
   ```

2. **Add yourself to Devs:**
   - Edit `src/utils/constants.ts`
   - Add: `YourName: "YourName#1234",`
   - Update plugin: `authors: [Devs.YourName]`

3. **Follow contribution guidelines:**
   - Read: https://github.com/Vendicated/Vencord/blob/main/CONTRIBUTING.md
   - Ensure code follows Vencord's style
   - Test thoroughly
   - Submit PR

## Resources

- **Vencord GitHub:** https://github.com/Vendicated/Vencord
- **Vencord Docs:** https://docs.vencord.dev/
- **Plugin Docs:** https://docs.vencord.dev/plugins/
- **Discord Server:** https://discord.gg/D9uwnFnqmd
- **Installation Guide:** https://vencord.dev/download

## File Structure Reference

```
Vencord/
├── src/
│   ├── api/              # Vencord APIs (@api/*)
│   ├── utils/            # Utilities (@utils/*)
│   ├── webpack/          # Webpack utilities (@webpack/*)
│   ├── plugins/           # Official plugins
│   └── userplugins/      # Your custom plugins ← levelThis goes here
├── scripts/              # Build scripts
├── package.json          # Dependencies
└── pnpm-lock.yaml        # Lock file
```

## Next Steps

1. ✅ Clone Vencord repo
2. ✅ Copy plugin to `src/userplugins/levelThis/`
3. ✅ Build and inject
4. ✅ Test in Discord
5. 🎉 Enjoy automatic voice leveling!

For detailed setup, see [SETUP.md](SETUP.md).  
For quick start, see [QUICKSTART.md](QUICKSTART.md).
