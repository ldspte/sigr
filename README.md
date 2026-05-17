# Sistema Integral de Gestión de Restaurante (SIGR)

Aplicación web para gestionar pedidos, reservas, administración de menús, control de caja y generación de reportes de un restaurante. Este repositorio representa la **Línea Base** del proyecto.

## Requisitos Previos
- Node.js (v18 o superior)
- MySQL (v8.0 o superior)
- Git

## Instrucciones de Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/ldspte/sigr.git
cd sigr
```

### 2. Configurar la Base de Datos
1. Abre tu gestor de MySQL (ej. MySQL Workbench).
2. Ejecuta el script SQL ubicado en `back/database/schema.sql` para crear la base de datos `sigr_db` y sus tablas.

### 3. Configurar el Backend
```bash
cd back
npm install
```
- Verifica que el archivo `.env` en la carpeta `back` contenga tus credenciales locales de MySQL:
  ```env
  PORT=3000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=tu_contraseña
  DB_NAME=sigr_db
  ```
- Inicia el servidor:
```bash
npm run dev
```
El backend correrá en `http://localhost:3000`.

### 4. Configurar el Frontend
Abre una **nueva terminal** y ejecuta:
```bash
cd front
npm install
npm run dev
```
El frontend correrá en `http://localhost:5173`. Abre este enlace en tu navegador.

## Credenciales de Prueba
Para probar todas las funciones, regístrate en la aplicación. Para acceder a funciones especiales, cambia manualmente tu `rol` a `mesero` o `administrador` en la tabla `usuarios` de MySQL.
