# Proyecto FastAPI - API de Saludos

Este proyecto implementa una API REST simple usando FastAPI con dos endpoints para saludos.

## Prerrequisitos

### Opción 1: Desarrollo Local

- Python 3.7 o superior
- pip (gestor de paquetes de Python)

### Opción 2: Docker

- Docker instalado en tu sistema

### Opción 3: AWS ECR + ECS

- AWS CLI configurado con credenciales
- Docker instalado en tu sistema
- Acceso a AWS ECR y ECS

## Configuración del Entorno

### Opción 1: Desarrollo Local

#### 1. Crear un entorno virtual

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar el entorno virtual
# En macOS/Linux:
source venv/bin/activate

# En Windows:
venv\Scripts\activate
```

#### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### Opción 2: Docker

#### 1. Construir la imagen Docker

```bash
docker build -t fastapi-greetings .
```

#### 2. Ejecutar el contenedor

```bash
docker run -p 8000:8000 fastapi-greetings
```

## Ejecutar la Aplicación

### Desarrollo Local

```bash
uvicorn main:app --reload
```

### Docker

```bash
# Ejecutar en primer plano
docker run -p 8000:8000 fastapi-greetings

# Ejecutar en segundo plano
docker run -d -p 8000:8000 --name greetings-api fastapi-greetings
```

La aplicación estará disponible en: `http://localhost:8000`

## Despliegue en AWS ECR

### Prerrequisitos AWS

- Tener configurado AWS CLI con credenciales válidas
- Repositorio ECR creado: `my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo`

### 1. Autenticación con ECR

```bash
# Obtener token de autenticación y autenticar Docker con ECR
aws ecr get-login-password --region region-aws | docker login --username AWS --password-stdin my-account-id.dkr.ecr.region-aws.amazonaws.com
```

### 2. Construir imagen para ECR

```bash
# Construir imagen con tag descriptivo
docker build -t my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-v1.0 .

# O con tag latest (genérico)
docker build -t my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:latest .
```

### 3. Subir imagen a ECR

```bash
# Push de la imagen con tag descriptivo
docker push my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-v1.0

# O push con tag latest
docker push my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:latest
```

### 4. Verificar imagen en ECR

```bash
# Listar imágenes en el repositorio ECR
aws ecr list-images --repository-name name-space/repo --region region-aws
```

### Estrategias de Naming para Tags

```bash
# Ejemplos de tags descriptivos
docker build -t my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-v1.0 .
docker build -t my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-prod .
docker build -t my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-$(date +%Y%m%d) .

# Push con tags específicos
docker push my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-v1.0
```

### Comandos adicionales ECR

```bash
# Eliminar imagen específica del repositorio ECR
aws ecr batch-delete-image --repository-name name-space/repo --image-ids imageTag=fastapi-greetings-v1.0 --region region-aws

# Listar todas las imágenes con detalles
aws ecr describe-images --repository-name name-space/repo --region region-aws
```

## Despliegue en AWS ECS

### Prerrequisitos ECS

- Cluster ECS creado: `arn:aws:ecs:region-aws:my-account-id:cluster/cluster-name`
- Imagen subida a ECR con tag descriptivo
- Rol de ejecución de tareas (taskExecutionRole) configurado

### 1. Crear Task Definition

Crear archivo `task-definition.json`:

```json
{
  "family": "fastapi-greetings-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::my-account-id:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "fastapi-greetings",
      "image": "my-account-id.dkr.ecr.region-aws.amazonaws.com/name-space/repo:fastapi-greetings-v1.0",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fastapi-greetings",
          "awslogs-region": "region-aws",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 2. Registrar Task Definition

```bash
# Crear log group en CloudWatch
aws logs create-log-group --log-group-name /ecs/fastapi-greetings --region region-aws

# Registrar la task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region region-aws
```

### 3. Crear Service en ECS

```bash
# Crear service (reemplaza subnet-xxx y sg-xxx con tus valores)
aws ecs create-service \
  --cluster cluster-name \
  --service-name fastapi-greetings-service \
  --task-definition fastapi-greetings-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --region region-aws
```

### 4. Verificar despliegue

```bash
# Ver estado del service
aws ecs describe-services --cluster cluster-name --services fastapi-greetings-service --region region-aws

# Ver tareas en ejecución
aws ecs list-tasks --cluster cluster-name --service-name fastapi-greetings-service --region region-aws

# Ver logs de la aplicación
aws logs get-log-events --log-group-name /ecs/fastapi-greetings --log-stream-name ecs/fastapi-greetings/TASK-ID --region region-aws
```

### Comandos de gestión ECS

```bash
# Actualizar service con nueva imagen
aws ecs update-service --cluster cluster-name --service fastapi-greetings-service --force-new-deployment --region region-aws

