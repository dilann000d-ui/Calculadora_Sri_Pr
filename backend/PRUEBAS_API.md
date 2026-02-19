# 🧪 PRUEBAS DE LA API - cURL

## Requisitos Previos

- Backend corriendo: `npm run dev` en la carpeta backend
- cURL instalado (viene con Windows 10+)

## 1️⃣ CREAR FACTURA (POST)

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1234567890123",
    "valor": 100,
    "gasto": "Vivienda",
    "descripcion": "Alquiler mensual"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i9j0k",
    "ruc": "1234567890123",
    "valor": 100,
    "baseImponible": 100,
    "impuesto": 12,
    "gasto": "Vivienda",
    "descripcion": "Alquiler mensual",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 2️⃣ OBTENER TODAS LAS FACTURAS (GET)

```bash
curl http://localhost:3000/api/facturas
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Facturas obtenidas exitosamente",
  "data": [...],
  "totalRegistros": 1,
  "totalBase": 100,
  "totalImpuesto": 12
}
```

---

## 3️⃣ OBTENER FACTURA POR ID (GET)

```bash
curl http://localhost:3000/api/facturas/650a1b2c3d4e5f6g7h8i9j0k
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i9j0k",
    "ruc": "1234567890123",
    "valor": 100,
    "baseImponible": 100,
    "impuesto": 12,
    "gasto": "Vivienda",
    "descripcion": "Alquiler mensual",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 4️⃣ OBTENER FACTURAS POR TIPO (GET)

```bash
curl http://localhost:3000/api/facturas/gasto/Vivienda
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [...],
  "totalRegistros": 1,
  "totalBase": 100,
  "totalImpuesto": 12
}
```

---

## 5️⃣ ACTUALIZAR FACTURA (PUT)

```bash
curl -X PUT http://localhost:3000/api/facturas/650a1b2c3d4e5f6g7h8i9j0k \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 150,
    "descripcion": "Alquiler actualizado"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Factura actualizada exitosamente",
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i9j0k",
    "ruc": "1234567890123",
    "valor": 150,
    "baseImponible": 150,
    "impuesto": 18,
    "gasto": "Vivienda",
    "descripcion": "Alquiler actualizado"
  }
}
```

---

## 6️⃣ ELIMINAR FACTURA (DELETE)

```bash
curl -X DELETE http://localhost:3000/api/facturas/650a1b2c3d4e5f6g7h8i9j0k
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Factura eliminada exitosamente"
}
```

---

## 🎬 FLUJO COMPLETO DE PRUEBA

### Paso 1: Crear 3 facturas diferentes

```bash
# Factura 1 - Vivienda
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1111111111111",
    "valor": 500,
    "gasto": "Vivienda"
  }'

# Factura 2 - Salud
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "2222222222222",
    "valor": 200,
    "gasto": "Salud"
  }'

# Factura 3 - Educación
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "3333333333333",
    "valor": 1000,
    "gasto": "Educación"
  }'
```

### Paso 2: Ver todas las facturas

```bash
curl http://localhost:3000/api/facturas
```

Debe mostrar 3 facturas con:
- Total Base: 1700
- Total Impuesto: 204 (1700 × 0.12)

### Paso 3: Filtrar por tipo

```bash
curl http://localhost:3000/api/facturas/gasto/Vivienda
```

Debe mostrar solo la factura de Vivienda con impuesto = 60

### Paso 4: Actualizar una factura

```bash
# Cambiar factura de Vivienda de 500 a 800
curl -X PUT http://localhost:3000/api/facturas/[ID_DE_FACTURA] \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 800
  }'
```

Debe mostrar el nuevo impuesto: 96 (800 × 0.12)

### Paso 5: Eliminar una factura

```bash
curl -X DELETE http://localhost:3000/api/facturas/[ID_DE_FACTURA]
```

### Paso 6: Verificar eliminación

```bash
curl http://localhost:3000/api/facturas
```

Debe mostrar solo 2 facturas

---

## 🛠️ USANDO POSTMAN (Alternativa a cURL)

1. **Descargar Postman**: https://www.postman.com/downloads/
2. **Crear colección**: "Calculadora SRI"
3. **Crear solicitudes**:

### POST - Crear Factura
- URL: `http://localhost:3000/api/facturas`
- Método: POST
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "ruc": "1234567890123",
  "valor": 100,
  "gasto": "Vivienda"
}
```

### GET - Obtener Todas
- URL: `http://localhost:3000/api/facturas`
- Método: GET

### GET - Por Tipo
- URL: `http://localhost:3000/api/facturas/gasto/Vivienda`
- Método: GET

### PUT - Actualizar
- URL: `http://localhost:3000/api/facturas/[ID]`
- Método: PUT
- Body:
```json
{
  "valor": 150
}
```

### DELETE - Eliminar
- URL: `http://localhost:3000/api/facturas/[ID]`
- Método: DELETE

---

## 📊 VALIDACIONES A PROBAR

### ❌ Prueba 1: RUC inválido (debe fallar)

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "123",
    "valor": 100,
    "gasto": "Vivienda"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "RUC debe tener exactamente 13 dígitos"
}
```

### ❌ Prueba 2: Valor inválido (debe fallar)

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1234567890123",
    "valor": 0,
    "gasto": "Vivienda"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Valor debe ser mayor a 0"
}
```

### ❌ Prueba 3: Tipo de gasto inválido (debe fallar)

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1234567890123",
    "valor": 100,
    "gasto": "OtroTipo"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Tipo de gasto inválido"
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] POST crea factura con impuesto correcto (valor × 0.12)
- [ ] GET retorna todas las facturas
- [ ] GET por ID retorna una factura
- [ ] GET por tipo filtra correctamente
- [ ] PUT actualiza valor e impuesto
- [ ] DELETE elimina factura
- [ ] Validaciones rechazan datos inválidos
- [ ] Totales se calculan correctamente
- [ ] Errores retornan mensaje descriptivo

---

## 🔗 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/facturas` | Crear factura |
| GET | `/api/facturas` | Obtener todas |
| GET | `/api/facturas/:id` | Obtener por ID |
| GET | `/api/facturas/gasto/:tipo` | Filtrar por tipo |
| PUT | `/api/facturas/:id` | Actualizar |
| DELETE | `/api/facturas/:id` | Eliminar |

---

## 📝 Notas Importantes

1. **El impuesto se calcula automáticamente**: No enviar en el POST, el servidor lo calcula
2. **baseImponible es igual a valor**: Se guarda para auditoría
3. **Los IDs son generados por MongoDB**: No enviar en el POST
4. **Las fechas se registran automáticamente**: createdAt y updatedAt

---

¡Listo para probar! 🚀
