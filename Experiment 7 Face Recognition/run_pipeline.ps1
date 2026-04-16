$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

function Invoke-Step {
    param(
        [string]$Label,
        [string]$Command
    )

    Write-Host $Label
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $Command"
    }
}

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

$PythonExe = Join-Path $ProjectRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    Invoke-Step "[setup] Creating virtual environment..." "py -3.12 -m venv .venv"
}

Write-Host "[setup] Activating virtual environment..."
$ActivateScript = Join-Path $ProjectRoot ".venv\Scripts\Activate.ps1"
. $ActivateScript

Invoke-Step "[setup] Upgrading pip tooling..." "python -m pip install --upgrade pip setuptools wheel"
Invoke-Step "[setup] Installing dependencies..." "python -m pip install -r requirements.txt"
Invoke-Step "[augment] Generating augmented training images..." "python .\augment_training_images.py --training-dir .\training-images --per-image 10"
Invoke-Step "[train] Creating encodings..." "python .\create_encodings.py"
Invoke-Step "[train] Training classifier..." "python .\train.py"

Write-Host "[done] Pipeline completed."
