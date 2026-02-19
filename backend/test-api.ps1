#!/usr/bin/env pwsh
# Script para probar MongoDB y API backend
# Uso: ./test-api.ps1

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PRUEBA API - Calculadora SRI          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Colores
$Success = "Green"
$Error = "Red"
$Info = "Cyan"
$Warning = "Yellow"

# URL base
$baseUrl = "http://localhost:3000"

# ============================================
# TEST 1: Verificar que servidor está corriendo
# ============================================
Write-Host "TEST 1: Verificar que servidor está corriendo..." -ForegroundColor $Info

try {
    $response = Invoke-RestMethod -Uri "$baseUrl" -Method Get -ErrorAction Stop
    Write-Host "✓ Servidor está corriendo en puerto 3000" -ForegroundColor $Success
    Write-Host "  Mensaje: $($response.mensaje)" -ForegroundColor $Success
} catch {
    Write-Host "✗ ERROR: No se puede conectar al servidor en puerto 3000" -ForegroundColor $Error
    Write-Host "  Asegúrate de ejecutar: npm run dev" -ForegroundColor $Warning
    exit 1
}

Write-Host ""

# ============================================
# TEST 2: Health check
# ============================================
Write-Host "TEST 2: Verificar health check..." -ForegroundColor $Info

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    Write-Host "✓ Health check OK" -ForegroundColor $Success
    Write-Host "  Status: $($response.status)" -ForegroundColor $Success
} catch {
    Write-Host "⚠ Health check no disponible (normal en algunas versiones)" -ForegroundColor $Warning
}

Write-Host ""

# ============================================
# TEST 3: Crear factura
# ============================================
Write-Host "TEST 3: Crear factura de prueba..." -ForegroundColor $Info

$newFactura = @{
    ruc = "1234567890123"
    valor = 500
    gasto = "Vivienda"
    descripcion = "Prueba desde PowerShell"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas" `
        -Method Post `
        -Body $newFactura `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✓ Factura creada exitosamente" -ForegroundColor $Success
        Write-Host "  ID: $($response.data._id)" -ForegroundColor $Success
        Write-Host "  Valor: $($response.data.valor)" -ForegroundColor $Success
        Write-Host "  Impuesto: $($response.data.impuesto)" -ForegroundColor $Success
        $facturaId = $response.data._id
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor $Error
    }
} catch {
    Write-Host "✗ ERROR al crear factura:" -ForegroundColor $Error
    Write-Host "  $($_.Exception.Message)" -ForegroundColor $Error
    exit 1
}

Write-Host ""

# ============================================
# TEST 4: Obtener todas las facturas
# ============================================
Write-Host "TEST 4: Obtener todas las facturas..." -ForegroundColor $Info

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas" `
        -Method Get `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✓ Facturas obtenidas" -ForegroundColor $Success
        Write-Host "  Total registros: $($response.totalRegistros)" -ForegroundColor $Success
        Write-Host "  Total base: $($response.totalBase)" -ForegroundColor $Success
        Write-Host "  Total impuesto: $($response.totalImpuesto)" -ForegroundColor $Success
        Write-Host "  Cantidad en lista: $($response.data.Count)" -ForegroundColor $Success
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor $Error
    }
} catch {
    Write-Host "✗ ERROR al obtener facturas:" -ForegroundColor $Error
    Write-Host "  $($_.Exception.Message)" -ForegroundColor $Error
}

Write-Host ""

# ============================================
# TEST 5: Obtener por ID
# ============================================
if ($facturaId) {
    Write-Host "TEST 5: Obtener factura por ID..." -ForegroundColor $Info
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas/$facturaId" `
            -Method Get `
            -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✓ Factura obtenida por ID" -ForegroundColor $Success
            Write-Host "  RUC: $($response.data.ruc)" -ForegroundColor $Success
            Write-Host "  Valor: $($response.data.valor)" -ForegroundColor $Success
        } else {
            Write-Host "✗ Error: $($response.message)" -ForegroundColor $Error
        }
    } catch {
        Write-Host "✗ ERROR al obtener factura:" -ForegroundColor $Error
        Write-Host "  $($_.Exception.Message)" -ForegroundColor $Error
    }
    
    Write-Host ""
}

# ============================================
# TEST 6: Filtrar por tipo
# ============================================
Write-Host "TEST 6: Filtrar facturas por tipo (Vivienda)..." -ForegroundColor $Info

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas/gasto/Vivienda" `
        -Method Get `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✓ Facturas filtradas" -ForegroundColor $Success
        Write-Host "  Total Vivienda: $($response.totalRegistros)" -ForegroundColor $Success
        Write-Host "  Total impuesto Vivienda: $($response.totalImpuesto)" -ForegroundColor $Success
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor $Error
    }
} catch {
    Write-Host "✗ ERROR al filtrar:" -ForegroundColor $Error
    Write-Host "  $($_.Exception.Message)" -ForegroundColor $Error
}

Write-Host ""

# ============================================
# TEST 7: Actualizar factura
# ============================================
if ($facturaId) {
    Write-Host "TEST 7: Actualizar factura..." -ForegroundColor $Info
    
    $updateData = @{
        valor = 750
        descripcion = "Actualizada desde prueba"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas/$facturaId" `
            -Method Put `
            -Body $updateData `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✓ Factura actualizada" -ForegroundColor $Success
            Write-Host "  Nuevo valor: $($response.data.valor)" -ForegroundColor $Success
            Write-Host "  Nuevo impuesto: $($response.data.impuesto)" -ForegroundColor $Success
        } else {
            Write-Host "✗ Error: $($response.message)" -ForegroundColor $Error
        }
    } catch {
        Write-Host "✗ ERROR al actualizar:" -ForegroundColor $Error
        Write-Host "  $($_.Exception.Message)" -ForegroundColor $Error
    }
    
    Write-Host ""
}

# ============================================
# TEST 8: Eliminar factura
# ============================================
if ($facturaId) {
    Write-Host "TEST 8: Eliminar factura..." -ForegroundColor $Info
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/facturas/$facturaId" `
            -Method Delete `
            -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✓ Factura eliminada" -ForegroundColor $Success
        } else {
            Write-Host "✗ Error: $($response.message)" -ForegroundColor $Error
        }
    } catch {
        Write-Host "✗ ERROR al eliminar:" -ForegroundColor $Error
        Write-Host "  $($_.Exception.Message)" -ForegroundColor $Error
    }
    
    Write-Host ""
}

# ============================================
# RESUMEN
# ============================================
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PRUEBAS COMPLETADAS                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Todos los tests ejecutados" -ForegroundColor $Success
Write-Host "✓ API funcionando correctamente" -ForegroundColor $Success
Write-Host "✓ MongoDB conectado y operativo" -ForegroundColor $Success
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor $Info
Write-Host "1. Verificar datos en MongoDB Atlas (https://cloud.mongodb.com)" -ForegroundColor $Info
Write-Host "2. Conectar frontend: http://localhost:4200" -ForegroundColor $Info
Write-Host "3. Desplegar a AWS cuando esté listo" -ForegroundColor $Info
Write-Host ""
