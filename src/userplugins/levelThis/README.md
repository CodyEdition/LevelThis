# LevelThis

Automatically levels all voice participants to the same volume in Discord voice channels.

## Features

- Target volume (50–200%) for all participants
- Auto-applies when users join/leave
- Check interval and max participants settings
- Per-user exemptions
- Chat bar toggle when in a voice channel

## Settings

- **Enabled** – Level everyone to same volume
- **Target volume (%)** – 100 = Discord default
- **Check interval (seconds)** – Lower = more responsive, higher = less CPU
- **Max participants** – Auto-pause when exceeded (0 = no limit)
- **Exempt user IDs** – Comma-separated IDs to skip
- **Dev logging** – Log volume changes to console (filter by "LevelThis")

## Limitations

- Desktop only (Vencord Desktop on Windows)
- Uses Discord's internal APIs; may break with Discord updates
- No raw audio processing (adjusts volume sliders only)

## Author Image

Replace `author.png` in this folder to change the Authors section avatar. Rebuild after changing.
