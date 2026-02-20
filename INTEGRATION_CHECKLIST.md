# Integration Checklist for Vencord

Use this checklist when integrating the Level This plugin into your Vencord setup.

## Pre-Integration

- [ ] Vencord repository cloned from https://github.com/Vendicated/Vencord
- [ ] Node.js v18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Dependencies installed (`pnpm install`)

## Plugin Integration

- [ ] Plugin folder copied to `src/userplugins/levelThis/`
- [ ] Plugin structure verified:
  - [ ] `index.ts` exists
  - [ ] `README.md` exists (optional but recommended)
- [ ] Plugin exports `definePlugin` as default
- [ ] Plugin has proper license header

## Build & Test

- [ ] Vencord builds successfully (`pnpm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors (if linting enabled)
- [ ] Plugin appears in Discord Settings → Vencord → Plugins
- [ ] Plugin can be enabled/disabled
- [ ] Settings panel shows both options:
  - [ ] "Level everyone to same volume" toggle
  - [ ] "Target volume (%)" slider

## Functionality Testing

- [ ] Join a voice channel with other participants
- [ ] Enable the plugin
- [ ] Toggle "Level everyone to same volume" ON
- [ ] Verify volumes are applied (check Discord's user volume sliders)
- [ ] Change target volume slider
- [ ] Verify volumes update
- [ ] Have someone join the voice channel
- [ ] Verify their volume is automatically set
- [ ] Disable plugin
- [ ] Verify volumes return to user-set values

## Error Handling

- [ ] Check browser console (F12) for errors
- [ ] Verify graceful degradation if APIs not found
- [ ] Test plugin disable/reenable
- [ ] Test Discord restart with plugin enabled

## Optional: Author Setup

If you want to customize the author:

1. Open `src/utils/constants.ts` in Vencord
2. Add yourself to the `Devs` object:
   ```typescript
   YourName: "YourName#1234",
   ```
3. Update plugin's `authors` field:
   ```typescript
   authors: [Devs.YourName],
   ```

## Troubleshooting

If something doesn't work:

1. **Check console logs**: Open DevTools (F12) → Console tab
2. **Look for "LevelThis" logs**: Should see "Volume API resolved successfully" and "Voice context API resolved successfully"
3. **Verify Discord version**: Plugin may need updates if Discord changed APIs
4. **Check Vencord version**: Ensure you're on latest Vencord main branch
5. **Ask for help**: Vencord Discord server: https://discord.gg/D9uwnFnqmd

## File Locations

```
Vencord/
└── src/
    └── userplugins/
        └── levelThis/
            ├── index.ts      ← Main plugin file
            └── README.md     ← Documentation (optional)
```

## Next Steps

- [ ] Test thoroughly in different scenarios
- [ ] Consider adding per-user overrides (future enhancement)
- [ ] Document any Discord API changes needed
- [ ] Consider submitting to official Vencord plugins (move to `src/plugins/`)
