# Lilac

Lilac es una aplicación de escritorio minimalista para organizar notas de texto mediante carpetas y subcarpetas. Está diseñada para ser sencilla, rápida y funcionar localmente, sin depender de una conexión a Internet.

## Características

- Crear, renombrar y eliminar carpetas y subcarpetas.
- Crear, editar, renombrar y eliminar notas de texto.
- Buscar carpetas y notas por nombre.
- Guardado automático y persistencia local del contenido.
- Tema claro con una interfaz blanca y detalles en morado suave.
- Modo oscuro.
- Distribución portable para Windows, con la aplicación y sus datos en una misma carpeta.

## Tecnologías

- **React** y **TypeScript** — interfaz y lógica de la aplicación.
- **Electron** — ejecución como aplicación de escritorio.
- **Vite** — desarrollo y compilación.
- **electron-builder** — empaquetado para Windows.

## Cómo funciona

Lilac organiza las notas dentro de una estructura de carpetas y subcarpetas. El panel lateral permite navegar y buscar contenido; el área central muestra y permite editar las notas de la carpeta seleccionada.

Los datos se almacenan localmente dentro de la carpeta portable de Lilac, separados del proceso de distribución inicial. Así, la aplicación puede utilizarse sin conexión y la carpeta puede trasladarse manteniendo juntos sus archivos.

## Requisitos

- Node.js y npm instalados.
- Windows para generar y probar el artefacto portable de Windows.

## Desarrollo local

Instala las dependencias:

```bash
npm install
```

Inicia la aplicación en modo desarrollo:

```bash
npm run dev
```

## Verificación y compilación

Verifica que la compilación se completa correctamente:

```bash
npm run build
```

**Estado de verificación:** `npm run build` se ha ejecutado correctamente.

## Generar la distribución portable para Windows

Ejecuta:

```bash
npm run package:win
```

Este comando genera el artefacto portable de Windows según la configuración del proyecto. El paquete está pensado para preparar una carpeta que incluya el ejecutable de Lilac y los archivos necesarios para ejecutarla.

## Notas

- Mantén juntos el ejecutable y los datos de la carpeta portable.
- Antes de actualizar o reemplazar archivos del paquete, realiza una copia de seguridad de las notas.
- No incluyas credenciales ni datos sensibles en el repositorio.
