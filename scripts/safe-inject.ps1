# Safe injection script for Windows PowerShell
# Backs up Discord before injecting Vencord

param(
    [string]$DiscordPath = "$env:LOCALAPPDATA\Discord"
)

$ErrorActionPreference = "Stop"

$BackupDir = ".\discord-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "🔍 Finding Discord installation..." -ForegroundColor Cyan
if (-not (Test-Path $DiscordPath)) {
    Write-Host "❌ Discord not found at $DiscordPath" -ForegroundColor Red
    Write-Host "💡 Set -DiscordPath parameter to your Discord path" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found Discord at: $DiscordPath" -ForegroundColor Green
Write-Host "📦 Creating backup..." -ForegroundColor Cyan

try {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item -Path $DiscordPath -Destination $BackupDir -Recurse -Force
    Write-Host "✅ Backup created at: $BackupDir" -ForegroundColor Green
} catch {
    Write-Host "❌ Backup failed. Aborting for safety." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "🚀 Injecting Vencord..." -ForegroundColor Cyan
Push-Location vencord
try {
    node scripts/runInstaller.mjs -- --install
    if ($LASTEXITCODE -ne 0) {
        throw "Injection failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Injection failed!" -ForegroundColor Red
    Write-Host "🔄 Restoring backup..." -ForegroundColor Yellow
    Remove-Item -Path $DiscordPath -Recurse -Force
    Copy-Item -Path "$BackupDir\Discord" -Destination $DiscordPath -Recurse -Force
    Write-Host "✅ Backup restored" -ForegroundColor Green
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "✅ Injection complete!" -ForegroundColor Green
Write-Host "💾 Backup saved at: $BackupDir" -ForegroundColor Cyan
Write-Host "🔄 To restore: Remove-Item -Recurse -Force '$DiscordPath'; Copy-Item -Recurse -Force '$BackupDir\Discord' '$DiscordPath'" -ForegroundColor Yellow
