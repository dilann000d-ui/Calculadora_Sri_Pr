# API Calculadora SRI - Backend

API REST desarrollada con Node.js y Express para la gestión de facturas y cálculo de impuesto a la renta según normativa SRI Ecuador.

## 🚀 Características

- ✅ API REST con Express.js
- ✅ Base de datos MongoDB con Mongoose
- ✅ Cálculo automático de impuestos (12%)
- ✅ CORS habilitado para conexión con frontend Angular
- ✅ Variables de entorno con dotenv
- ✅ Manejo de errores robusto
- ✅ Validación de datos
- ✅ Scripts para desarrollo y producción

## 📋 Requisitos

- Node.js >= 14.0.0
- npm >= 6.0.0
- MongoDB Atlas (nube) o MongoDB local
- Git

## 🔧 Instalación

### 1. Clonar el repositorio y navegar al backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto (copiar desde `.env.example`):

```bash
# Base de Datos
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/calculadora-sri

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200
```

**Para MongoDB Atlas:**
1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cuenta gratuita
3. Crear cluster
4. Generar usuario y contraseña
5. Copiar URI de conexión
6. Reemplazar `usuario:contraseña` con tus credenciales

## 🏃 Ejecución

### Modo desarrollo (con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Endpoints API

### Base URL
```
http://localhost:3000/api
```

### 1. Crear Factura
```
POST /api/facturas
Content-Type: application/json

{
  "ruc": "1712345678001",
  "valor": 1000,
  "gasto": "Vivienda",
  "descripcion": "Factura ejemplo"
}

Response:
{
  "success": true,
  "message": "Factura registrada exitosamente",
  "data": {
    "_id": "...",
    "ruc": "1712345678001",
    "valor": 1000,
    "gasto": "Vivienda",
    "baseImponible": 1000,
    "impuesto": 120,
    "createdAt": "2024-01-27T10:30:00Z"
  }
}
```

### 2. Obtener todas las Facturas
```
GET /api/facturas

Response:
{
  "success": true,
  "message": "Facturas obtenidas exitosamente",
  "totalRegistros": 5,
  "totalBase": "5000.00",
  "totalImpuesto": "600.00",
  "data": [...]
}
```

### 3. Obtener Factura por ID
```
GET /api/facturas/:id

Response:
{
  "success": true,
  "data": {...}
}
```

### 4. Actualizar Factura
```
PUT /api/facturas/:id
Content-Type: application/json

{
  "valor": 1500,
  "gasto": "Salud"
}

Response:
{
  "success": true,
  "message": "Factura actualizada exitosamente",
  "data": {...}
}
```

### 5. Eliminar Factura
```
DELETE /api/facturas/:id

Response:
{
  "success": true,
  "message": "Factura eliminada exitosamente",
  "data": {...}
}
```

### 6. Obtener Facturas por Tipo de Gasto
```
GET /api/facturas/gasto/Vivienda

Response:
{
  "success": true,
  "tipo": "Vivienda",
  "totalRegistros": 3,
  "totalBase": "3000.00",
  "totalImpuesto": "360.00",
  "data": [...]
}
```

## 📊 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   └── facturasController.js # Lógica de negocios
├── middleware/
│   └── errorHandler.js       # Manejo de errores
├── models/
│   └── Factura.js            # Esquema de MongoDB
├── routes/
│   └── facturas.js           # Definición de rutas
├── server.js                 # Archivo principal
├── package.json              # Dependencias
├── .env.example              # Variables de entorno (ejemplo)
├── .gitignore                # Archivos ignorados
└── README.md                 # Este archivo
```

## 🔐 Esquema de Factura

```javascript
{
  _id: ObjectId,
  ruc: String (13 dígitos - requerido),
  valor: Number (mayor a 0 - requerido),
  gasto: String (Vivienda|Salud|Educación - requerido),
  baseImponible: Number (igual al valor),
  impuesto: Number (12% del valor - calculado automáticamente),
  descripcion: String (opcional),
  createdAt: Date (fecha de creación automática),
  updatedAt: Date (fecha de actualización automática)
}
```

## 🚀 Despliegue en AWS EC2

### 1. Crear instancia EC2

```bash
# Conectar vía SSH
ssh -i tu-clave.pem ec2-user@tu-instancia-publica

# Actualizar sistema
sudo yum update -y

# Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar Git
sudo yum install -y git

# Clonar repositorio
git clone tu-repositorio.git
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
nano .env

# Agregar:
MONGODB_URI=tu-uri-mongodb
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://tu-dominio.com
```

### 3. Ejecutar con PM2 (gestor de procesos)

```bash
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start server.js --name "calculadora-sri"

# Guardar configuración
pm2 save

# Crear startup hook
pm2 startup
```

### 4. Configurar seguridad de grupo (AWS Console)

- Permitir puerto 3000 (TCP)
- Permitir puerto 80 (HTTP)
- Permitir puerto 443 (HTTPS)

## 📝 Ejemplo Completo de Uso

### Con cURL

```bash
# Crear factura
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1712345678001",
    "valor": 5000,
    "gasto": "Educación",
    "descripcion": "Pensión anual"
  }'

# Obtener todas
curl http://localhost:3000/api/facturas

# Actualizar
curl -X PUT http://localhost:3000/api/facturas/65b2a8c9d1e2f3g4h5i6j7k8 \
  -H "Content-Type: application/json" \
  -d '{"valor": 6000}'

# Eliminar
curl -X DELETE http://localhost:3000/api/facturas/65b2a8c9d1e2f3g4h5i6j7k8
```

## 🐛 Troubleshooting

### Error: MONGODB_URI no definido
```bash
# Verificar que .env existe y tiene MONGODB_URI
cat .env
```

### Error: Puerto 3000 en uso
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: CORS bloqueado
```bash
# Verificar CORS_ORIGIN en .env
CORS_ORIGIN=http://localhost:4200
```

## 📞 Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.

## 📄 Licencia

MIT License - 2024
