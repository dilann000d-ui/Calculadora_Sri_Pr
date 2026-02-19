# 🚀 GUÍA DE DESPLIEGUE EN AWS EC2

## Paso 1: Crear Instancia EC2

### 1.1 Acceder a AWS Console
- Ir a: https://console.aws.amazon.com
- Buscar "EC2"
- Clic en "Instancias"

### 1.2 Lanzar instancia
- Clic en "Lanzar instancia"
- **AMI**: Amazon Linux 2 (gratuita)
- **Tipo**: t2.micro (gratuita)
- **Almacenamiento**: 20 GB (gratuito)
- Crear nuevo par de claves: `calculadora-sri-key.pem`
- **Grupo de seguridad**: Crear nuevo
  - SSH (22): Tu IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Custom TCP (3000): 0.0.0.0/0

### 1.3 Obtener IP pública
- Ir a "Instancias"
- Copiar IPv4 pública

## Paso 2: Conectar a la Instancia

### 2.1 En Windows (PowerShell o Git Bash)
```bash
# Cambiar permisos de la clave
Set-ItemProperty -Path calculadora-sri-key.pem -Attribute ReadOnly $false
icacls.exe calculadora-sri-key.pem /reset
icacls.exe calculadora-sri-key.pem /grant:r "$($env:USERNAME):(F)" /inheritance:e /C

# Conectar
ssh -i calculadora-sri-key.pem ec2-user@TU-IP-PUBLICA
```

### 2.2 En macOS/Linux
```bash
# Cambiar permisos
chmod 400 calculadora-sri-key.pem

# Conectar
ssh -i calculadora-sri-key.pem ec2-user@TU-IP-PUBLICA
```

## Paso 3: Configurar Servidor

### 3.1 Actualizar sistema
```bash
sudo yum update -y
sudo yum upgrade -y
```

### 3.2 Instalar Node.js 18
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
node --version
npm --version
```

### 3.3 Instalar Git
```bash
sudo yum install -y git
git --version
```

### 3.4 Instalar PM2 (gestor de procesos)
```bash
sudo npm install -g pm2
pm2 --version
```

### 3.5 Crear directorio de aplicación
```bash
mkdir -p /home/ec2-user/apps
cd /home/ec2-user/apps
```

## Paso 4: Desplegar Aplicación

### 4.1 Clonar repositorio
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd calculadora-sri-backend
```

### 4.2 Instalar dependencias
```bash
npm install --production
```

### 4.3 Crear archivo .env
```bash
nano .env
```

Agregar contenido:
```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/calculadora-sri
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com
```

Guardar: `Ctrl+X`, `Y`, `Enter`

### 4.4 Verificar aplicación
```bash
npm start
# Si funciona, presionar Ctrl+C
```

## Paso 5: Configurar PM2

### 5.1 Iniciar aplicación con PM2
```bash
pm2 start server.js --name "calculadora-sri"
pm2 status
```

### 5.2 Configurar para que inicie al reiniciar
```bash
pm2 startup
# Copiar comando sugerido y ejecutar
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Guardar configuración
pm2 save
```

### 5.3 Monitorear logs
```bash
pm2 logs calculadora-sri
pm2 monit
```

## Paso 6: Configurar Dominio (Opcional)

### 6.1 Comprar dominio (Namecheap, GoDaddy, etc.)

### 6.2 Apuntar a IP de EC2
- En panel de DNS, crear registro A:
  - Hostname: `@` o `api`
  - Value: IP pública de EC2
  - TTL: 3600

### 6.3 Esperar propagación DNS (hasta 48 horas)

## Paso 7: Certificado SSL (HTTPS)

### 7.1 Instalar Certbot
```bash
sudo yum install -y certbot python3-certbot-nginx
```

### 7.2 Instalar Nginx
```bash
sudo yum install -y nginx
```

### 7.3 Configurar Nginx como proxy inverso
```bash
sudo nano /etc/nginx/nginx.conf
```

Modificar bloque server:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guardar: `Ctrl+X`, `Y`, `Enter`

### 7.4 Iniciar Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.5 Obtener certificado SSL
```bash
sudo certbot --nginx -d tu-dominio.com
```

## Paso 8: Verificar Despliegue

### 8.1 Pruebas
```bash
# Desde tu máquina local
curl http://TU-IP-PUBLICA:3000
curl http://tu-dominio.com
curl https://tu-dominio.com
```

### 8.2 Obtener detalles
```bash
# En EC2
pm2 info calculadora-sri
pm2 describe calculadora-sri
```

## 🔒 Seguridad Recomendada

```bash
# Crear usuario no-root
sudo useradd -m deploy
sudo usermod -aG wheel deploy

# Configurar firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Actualizar SSH
sudo nano /etc/ssh/sshd_config
# Cambiar: PermitRootLogin no
# Cambiar: PasswordAuthentication no

sudo systemctl restart sshd
```

## 📊 Monitoreo y Mantenimiento

```bash
# Ver estado
pm2 status
pm2 logs

# Actualizar aplicación
cd /home/ec2-user/apps/calculadora-sri-backend
git pull
npm install
pm2 restart calculadora-sri

# Liberar memoria (si es necesario)
pm2 flush
```

## 💰 Costos Estimados

| Servicio | Costo | Nota |
|----------|--------|------|
| EC2 t2.micro | $0.0116/hora | Capa gratuita 12 meses |
| MongoDB Atlas | Gratis | Hasta 512 MB datos |
| Dominio | $1-15/año | Depende del registrador |
| **Total** | **~$0-15/año** | Con capa gratuita |

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| No se puede conectar SSH | Verificar par de claves, IP en grupo seguridad |
| Aplicación no inicia | Ver: `pm2 logs calculadora-sri` |
| MongoDB no conecta | Verificar URI, IP en MongoDB Atlas |
| Dominio no resuelve | Esperar propagación DNS, verificar registros |
| Puerto 3000 denegado | Agregar puerto al grupo de seguridad |

## ✅ Checklist Final

- [ ] Instancia EC2 creando
- [ ] SSH conectando correctamente
- [ ] Node.js instalado
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] .env configurado con credenciales reales
- [ ] npm install ejecutado
- [ ] Aplicación iniciada con PM2
- [ ] PM2 configurado para startup automático
- [ ] Dominio apuntando a EC2
- [ ] Certificado SSL obtenido
- [ ] Nginx configurado como proxy
- [ ] Frontend actualizado con URL backend

---

¡Despliegue completado! 🎉
