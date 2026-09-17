#!/usr/bin/env pwsh
# verify.ps1 - Local verification entry point for the static application.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$failures = 0

function Invoke-VerificationStep {
    param(
        [Parameter(Mandatory)]
        [string] $Name,

        [Parameter(Mandatory)]
        [scriptblock] $Command
    )

    Write-Host "== $Name =="
    & $Command
    if ($LASTEXITCODE -ne 0) {
        $script:failures++
        Write-Host "  FAILED: $Name" -ForegroundColor Red
    }
}

Push-Location $root
try {
    $index = Join-Path $root 'index.html'
    if (-not (Test-Path $index) -or [string]::IsNullOrWhiteSpace((Get-Content $index -Raw))) {
        Write-Host "index.html is missing or empty." -ForegroundColor Red
        exit 1
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
        -not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "Node.js and npm are required. Install Node.js, then run npm ci." -ForegroundColor Red
        exit 1
    }

    if (-not (Test-Path (Join-Path $root 'node_modules'))) {
        Write-Host "Dependencies are missing. Run npm ci before verification." -ForegroundColor Red
        exit 1
    }

    Invoke-VerificationStep "HTML validation" {
        & npm run check:html --silent
    }
    Invoke-VerificationStep "Inline JavaScript syntax" {
        & npm run check:scripts --silent
    }
    Invoke-VerificationStep "Browser workflow and accessibility" {
        & npm run test:browser --silent
    }
} finally {
    Pop-Location
}

if ($failures -gt 0) {
    Write-Host "verify.ps1 FAILED with $failures error(s)." -ForegroundColor Red
    exit 1
}

Write-Host "verify.ps1 PASSED." -ForegroundColor Green
exit 0
