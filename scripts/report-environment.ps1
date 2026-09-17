#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

Write-Host 'Local verification environment'
Write-Host "  PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "  OS: $([System.Runtime.InteropServices.RuntimeInformation]::OSDescription)"

foreach ($command in @('git', 'node', 'npm', 'npx')) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        $version = & $command --version
        Write-Host "  ${command}: $version"
    } else {
        Write-Host "  ${command}: NOT FOUND"
    }
}
