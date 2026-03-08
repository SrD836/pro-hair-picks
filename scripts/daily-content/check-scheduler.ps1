# check-scheduler.ps1 — Verifica el estado de la tarea programada GuiaDelSalon_ContentPipeline
# Uso: .\check-scheduler.ps1

$TaskName = "GuiaDelSalon_ContentPipeline"
$LogFile  = "C:\Users\david\pro-hair-picks\scripts\daily-content\output\pipeline.log"

Write-Host "=== GuiaDelSalon — Verificación de tarea programada ===" -ForegroundColor Cyan
Write-Host "Fecha actual: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $task) {
    Write-Host "ERROR: La tarea '$TaskName' no existe en Task Scheduler." -ForegroundColor Red
    Write-Host "Ejecuta setup-scheduler.ps1 como Administrador para crearla."
    exit 1
}

$info = Get-ScheduledTaskInfo -TaskName $TaskName

Write-Host "Tarea:           $TaskName"
Write-Host "Estado:          $($task.State)"
Write-Host "Último resultado: $($info.LastTaskResult)"
Write-Host "Última ejecución: $($info.LastRunTime)"
Write-Host "Próxima ejecución: $($info.NextRunTime)"
Write-Host ""

if ($info.LastTaskResult -eq 0) {
    Write-Host "OK: La última ejecución fue exitosa (código 0)." -ForegroundColor Green
} elseif ($info.LastTaskResult -eq 267011) {
    Write-Host "INFO: La tarea nunca ha sido ejecutada aún." -ForegroundColor Yellow
} else {
    Write-Host "FALLO detectado — último código de error: $($info.LastTaskResult)" -ForegroundColor Red
    Write-Host ""

    if (Test-Path $LogFile) {
        Write-Host "Últimas 20 líneas de pipeline.log:" -ForegroundColor Yellow
        Get-Content $LogFile -Tail 20 | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "pipeline.log no encontrado en: $LogFile" -ForegroundColor Yellow
    }
    exit 1
}

# Verificar health check
$LastSuccessFile = "C:\Users\david\pro-hair-picks\scripts\daily-content\output\last_success.txt"
if (Test-Path $LastSuccessFile) {
    $lastSuccess = Get-Content $LastSuccessFile -Raw
    $lastDate    = $lastSuccess.Trim().Substring(0, 10)
    $today       = (Get-Date).ToString("yyyy-MM-dd")
    if ($lastDate -eq $today) {
        Write-Host "Health check: Pipeline completado hoy ($lastSuccess)" -ForegroundColor Green
    } else {
        Write-Host "Health check: ALERTA — último éxito fue $lastDate (hoy es $today)" -ForegroundColor Red
    }
} else {
    Write-Host "Health check: last_success.txt no encontrado." -ForegroundColor Yellow
}
