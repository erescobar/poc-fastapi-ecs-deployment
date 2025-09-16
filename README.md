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

## Estructura del Proyecto

```
poc_ecs/
├── main.py           # Aplicación principal de FastAPI
├── requirements.txt  # Dependencias del proyecto
├── Dockerfile        # Configuración Docker
├── .dockerignore     # Archivos excluidos de Docker
└── README.md         # Este archivo
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
