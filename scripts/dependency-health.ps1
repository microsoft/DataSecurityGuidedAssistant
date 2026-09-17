#!/usr/bin/env pwsh
param(
    [switch] $Online
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$failures = 0

function Invoke-DependencyStep {
    param(
        [Parameter(Mandatory)]
        [string] $Name,

        [Parameter(Mandatory)]
        [scriptblock] $Command,

        [switch] $Informational
    )

    Write-Host "== $Name =="
    & $Command
    if ($LASTEXITCODE -ne 0 -and -not $Informational) {
        $script:failures++
        Write-Host "  FAILED: $Name" -ForegroundColor Red
    } elseif ($LASTEXITCODE -ne 0) {
        Write-Host "  INFORMATIONAL: command exited with code $LASTEXITCODE" -ForegroundColor Yellow
    }
}

Push-Location $root
try {
    Invoke-DependencyStep 'Environment versions' {
        & (Join-Path $PSScriptRoot 'report-environment.ps1')
    }
    Invoke-DependencyStep 'Offline lockfile and registry policy' {
        & node (Join-Path $PSScriptRoot 'check-dependencies.mjs')
    }

    if ($Online) {
        Invoke-DependencyStep 'npm audit (high severity threshold)' {
            & npm audit --audit-level=high
        }
        Invoke-DependencyStep 'npm outdated (informational)' -Informational {
            & npm outdated
        }
    } else {
        Write-Host 'Online checks skipped. Run "pwsh scripts/dependency-health.ps1 -Online" before opening a PR.'
    }
} finally {
    Pop-Location
}

if ($failures -gt 0) {
    Write-Host "Dependency health checks FAILED with $failures error(s)." -ForegroundColor Red
    exit 1
}

Write-Host 'Dependency health checks PASSED.' -ForegroundColor Green
exit 0
