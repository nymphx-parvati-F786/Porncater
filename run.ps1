$LogFolder = 'pipeline_logs'

if (-not (Test-Path -Path $LogFolder)) {
    New-Item -ItemType Directory -Path $LogFolder | Out-Null
}

$Timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$LogFile = $LogFolder + '\pipeline-shell-log-' + $Timestamp + '.txt'

Write-Host '=========================================' -ForegroundColor Cyan
Write-Host '🚀 STARTING HARVESTER PIPELINE' -ForegroundColor Green
Write-Host ('📁 Logging all output to: ' + $LogFile) -ForegroundColor Yellow
Write-Host '=========================================' -ForegroundColor Cyan

npx ts-node bulk-upload.ts *>&1 | Tee-Object -FilePath $LogFile