$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path ".\backend\venv")) {
    python -m venv ".\backend\venv"
}

$backendCommand = "& .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8000"
$frontendCommand = "npm install; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -WorkingDirectory (Join-Path $root "backend")
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand -WorkingDirectory (Join-Path $root "frontend")

Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Close the spawned terminals to stop both services."
