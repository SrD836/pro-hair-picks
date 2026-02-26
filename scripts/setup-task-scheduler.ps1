# GuiaDelSalon — Programador de tareas Windows
# Ejecutar como Administrador: clic derecho > "Ejecutar con PowerShell como administrador"

$taskName   = "GuiaDelSalon_ContentPipeline"
$nodeExe    = "C:\Program Files\nodejs\node.exe"
$scriptPath = "C:\Users\david\pro-hair-picks\scripts\daily-content\index.js"
$workDir    = "C:\Users\david\pro-hair-picks"
$logFile    = "C:\Users\david\pro-hair-picks\scripts\daily-content\output\pipeline.log"

# Crear carpeta de output si no existe
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) | Out-Null

# Acción: node index.js >> pipeline.log 2>&1
$action = New-ScheduledTaskAction `
    -Execute    "cmd.exe" `
    -Argument   "/c `"$nodeExe`" `"$scriptPath`" >> `"$logFile`" 2>&1" `
    -WorkingDirectory $workDir

# Disparador: todos los días a las 06:00
$trigger = New-ScheduledTaskTrigger -Daily -At "06:00"

# Configuración: hasta 2 h de ejecución, arrancar aunque se haya perdido la hora
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

# Registrar (o actualizar si ya existe)
Register-ScheduledTask `
    -TaskName $taskName `
    -Action   $action `
    -Trigger  $trigger `
    -Settings $settings `
    -RunLevel Highest `
    -Force

Write-Host ""
Write-Host "Tarea creada: $taskName" -ForegroundColor Green
Write-Host "Ejecucion diaria a las 06:00"
Write-Host "Log: $logFile"
Write-Host ""
Write-Host "Puedes verificarla en: Programador de tareas > Biblioteca de programador de tareas"
