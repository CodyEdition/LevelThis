# Level This

Automatically levels all voice participants to the same volume in Discord voice channels.

## Features

- Set a target volume (50-200%) that all participants will be leveled to
- Automatically applies when users join/leave voice channels
- Works on Vencord Desktop (Windows)

## Limitations

- **Desktop only**: This plugin works by adjusting Discord's per-user volume sliders. It does not process raw audio, so it cannot compress dynamics within a single user's stream.
- Requires Discord's internal APIs (`MediaEngineStore`, `setLocalVolume`) which may change with Discord updates.

## How to Use

1. Enable the plugin in Settings > Plugins
2. Toggle "Level everyone to same volume"
3. Adjust the "Target volume (%)" slider to your desired level (default: 100%)
4. Join a voice channel - all participants will be leveled to your target volume

## Settings

- **Level everyone to same volume**: Enable/disable automatic leveling
- **Target volume (%)**: The volume level (50-200%) that all participants will be set to

## Author image

The Authors section in the plugin modal uses `author.png` in this folder. The build loads it via Vencord's `file://./author.png?base64` loader. To change the author picture, replace `author.png` with your image and rebuild.
