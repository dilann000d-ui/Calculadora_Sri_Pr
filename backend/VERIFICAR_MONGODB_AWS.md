# 🧪 VERIFICAR CONEXIÓN MONGODB Y AWS

## 🔵 PARTE 1: PROBAR MONGODB LOCAL

### Paso 1: Verificar que MongoDB está configurado

En `backend/.env`, verifica que exista:

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/calculadora-sri?retryWrites=true&w=majority
```

### Paso 2: Iniciar servidor backend

```bash
cd backend
npm run dev
```

**Debes ver en la terminal:**
```
Servidor ejecutándose en puerto: 3000
MongoDB conectado exitosamente ✓
```

Si NO ves `MongoDB conectado exitosamente`, hay un problema.

---

## 🧪 PARTE 2: PROBAR ENDPOINTS MONGODB

### Test 1: Crear una factura (POST)

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d "{
    \"ruc\": \"1234567890123\",
    \"valor\": 500,
    \"gasto\": \"Vivienda\"
  }"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "data": {
    "_id": "...ID_MONGO...",
    "ruc": "1234567890123",
    "valor": 500,
    "impuesto": 60,
    "baseImponible": 500,
    "gasto": "Vivienda",
    "createdAt": "2026-01-27T..."
  }
}
```

### Test 2: Obtener todas las facturas (GET)

```bash
curl http://localhost:3000/api/facturas
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Facturas obtenidas exitosamente",
  "data": [...],
  "totalRegistros": 1,
  "totalBase": 500,
  "totalImpuesto": 60
}
```

### Test 3: Verificar en MongoDB Atlas

1. Ir a: https://cloud.mongodb.com
2. Login a tu cuenta
3. Click en "Collections"
4. Ver base de datos `calculadora-sri`
5. Ver colección `facturas`
6. **Debes ver el documento que acabas de crear** ✓

---

## 🌐 PARTE 3: DESPLEGAR A AWS

### Requisitos Previos

- [ ] Cuenta AWS (gratis por 1 año)
- [ ] EC2 instance t2.micro (gratuita)
- [ ] MongoDB Atlas cluster (gratuito)
- [ ] Conexión SSH

### Paso 1: Crear Instancia EC2

```bash
# En AWS Console:
1. Ir a EC2 Dashboard
2. "Launch Instance"
3. Seleccionar "Ubuntu 22.04 LTS" (gratuita)
4. Tipo: t2.micro (gratuita)
5. Crear security group con:
   - SSH (22): desde tu IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Puerto 3000: 0.0.0.0/0 (opcional, para pruebas)
6. Descargar keypair (.pem)
```

### Paso 2: Conectar por SSH

```bash
# En PowerShell (como administrador):
$keyPath = "C:\ruta\a\tu\key.pem"
ssh -i $keyPath ubuntu@tu-instancia-ip
```

### Paso 3: Instalar Node.js en EC2

```bash
# Una vez conectado por SSH:
sudo apt update
sudo apt install nodejs npm -y
node --version
npm --version
```

### Paso 4: Descargar tu código

```bash
# En la instancia EC2:
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo/backend
```

### Paso 5: Configurar .env en AWS

```bash
# Crear archivo .env en EC2:
nano .env
```

**Contenido:**
```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/calculadora-sri
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://tu-instancia-ip
```

Presionar: `Ctrl + O` → Enter → `Ctrl + X`

### Paso 6: Instalar dependencias

```bash
npm install
```

### Paso 7: Instalar PM2 (gestor procesos)

```bash
sudo npm install -g pm2
```

### Paso 8: Iniciar servidor con PM2

```bash
pm2 start server.js --name "calculadora-sri"
pm2 save
pm2 startup
```

---

## ✅ VERIFICAR DESPLIEGUE EN AWS

### Test 1: Verificar que servidor está corriendo

```bash
# Desde tu computadora (PowerShell):
curl http://tu-instancia-ip:3000
```

**Respuesta esperada:**
```json
{
  "mensaje": "Bienvenido a la API del Calculadora SRI"
}
```

