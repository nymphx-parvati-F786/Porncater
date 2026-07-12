# 1. Define the folder name
$LogFolder = "pipeline_logs"

# 2. Check if the folder exists, if not, create it silently
if (-not (Test-Path -Path $LogFolder)) {
    New-Item -ItemType Directory -Path $LogFolder | Out-Null
}

# 3. Generate a clean timestamp (e.g., 2024-10-24_15-30-05)
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$LogFile = "$LogFolder\pipeline-shell-log-$Timestamp.txt"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING HARVESTER PIPELINE" -ForegroundColor Green
Write-Host "📁 Logging all output to: $LogFile" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# 4. Run the Node script, capture ALL output, and split it to the screen and the file
npx ts-node bulk-upload.ts *>&1 | Tee-Object -FilePath $LogFile