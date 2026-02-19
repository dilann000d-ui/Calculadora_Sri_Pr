# 📦 BACKEND CALCULADORA SRI - RESUMEN COMPLETO

## ✅ Estructura Creada

```
backend/
├── config/
│   └── database.js              ✓ Conexión MongoDB
├── controllers/
│   └── facturasController.js    ✓ Lógica de negocios (CRUD)
├── middleware/
│   └── errorHandler.js          ✓ Manejo de errores
├── models/
│   └── Factura.js               ✓ Esquema MongoDB
├── routes/
│   └── facturas.js              ✓ Endpoints API
├── server.js                    ✓ Servidor principal
├── package.json                 ✓ Dependencias
├── .env.example                 ✓ Plantilla variables
├── .gitignore                   ✓ Archivos ignorados
├── README.md                    ✓ Documentación completa
├── INICIO_RAPIDO.md             ✓ Guía rápida
└── AWS_DEPLOYMENT.md            ✓ Despliegue en AWS
```

## 🎯 Funcionalidades Implementadas

### ✓ Conexión MongoDB
- Configuración con mongoose
- Soporte MongoDB Atlas (nube)
- Variables de entorno con dotenv

### ✓ Modelo Factura
- RUC: Validación de 13 dígitos
- Valor: Número positivo requerido
- Gasto: Enum (Vivienda, Salud, Educación)
- Impuesto: Calculado automáticamente (12% del valor)
- BaseImponible: Copia del valor para trazabilidad
- Timestamps: Creación y actualización automática

### ✓ Endpoints API (6 operaciones)
1. **POST /api/facturas** - Crear factura (calcula impuesto automáticamente)
2. **GET /api/facturas** - Obtener todas + totales
3. **GET /api/facturas/:id** - Obtener por ID
4. **PUT /api/facturas/:id** - Actualizar factura
5. **DELETE /api/facturas/:id** - Eliminar factura
6. **GET /api/facturas/gasto/:tipo** - Filtrar por tipo

### ✓ Características de Seguridad
- CORS habilitado para frontend Angular
- Validación de datos en backend
- Manejo de errores global
- Variables de entorno sensibles
- .gitignore para no subir .env

### ✓ Scripts npm
- `npm start` - Modo producción
- `npm run dev` - Modo desarrollo con nodemon

### ✓ Listo para AWS
- Puerto configurable
- Manejo de señales SIGTERM/SIGINT
- Logs formateados
- Health check endpoint

## 🚀 PASOS RÁPIDOS PARA COMENZAR

### 1. En terminal (carpeta backend)
```bash
npm install
```

### 2. Crear archivo .env
```env
MONGODB_URI=mongodb+srv://tu-usuario:contraseña@cluster.mongodb.net/calculadora-sri
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### 3. Ejecutar
```bash
npm run dev
```

### 4. Verificar
```
http://localhost:3000
```

## 📡 CONECTAR CON ANGULAR FRONTEND

### Opción 1: Usar HTTP directo en servicios

En `frontend/src/app/services/gasto.ts`, actualizar:

```typescript
export class GastoService {
  private apiUrl = 'http://localhost:3000/api/facturas';

  constructor(private http: HttpClient) {}

  // POST - Crear
  agregarGasto(gasto: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      ruc: gasto.ruc,
      valor: gasto.valor,
      gasto: gasto.tipoGasto
    });
  }

  // GET - Obtener todos
  obtenerGastos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // DELETE - Eliminar
  eliminarGasto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

### Opción 2: Usar en Reporte Component

En `frontend/src/app/components/reporte/reporte.ts`:

```typescript
export class Reporte implements OnInit {
  gastos: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.http.get('http://localhost:3000/api/facturas').subscribe({
      next: (response: any) => {
        this.gastos = response.data;
        console.log('Totales:', response.totalBase, response.totalImpuesto);
      },
      error: (err) => console.error('Error:', err)
    });
  }
}
```

## 🔒 VARIABLES DE ENTORNO

### Desarrollo (.env.development)
```env
MONGODB_URI=mongodb+srv://usuario_dev:pass_dev@cluster.mongodb.net/calculadora-sri-dev
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### Producción (.env.production)
```env
MONGODB_URI=mongodb+srv://usuario_prod:pass_prod@cluster.mongodb.net/calculadora-sri
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com
```

## 🧪 PRUEBAS CON POSTMAN

### 1. Crear Factura
```
POST http://localhost:3000/api/facturas
Body (JSON):
{
  "ruc": "1712345678001",
  "valor": 5000,
  "gasto": "Educación",
  "descripcion": "Pensión universitaria"
}
```

### 2. Obtener Todas
```
GET http://localhost:3000/api/facturas
```

### 3. Filtrar por Tipo
```
GET http://localhost:3000/api/facturas/gasto/Vivienda
```

### 4. Actualizar
```
PUT http://localhost:3000/api/facturas/[ID]
Body (JSON):
{
  "valor": 6000
}
```

### 5. Eliminar
```
DELETE http://localhost:3000/api/facturas/[ID]
```

## 📊 CÁLCULO DE IMPUESTO

El impuesto se calcula automáticamente en el backend:

```javascript
// En Factura.js (pre-save middleware)
facturasSchema.pre('save', function (next) {
  this.baseImponible = this.valor;
  this.impuesto = this.baseImponible * 0.12; // 12% del valor
  next();
});
```

**Ejemplo:**
- Valor ingresado: $5,000
- Base imponible: $5,000
- Impuesto calculado: $5,000 × 0.12 = **$600**

## 🚢 DESPLIEGUE EN AWS EC2

Pasos simplificados:
1. Crear instancia EC2 (t2.micro)
2. Conectar vía SSH
3. Instalar Node.js y Git
4. Clonar repositorio
5. Crear .env con credenciales
6. Instalar PM2: `sudo npm install -g pm2`
7. Iniciar: `pm2 start server.js`
8. Ver documentación completa en `AWS_DEPLOYMENT.md`

## 📚 DOCUMENTACIÓN

- **README.md** - Documentación técnica completa
- **INICIO_RAPIDO.md** - Guía de inicio en 5 minutos
- **AWS_DEPLOYMENT.md** - Paso a paso despliegue en AWS

## ⚠️ IMPORTANTE - ANTES DE SUBIR A PRODUCCIÓN

- [ ] Cambiar credenciales MongoDB (usuario/contraseña fuertes)
- [ ] Usar CORS_ORIGIN con dominio real (no localhost)
- [ ] Cambiar NODE_ENV a "production"
- [ ] No subir .env a GitHub (está en .gitignore)
- [ ] Habilitar SSL/HTTPS en AWS
- [ ] Configurar backups de MongoDB Atlas
- [ ] Usar PM2 con startup automático

## 🐛 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev                 # Inicia con nodemon

# Producción
npm start                   # Inicia con node

# PM2
pm2 start server.js         # Inicia aplicación
pm2 logs                    # Ve los logs
pm2 restart calculadora-sri # Reinicia
pm2 stop calculadora-sri    # Detiene
pm2 delete calculadora-sri  # Elimina
```

## 🎉 ¡LISTO!

Tu backend está 100% listo para:
✅ Desarrollo local
✅ Pruebas con Postman
✅ Conexión con Angular
✅ Despliegue en AWS
✅ Producción

---

**Próximos pasos:**
1. Ejecutar: `npm install && npm run dev`
2. Conectar Angular al backend
3. Probar endpoints
4. Desplegar en AWS

¡Éxito! 🚀
