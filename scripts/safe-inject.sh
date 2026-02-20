#!/bin/bash
# Safe injection script for Windows (via WSL/Git Bash)
# Backs up Discord before injecting Vencord

set -e

DISCORD_PATH="${DISCORD_PATH:-/mnt/c/Users/$USER/AppData/Local/Discord}"
BACKUP_DIR="./discord-backup-$(date +%Y%m%d-%H%M%S)"

echo "🔍 Finding Discord installation..."
if [ ! -d "$DISCORD_PATH" ]; then
    echo "❌ Discord not found at $DISCORD_PATH"
    echo "💡 Set DISCORD_PATH environment variable to your Discord path"
    exit 1
fi

echo "✅ Found Discord at: $DISCORD_PATH"
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$DISCORD_PATH" "$BACKUP_DIR/" || {
    echo "❌ Backup failed. Aborting for safety."
    exit 1
}

echo "✅ Backup created at: $BACKUP_DIR"
echo "🚀 Injecting Vencord..."
cd vencord
pnpm run inject || {
    echo "❌ Injection failed!"
    echo "🔄 Restoring backup..."
    rm -rf "$DISCORD_PATH"
    cp -r "$BACKUP_DIR/Discord" "$DISCORD_PATH"
    echo "✅ Backup restored"
    exit 1
}

echo "✅ Injection complete!"
echo "💾 Backup saved at: $BACKUP_DIR"
echo "🔄 To restore: rm -rf $DISCORD_PATH && cp -r $BACKUP_DIR/Discord $DISCORD_PATH"
