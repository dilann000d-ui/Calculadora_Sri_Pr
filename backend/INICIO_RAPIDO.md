# 🚀 INICIO RÁPIDO - Backend Calculadora SRI

## Pasos para ejecutar el backend

### 1️⃣ Abrir terminal en la carpeta backend
```bash
cd backend
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Crear archivo .env
Copiar contenido de `.env.example` y crear archivo `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/calculadora-sri
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### ⚠️ IMPORTANTE - MongoDB Atlas
1. Crear cuenta en: https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Agregar usuario y contraseña
4. Obtener cadena de conexión
5. Reemplazar en `.env` el valor de MONGODB_URI

### 4️⃣ Ejecutar servidor
```bash
npm start           # Modo producción
npm run dev         # Modo desarrollo (recomendado)
```

### ✅ Verificar que funciona
- Abrir: http://localhost:3000
- Debería ver mensaje de bienvenida

## 📡 Conectar Frontend Angular

En `src/services/gasto.ts` del frontend, cambiar:

```typescript
private apiUrl = 'http://localhost:3000/api/facturas';
```

Luego en los métodos:
```typescript
// GET
this.http.get(this.apiUrl)

// POST
this.http.post(this.apiUrl, datos)

// DELETE
this.http.delete(`${this.apiUrl}/${id}`)
```

## 🧪 Probar API

### Con Postman
1. Descargar: https://www.postman.com/downloads/
2. Crear colección
3. POST: http://localhost:3000/api/facturas
4. Body (JSON):
```json
{
  "ruc": "1712345678001",
  "valor": 1000,
  "gasto": "Vivienda"
}
```

### Con cURL
```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{"ruc":"1712345678001","valor":1000,"gasto":"Vivienda"}'
```

## 🐛 Errores comunes

| Error | Solución |
|-------|----------|
| MONGODB_URI not defined | Crear archivo `.env` con MONGODB_URI |
| Cannot connect to MongoDB | Verificar URI y credenciales en MongoDB Atlas |
| Port 3000 already in use | Cambiar PORT en `.env` |
| CORS error | Verificar CORS_ORIGIN = http://localhost:4200 |

## 📊 Endpoints disponibles

```
POST   /api/facturas           - Crear factura
GET    /api/facturas           - Obtener todas
GET    /api/facturas/:id       - Obtener por ID
PUT    /api/facturas/:id       - Actualizar
DELETE /api/facturas/:id       - Eliminar
GET    /api/facturas/gasto/:tipo - Por tipo de gasto
```

## 🎯 Próximos pasos

1. ✅ Backend corriendo
2. ✅ Conectar con frontend
3. ✅ Probar endpoints
4. ✅ Desplegar en AWS EC2
5. ✅ Configurar MongoDB Atlas producción

---
¡Listo para usar! 🎉
