# setup-scheduler.ps1 — Configura la tarea programada de GuiaDelSalon con trigger de backup
# EJECUTAR COMO ADMINISTRADOR
# Uso: .\setup-scheduler.ps1

$TaskName    = "GuiaDelSalon_ContentPipeline"
$ProjectDir  = "C:\Users\david\pro-hair-picks"
$LogFile     = "$ProjectDir\scripts\daily-content\output\pipeline.log"
$NodePath    = "C:\Program Files\nodejs\node.exe"

# Verificar que se ejecuta como Administrador
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Ejecuta este script como Administrador." -ForegroundColor Red
    exit 1
}

# Verificar que node.exe existe
if (-not (Test-Path $NodePath)) {
    $NodePath = (Get-Command node -ErrorAction SilentlyContinue)?.Source
    if (-not $NodePath) {
        Write-Host "ERROR: node.exe no encontrado. Instala Node.js primero." -ForegroundColor Red
        exit 1
    }
}

Write-Host "=== Configurando tarea: $TaskName ===" -ForegroundColor Cyan

# ── Crear directorio de output si no existe ───────────────────────────────────
$OutputDir = "$ProjectDir\scripts\daily-content\output"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Creado directorio: $OutputDir"
}

# ── Acción: ejecutar el pipeline y redirigir output al log ───────────────────
# Usamos cmd /c para poder usar >> (redirección de shell)
$ActionArgs = "/c `"node `"$ProjectDir\scripts\daily-content\index.js`" >> `"$LogFile`" 2>&1`""
$action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument $ActionArgs `
    -WorkingDirectory $ProjectDir

# ── Trigger 1: Diario a las 06:00 ────────────────────────────────────────────
$trigger1 = New-ScheduledTaskTrigger -Daily -At "06:00"

# ── Trigger 2: Al iniciar sesión con delay de 5 minutos (backup para PC apagado) ──
$trigger2 = New-ScheduledTaskTrigger -AtLogOn
$trigger2.Delay = "PT5M"

# ── Configuración del task ────────────────────────────────────────────────────
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 10) `
    -RunOnlyIfNetworkAvailable $false

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
    Write-Host "  Nombre:            $TaskName"
    Write-Host "  Trigger diario:    06:00"
    Write-Host "  Trigger backup:    Al iniciar sesión + 5 min"
    Write-Host "  StartWhenAvailable: Sí (se ejecuta si se perdió el trigger de las 06:00)"
    Write-Host "  Reintentos:        2 × cada 10 minutos si falla"
    Write-Host "  Tiempo límite:     2 horas"
    Write-Host "  Nivel:             Highest (administrador)"
    Write-Host "  Próxima ejecución: $($info.NextRunTime)"
    Write-Host ""
    Write-Host "Para verificar el estado: .\check-scheduler.ps1" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: No se pudo crear la tarea." -ForegroundColor Red
    exit 1
}
