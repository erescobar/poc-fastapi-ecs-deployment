# Proyecto FastAPI - API de Saludos

Este proyecto implementa una API REST simple usando FastAPI con dos endpoints para saludos.

## Prerrequisitos

### Opción 1: Desarrollo Local
- Python 3.7 o superior
- pip (gestor de paquetes de Python)

### Opción 2: Docker
- Docker instalado en tu sistema

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