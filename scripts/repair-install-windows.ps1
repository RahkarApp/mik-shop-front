# Run from the project root with PowerShell:
# powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\repair-install-windows.ps1
# This script only cleans dependencies under this project directory.
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))

function Fail([string]$message) {
  Write-Host "ERROR: $message" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path './package.json')) { Fail 'package.json not found.' }
$manifest = Get-Content './package.json' -Raw | ConvertFrom-Json
if ($manifest.name -ne 'miktest' -or $manifest.scripts.dev -notmatch '3300') {
  Fail 'Unexpected project. This installer only targets Shapsaz port 3300.'
}

try {
  $nodeVersion = (& node -p 'process.versions.node').Trim()
  $npmVersion = (& npm -v).Trim()
} catch { Fail 'Node.js/npm not available. Install an official Node.js LTS release first.' }
if ($LASTEXITCODE -ne 0 -or -not $nodeVersion) { Fail 'Node.js is not ready.' }
$parts = $nodeVersion.Split('.')
$major = [int]$parts[0]
$minor = [int]$parts[1]
if ($major -lt 20 -or ($major -eq 20 -and $minor -lt 19)) {
  Fail "Node.js $nodeVersion is too old. Use Node.js 22 LTS or newer (minimum 20.19)."
}
Write-Host "Node $nodeVersion; npm $npmVersion" -ForegroundColor Cyan

$registry = (& npm config get registry).Trim().TrimEnd('/')
if ($LASTEXITCODE -ne 0 -or -not $registry -or $registry -eq 'undefined') {
  Fail 'npm registry is not configured.'
}
Write-Host "Registry: $registry"
try {
  Invoke-WebRequest -Uri "$registry/-/ping" -UseBasicParsing -TimeoutSec 20 | Out-Null
} catch {
  Fail "Cannot reach npm registry. Keep your existing files. Check VPN/proxy/DNS/network first: $($_.Exception.Message)"
}

# Avoid silently reusing a lockfile from an older archive.
if (Test-Path './package-lock.json') {
  $oldLock = Get-Content './package-lock.json' -Raw | ConvertFrom-Json
  # npm lockfile v3 stores the root package under the empty-string key.
  $lockedNext = $oldLock.packages.PSObject.Properties[''].Value.dependencies.next
  if ($lockedNext -ne $manifest.dependencies.next) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backup = "./package-lock.previous-$stamp.json"
    Move-Item './package-lock.json' $backup
    Write-Host "Outdated lockfile backed up to $backup" -ForegroundColor Yellow
  }
}

foreach ($dir in @('./node_modules', './.next')) {
  if (Test-Path $dir) {
    Write-Host "Removing $dir ..."
    try { Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction Stop }
    catch {
      Fail "Cannot remove $dir (likely EPERM / locked file). Stop running dev/build processes, close file explorers and VS Code terminals, check antivirus, then retry. Detail: $($_.Exception.Message)"
    }
  }
}

Write-Host 'Installing dependencies and generating a NEW package-lock.json ...' -ForegroundColor Cyan
& npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-timeout=180000
if ($LASTEXITCODE -ne 0) { Fail 'npm install failed; check networking or proxy. Do not assume that packages are installed.' }

Write-Host 'Checking dependency tree ...' -ForegroundColor Cyan
& npm ls --depth=0
if ($LASTEXITCODE -ne 0) { Fail 'Dependency tree is not healthy; inspect npm ls errors.' }

Write-Host 'Running architecture and contract tests ...' -ForegroundColor Cyan
& npm run check
if ($LASTEXITCODE -ne 0) { Fail 'Contract/architecture checks failed.' }

Write-Host 'Running Next.js production build ...' -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) { Fail 'Build failed. Inspect the first compile/runtime error before deployment.' }

Write-Host 'SUCCESS: npm installation, dependency tree, tests and build completed.' -ForegroundColor Green
Write-Host 'You can now run npm run dev on http://localhost:3300'
