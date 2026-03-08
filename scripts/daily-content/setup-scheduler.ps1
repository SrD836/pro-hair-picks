# setup-scheduler.ps1 — Configura la tarea programada de GuiaDelSalon con trigger de backup
# EJECUTAR COMO ADMINISTRADOR
# Uso: .\setup-scheduler.ps1
# Compatible con PowerShell 5.x

$TaskName   = "GuiaDelSalon_ContentPipeline"
$ProjectDir = "C:\Users\david\pro-hair-picks"
$LogFile    = "$ProjectDir\scripts\daily-content\output\pipeline.log"
$NodePath   = "C:\Program Files\nodejs\node.exe"

# ── Verificar que se ejecuta como Administrador ───────────────────────────────
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Ejecuta este script como Administrador." -ForegroundColor Red
    exit 1
}

# ── Verificar que node.exe existe ─────────────────────────────────────────────
if (-not (Test-Path $NodePath)) {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) { $NodePath = $nodeCmd.Source }
    if (-not $NodePath) {
        Write-Host "ERROR: node.exe no encontrado. Instala Node.js primero." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Node.js encontrado: $NodePath" -ForegroundColor Green

Write-Host "=== Configurando tarea: $TaskName ===" -ForegroundColor Cyan

# ── Crear directorio de output si no existe ───────────────────────────────────
$OutputDir = "$ProjectDir\scripts\daily-content\output"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Creado directorio: $OutputDir"
}

# ── Acción: ejecutar el pipeline y redirigir output al log ───────────────────
$ActionArgs = "/c `"node `"$ProjectDir\scripts\daily-content\index.js`" >> `"$LogFile`" 2>&1`""
$action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument $ActionArgs `
    -WorkingDirectory $ProjectDir
Write-Host "Accion creada OK." -ForegroundColor Green

# ── Trigger 1: Diario a las 06:00 ────────────────────────────────────────────
$trigger1 = New-ScheduledTaskTrigger -Daily -At "06:00"
Write-Host "Trigger diario (06:00) creado OK." -ForegroundColor Green

# ── Trigger 2: Al iniciar sesión con delay de 5 minutos ──────────────────────
$trigger2 = New-ScheduledTaskTrigger -AtLogOn
$trigger2.Delay = "PT5M"
Write-Host "Trigger AtLogOn (+5 min delay) creado OK." -ForegroundColor Green

# ── Settings: splatting explícito para PS 5.x ─────────────────────────────────
# Se usa splatting (@{}) para que PS 5.x resuelva los parámetros por nombre
# y no por posición, evitando errores con RestartCount/RestartInterval.
# -RunOnlyIfNetworkAvailable es un Switch; omitirlo equivale a $false.
$settingsParams = @{
    ExecutionTimeLimit   = (New-TimeSpan -Hours 2)
    StartWhenAvailable   = $true
    MultipleInstances    = 'IgnoreNew'
    RestartCount         = 2
    RestartInterval      = (New-TimeSpan -Minutes 10)
}
Write-Host "Parametros de settings preparados. Creando settings..." -ForegroundColor Yellow

$settings = New-ScheduledTaskSettingsSet @settingsParams
if ($null -eq $settings) {
    Write-Host "ERROR: New-ScheduledTaskSettingsSet devolvio null." -ForegroundColor Red
    exit 1
}
Write-Host "Settings creados OK." -ForegroundColor Green

# ── Registrar o actualizar la tarea ──────────────────────────────────────────
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Actualizando tarea existente..." -ForegroundColor Yellow
} else {
    Write-Host "Creando nueva tarea..." -ForegroundColor Green
}

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger1,$trigger2 `
    -Settings $settings `
    -RunLevel Highest `
    -Force | Out-Null

# ── Verificar resultado ───────────────────────────────────────────────────────
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
    $info = Get-ScheduledTaskInfo -TaskName $TaskName
    Write-Host ""
    Write-Host "OK: Tarea configurada correctamente." -ForegroundColor Green
    Write-Host "  Nombre:             $TaskName"
    Write-Host "  Trigger diario:     06:00"
    Write-Host "  Trigger backup:     Al iniciar sesion + 5 min"
    Write-Host "  StartWhenAvailable: Si (se ejecuta si se perdio el trigger de las 06:00)"
    Write-Host "  Reintentos:         2 x cada 10 minutos si falla"
    Write-Host "  Tiempo limite:      2 horas"
    Write-Host "  Nivel:              Highest (administrador)"
    Write-Host "  Proxima ejecucion:  $($info.NextRunTime)"
    Write-Host ""
    Write-Host "Para verificar el estado: .\check-scheduler.ps1" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: No se pudo crear la tarea." -ForegroundColor Red
    exit 1
}
