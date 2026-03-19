# ── Configuration ────────────────────────────────────────────────────────────
# Sensitive values live in deploy.env.ps1 (gitignored). Copy from
# deploy.env.ps1.example and fill in your values before running this script.
$envFile = Join-Path $PSScriptRoot "deploy.env.ps1"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: deploy.env.ps1 not found. Copy deploy.env.ps1.example and fill in your VPS details." -ForegroundColor Red
    exit 1
}
. $envFile

# ── Helper: check → delete → upload a single image ───────────────────────────
# Usage: Deploy-Image "public\images\logo.webp" "public/images/logo.webp"
#   $LocalPath  — path relative to frontend/ on this machine (backslashes OK)
#   $RemotePath — path relative to $VPS_ROOT on the VPS  (forward slashes)
function Deploy-Image {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )

    $remoteFullPath = "$VPS_ROOT/$RemotePath"
    $filename       = Split-Path $LocalPath -Leaf

    Write-Host "Deploying image: $filename"

    # Check if the file already exists on the VPS
    # -n redirects stdin from /dev/null so SSH doesn't consume the script file
    $exists = ssh -n $VPS_HOST "[ -f $remoteFullPath ] && echo yes || echo no"

    if ($exists -match "yes") {
        Write-Host "  Found existing $filename on VPS — deleting..."
        ssh -n $VPS_HOST "rm -f $remoteFullPath"
    } else {
        Write-Host "  No existing $filename on VPS — fresh upload."
    }

    # Ensure the remote directory exists
    $remoteDir = "$VPS_ROOT/" + ($RemotePath -replace '/[^/]+$', '')
    ssh -n $VPS_HOST "mkdir -p $remoteDir"

    # Upload
    scp $LocalPath "${VPS_HOST}:${remoteFullPath}"
    Write-Host "  Uploaded $filename."
}

# ── Image deployments ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Deploying public images..."

Deploy-Image "public\og-image-homepage.jpg"  "public/og-image-homepage.jpg"
Deploy-Image "public\logo-512x512.png"       "public/logo-512x512.png"

Write-Host "Image deployment complete."
Write-Host ""

# ── Sitemap / build ───────────────────────────────────────────────────────────
Write-Host "Deleting local sitemap.xml..."
Remove-Item "public\sitemap.xml" -ErrorAction SilentlyContinue

Write-Host "Deleting server sitemap.xml..."
ssh $VPS_HOST "rm -f $VPS_ROOT/public/sitemap.xml"

Write-Host "Deleting local .next folder..."
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Building Next.js project..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Deployment stopped."
    exit
}

Write-Host "Deleting old .next on server..."
ssh $VPS_HOST "rm -rf $VPS_ROOT/.next"

Write-Host "Waiting for .next deletion on server..."

do {
    $exists = ssh $VPS_HOST "if [ -d $VPS_ROOT/.next ]; then echo exists; else echo gone; fi"
    Start-Sleep -Seconds 1
} while ($exists -match "exists")

Write-Host ".next deleted successfully."

Write-Host "Uploading .next folder..."
scp -r .next "${VPS_HOST}:${VPS_ROOT}/"

Write-Host "Uploading next.config.js..."
scp next.config.js "${VPS_HOST}:${VPS_ROOT}/"

Write-Host "Uploading server files..."
scp ..\server\server.js "${VPS_HOST}:${VPS_ROOT}/server/"
scp ..\server\routes.js "${VPS_HOST}:${VPS_ROOT}/server/"

Write-Host "Uploading sitemap.xml..."
scp public\sitemap.xml "${VPS_HOST}:${VPS_ROOT}/public/"

Write-Host "Uploading sitemap.xsl..."
scp public\sitemap.xsl "${VPS_HOST}:${VPS_ROOT}/public/"

Write-Host "Restarting server..."
ssh $VPS_HOST "pm2 restart all"

Write-Host "Deployment complete."