### Test 2: Crear factura en AWS

```bash
curl -X POST http://tu-instancia-ip:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d "{
    \"ruc\": \"9999999999999\",
    \"valor\": 1000,
    \"gasto\": \"Educación\"
  }"
```

### Test 3: Ver en MongoDB Atlas

1. Ir a https://cloud.mongodb.com
2. Ver colección `facturas`
3. **Debe aparecer la factura creada desde AWS** ✓

### Test 4: Conectar Frontend a AWS

En `frontend/src/app/services/gasto.ts`:

Cambiar de:
```typescript
private apiUrl = 'http://localhost:3000/api/facturas';
```

A:
```typescript
private apiUrl = 'http://tu-instancia-ip:3000/api/facturas';
```

Luego:
```bash
cd frontend
ng serve
```

Abrir: http://localhost:4200

---

## 🔍 CHECKLIST FINAL

### MongoDB Local
- [ ] Backend inicia sin errores
- [ ] Muestra "MongoDB conectado exitosamente"
- [ ] POST crea factura (status 200)
- [ ] GET retorna datos
- [ ] Datos aparecen en MongoDB Atlas

### AWS Deployment
- [ ] EC2 instance creada
- [ ] SSH conecta correctamente
- [ ] Node.js instalado
- [ ] Código descargado
- [ ] .env configurado
- [ ] PM2 corriendo servidor
- [ ] POST funciona desde AWS
- [ ] Frontend conecta a AWS API
- [ ] Datos se guardan en MongoDB

### Producción
- [ ] CORS configurado correctamente
- [ ] Puerto 3000 abierto en security group
- [ ] MongoDB permite IP de AWS
- [ ] Servidor reinicia automáticamente (PM2)

---

## 🚨 TROUBLESHOOTING

### Error: "MongoDB connection failed"

**Solución:**
1. Verificar MONGODB_URI en .env
2. Verificar contraseña (sin caracteres especiales sin escape)
3. En MongoDB Atlas: Network Access → Add Current IP

### Error: "Cannot POST /api/facturas"

**Solución:**
1. Verificar que backend está corriendo
2. Verificar URL correcta (http:// no https://)
3. Verificar puerto 3000 en security group

### Error: "CORS error" en frontend

**Solución:**
1. Verificar CORS_ORIGIN en .env backend
2. Debe ser: `http://tu-instancia-ip:4200` o dominio
3. Reiniciar backend después de cambiar .env

### Error: "Connection timeout"

**Solución:**
1. Verificar security group permite puerto (22, 80, 443, 3000)
2. Verificar instancia está "Running"
3. Verificar IP pública de instancia

---

## 📊 COMANDOS ÚTILES (EN AWS)

```bash
# Ver si servidor está corriendo
pm2 list

# Ver logs en tiempo real
pm2 logs

# Reiniciar servidor
pm2 restart calculadora-sri

# Detener servidor
pm2 stop calculadora-sri

# Ver estado de procesos
pm2 status

# Ver uso de CPU/memoria
pm2 monit
```

---

## 🌐 CONFIGURAR DOMINIO (Opcional)

1. Comprar dominio (ej: GoDaddy, Namecheap)
2. En DNS settings, apuntar A record a IP pública de AWS
3. Esperar 24-48 horas propagación
4. Cambiar CORS_ORIGIN a tu dominio

---

## 📱 PROBAR CON POSTMAN

### Crear collection

1. Abrir Postman
2. "New Collection" → "Calculadora SRI"
3. Agregar requests:

```
POST http://tu-instancia-ip:3000/api/facturas
GET http://tu-instancia-ip:3000/api/facturas
GET http://tu-instancia-ip:3000/api/facturas/gasto/Vivienda
DELETE http://tu-instancia-ip:3000/api/facturas/:id
```

---

## ✨ PRÓXIMOS PASOS

1. **Hoy**: Probar MongoDB local con curl
2. **Mañana**: Desplegar en AWS
3. **Esta semana**: Configurar dominio + SSL

---

**¡Listo para probar!** 🚀

Empieza con: `npm run dev` en backend
