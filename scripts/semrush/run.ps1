# run.ps1 — Lanza el extractor de Keyword Gap de Semrush
# Ejecutar desde cualquier ubicacion
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir
Write-Host "=== Semrush Keyword Gap Extractor ===" -ForegroundColor Cyan
Write-Host "Directorio: $ScriptDir"
node extract-keyword-gap.js
