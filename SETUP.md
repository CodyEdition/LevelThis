# Level This Plugin - Setup Guide for Vencord

This guide explains how to integrate the Level This plugin into your Vencord development environment.

## Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **pnpm** (Vencord uses pnpm as package manager)
3. **Git** (to clone the Vencord repository)

## Step 1: Clone Vencord Repository

```bash
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
```

## Step 2: Install Dependencies

```bash
pnpm install
```

## Step 3: Copy Plugin Files

Copy the `levelThis` folder from this repository to Vencord's `src/userplugins/` directory:

```bash
# From the Level This repo root
cp -r src/userplugins/levelThis /path/to/Vencord/src/userplugins/
```

Or on Windows:
```powershell
Copy-Item -Recurse src\userplugins\levelThis C:\path\to\Vencord\src\userplugins\
```

Your Vencord directory structure should look like:
```
Vencord/
├── src/
│   ├── plugins/          # Official plugins
│   └── userplugins/       # Custom plugins
│       └── levelThis/      # Your plugin
│           ├── index.ts
│           └── README.md
├── package.json
└── ...
```

## Step 4: Build Vencord

Build Vencord with your plugin included:

```bash
pnpm run build
```

For development builds (faster, includes source maps):
```bash
pnpm run build:dev
```

## Step 5: Install Vencord

### Windows Desktop

1. Run the installer:
   ```bash
   pnpm run inject
   ```

2. Or manually copy the built files to Discord's app directory (see Vencord docs for exact path)

### Development Mode

For development, you can use Vencord's dev mode which watches for changes:

```bash
pnpm run dev
```

Then inject into Discord:
```bash
pnpm run inject
```

## Step 6: Test the Plugin

1. Open Discord (with Vencord injected)
2. Go to **Settings** → **Vencord** → **Plugins**
3. Find **"Level This"** in the plugin list
4. Enable it
5. Join a voice channel
6. Toggle **"Level everyone to same volume"** and adjust the **"Target volume (%)** slider

## Troubleshooting

### Plugin doesn't appear in settings

- Make sure the plugin folder is named `levelThis` (camelCase)
- Ensure `index.ts` exports a default plugin using `definePlugin`
- Check the browser console (F12) for errors
- Rebuild Vencord: `pnpm run build`

### Plugin fails to load

- Check the console for errors about missing stores/modules
- Discord may have updated and changed internal APIs
- Check Vencord's Discord server for updates: https://discord.gg/D9uwnFnqmd

### Volume leveling doesn't work

- Ensure you're in a voice channel with other participants
- Check that the plugin is enabled in settings
- Verify the target volume slider is set (default: 100%)
- Check console logs for API resolution errors

### Build errors

- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear build cache: `pnpm run clean` then `pnpm run build`

## Development Workflow

1. **Make changes** to `src/userplugins/levelThis/index.ts`
2. **Rebuild**: `pnpm run build:dev` (or use `pnpm run dev` for watch mode)
3. **Reload Discord** (Ctrl+R) or restart Discord
4. **Test** your changes

## File Structure

```
levelThis/
├── index.ts      # Main plugin file (all logic here)
└── README.md     # Plugin documentation
```

## API Reference

The plugin uses these Vencord APIs:

- `@api/Settings` - Plugin settings
- `@webpack` - Discord module finders (`findStore`, `findByProps`, `findByCode`)
- `@webpack/common` - Common utilities (`FluxDispatcher`)
- `@utils/Logger` - Logging
- `@utils/constants` - Constants (`Devs`)
- `@utils/types` - Plugin types (`definePlugin`, `OptionType`)

## Contributing

If you want to submit this plugin to Vencord's official repository:

1. Move the plugin from `src/userplugins/levelThis` to `src/plugins/levelThis`
2. Add yourself to `src/utils/constants.ts` in the `Devs` object
3. Follow Vencord's contribution guidelines: https://github.com/Vendicated/Vencord/blob/main/CONTRIBUTING.md
4. Submit a pull request

## Resources

- [Vencord Documentation](https://docs.vencord.dev/)
- [Vencord GitHub](https://github.com/Vendicated/Vencord)
- [Vencord Discord Server](https://discord.gg/D9uwnFnqmd)
- [Creating Plugins Guide](https://docs.vencord.dev/plugins/)
