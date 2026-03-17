Write-Host "Deleting local sitemap.xml..."
Remove-Item "public\sitemap.xml" -ErrorAction SilentlyContinue

Write-Host "Deleting server sitemap.xml..."
ssh root@216.225.194.194 "rm -f /var/www/html/dollarsandlife/public/sitemap.xml"

Write-Host "Deleting local .next folder..."
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Building Next.js project..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Deployment stopped."
    exit
}

Write-Host "Deleting old .next on server..."
ssh root@216.225.194.194 "rm -rf /var/www/html/dollarsandlife/.next"

Write-Host "Waiting for .next deletion on server..."

do {
    $exists = ssh root@216.225.194.194 "if [ -d /var/www/html/dollarsandlife/.next ]; then echo exists; else echo gone; fi"
    Start-Sleep -Seconds 1
} while ($exists -match "exists")

Write-Host ".next deleted successfully."

Write-Host "Uploading .next folder..."
scp -r .next root@216.225.194.194:/var/www/html/dollarsandlife/

Write-Host "Uploading next.config.js..."
scp next.config.js root@216.225.194.194:/var/www/html/dollarsandlife/

Write-Host "Uploading server files..."
scp ..\server\server.js root@216.225.194.194:/var/www/html/dollarsandlife/server/
scp ..\server\routes.js root@216.225.194.194:/var/www/html/dollarsandlife/server/

Write-Host "Uploading sitemap.xml..."
scp public\sitemap.xml root@216.225.194.194:/var/www/html/dollarsandlife/public/

Write-Host "Restarting server..."
ssh root@216.225.194.194 "pm2 restart all"

Write-Host "Deployment complete."