# Escalar service
aws ecs update-service --cluster cluster-name --service fastapi-greetings-service --desired-count 2 --region region-aws

# Parar service
aws ecs update-service --cluster cluster-name --service fastapi-greetings-service --desired-count 0 --region region-aws

# Eliminar service
aws ecs delete-service --cluster cluster-name --service fastapi-greetings-service --force --region region-aws
```

### Documentación automática

FastAPI genera documentación automática:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Endpoints Disponibles

### GET /greetings

Devuelve un saludo general.

**Ejemplo de solicitud:**

```bash
curl -X GET "http://localhost:8000/greetings"
```

**Respuesta:**

```json
{
  "message": "¡Hola! Bienvenido a nuestra API de saludos"
}
```

### POST /greetings

Devuelve un saludo personalizado.

**Cuerpo de la solicitud:**

```json
{
  "nombre": "tu_nombre"
}
```

**Ejemplo de solicitud:**

```bash
curl -X POST "http://localhost:8000/greetings" \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Juan"}'
```

**Respuesta:**

```json
{
  "message": "Hello, Juan"
}
```

## Frontend React

### Desarrollo Local del Frontend

#### 1. Navegar al directorio del frontend

```bash
cd frontend
```

#### 2. Instalar dependencias

```bash
npm install
```

#### 3. Configurar variables de entorno

El frontend usa un archivo `.env` para configurar la URL del backend:

```bash
# Contenido del archivo frontend/.env
REACT_APP_API_URL=http://localhost:8000
```

#### 4. Ejecutar el frontend en desarrollo

```bash
npm start
```

El frontend estará disponible en: `http://localhost:3000`

### Docker para Frontend

#### 1. Construir la imagen Docker del frontend

```bash
# Desde el directorio frontend/
# Con URL por defecto (localhost:8000)
docker build -t react-frontend .

# Con URL personalizada del backend
docker build --build-arg REACT_APP_API_URL=http://host.docker.internal:8000 -t react-frontend .

# Para usar con backend en otro servidor
docker build --build-arg REACT_APP_API_URL=https://tu-backend-url.com -t react-frontend .
```

#### 2. Ejecutar el contenedor del frontend

```bash
# Ejecutar en primer plano
docker run -p 3000:80 react-frontend

# Ejecutar en segundo plano
docker run -d -p 3000:80 --name react-frontend-container react-frontend
```

**Nota importante:** Si tu backend FastAPI está corriendo en localhost:8000 en tu máquina host, usa `host.docker.internal:8000` como URL del backend al construir la imagen Docker:

El frontend estará disponible en: `http://localhost:3000`

### Configuración de Producción

Para producción, asegúrate de actualizar la variable de entorno `REACT_APP_API_URL` en el archivo `.env` con la URL correcta de tu backend:

```bash
# Para producción
REACT_APP_API_URL=https://tu-backend-url.com
```

### Características del Frontend

- **Interfaz simple**: Título "Hello POC"
- **Botón GET**: Llama al endpoint `/greetings` y muestra la respuesta
- **Formulario POST**: Campo de entrada con validación y botón de envío
- **Validación**: El botón de envío solo se activa cuando hay texto en el input
- **Respuestas en pantalla**: Muestra las respuestas de ambos endpoints
- **Diseño responsive**: Formulario con input y botón alineados horizontalmente

## Estructura del Proyecto

```
poc_ecs/
├── main.py                    # Aplicación principal de FastAPI
├── requirements.txt           # Dependencias del proyecto Python
├── Dockerfile                 # Configuración Docker para backend
├── .dockerignore             # Archivos excluidos de Docker (backend)
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── App.js            # Componente principal React
│   │   ├── App.css           # Estilos del frontend
│   │   └── ...               # Otros archivos React
│   ├── package.json          # Dependencias del frontend
│   ├── Dockerfile            # Configuración Docker para frontend
│   ├── .dockerignore         # Archivos excluidos de Docker (frontend)
│   └── .env                  # Variables de entorno del frontend
└── README.md                 # Este archivo
```

## Comandos Útiles

### Desarrollo Local

```bash
# Desactivar el entorno virtual
deactivate

# Instalar nuevas dependencias y actualizar requirements.txt
pip freeze > requirements.txt

# Ejecutar con configuración personalizada
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### Docker

```bash
# Ver contenedores en ejecución
docker ps

# Parar un contenedor
docker stop greetings-api

# Eliminar un contenedor
docker rm greetings-api

# Ver logs del contenedor
docker logs greetings-api

# Reconstruir la imagen después de cambios
docker build -t fastapi-greetings . --no-cache
```
