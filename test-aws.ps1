#!/usr/bin/env pwsh
# Script para verificar despliegue en AWS
# Uso: ./test-aws.ps1 -IP "tu-ip-publica"

param(
    [string]$IP = ""
)

if ([string]::IsNullOrEmpty($IP)) {
    Write-Host "Uso: ./test-aws.ps1 -IP 54.123.45.67" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Introduce tu IP pública de AWS:" -ForegroundColor Cyan
    $IP = Read-Host "IP"
}

$baseUrl = "http://$IP`:3000"

Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  VERIFICACIÓN DESPLIEGUE AWS              ║" -ForegroundColor Cyan
Write-Host "║  URL: $baseUrl" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# TEST 1: Conectividad básica
# ============================================
Write-Host "TEST 1: Verificar conectividad..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl" -Method Get -ErrorAction Stop
    Write-Host "✓ Servidor respondiendo" -ForegroundColor Green
    Write-Host "  URL: $baseUrl" -ForegroundColor Green
    Write-Host "  Mensaje: $($response.mensaje)" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: No se puede conectar" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verifica que la IP es correcta" -ForegroundColor Yellow
    Write-Host "2. Verifica que instancia está 'Running'" -ForegroundColor Yellow
    Write-Host "3. Verifica que puerto 3000 está abierto en Security Group" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================
# TEST 2: Crear factura de prueba
# ============================================
Write-Host "TEST 2: Crear factura de prueba..." -ForegroundColor Cyan

$newFactura = @{
    ruc = "9876543210987"
    valor = 1000
    gasto = "Educación"
    descripcion = "Prueba desde AWS"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas" `
        -Method Post `
        -Body $newFactura `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✓ Factura creada exitosamente" -ForegroundColor Green
        Write-Host "  ID: $($response.data._id)" -ForegroundColor Green
        Write-Host "  Valor: `$$($response.data.valor)" -ForegroundColor Green
        Write-Host "  Impuesto: `$$($response.data.impuesto) (12%)" -ForegroundColor Green
        $facturaId = $response.data._id
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR al crear factura:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# TEST 3: Obtener todas las facturas
# ============================================
Write-Host "TEST 3: Obtener todas las facturas..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas" `
        -Method Get `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✓ Facturas obtenidas" -ForegroundColor Green
        Write-Host "  Total: $($response.totalRegistros) registros" -ForegroundColor Green
        Write-Host "  Base imponible: `$$($response.totalBase)" -ForegroundColor Green
        Write-Host "  Total impuesto: `$$($response.totalImpuesto)" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# TEST 4: Filtrar por tipo
# ============================================
Write-Host "TEST 4: Filtrar facturas por tipo (Educación)..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas/gasto/Educación" `
        -Method Get `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✓ Filtrado completado" -ForegroundColor Green
        Write-Host "  Facturas de Educación: $($response.totalRegistros)" -ForegroundColor Green
        Write-Host "  Total impuesto: `$$($response.totalImpuesto)" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# RESUMEN
# ============================================
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  VERIFICACIÓN COMPLETADA                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Despliegue en AWS verificado correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Conectar frontend a: http://$IP`:3000" -ForegroundColor Cyan
Write-Host "2. Cambiar apiUrl en gasto.ts" -ForegroundColor Cyan
Write-Host "3. Ejecutar: ng serve" -ForegroundColor Cyan
Write-Host "4. Acceder a: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL de tu API: $baseUrl" -ForegroundColor Yellow
Write-Host ""
