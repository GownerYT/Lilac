# Lilac — Requisitos de la aplicación

## 1. Objetivo

**Lilac** es una aplicación de escritorio minimalista para organizar notas de texto mediante carpetas y subcarpetas. Debe ser sencilla, rápida y funcionar sin conexión a Internet.

## 2. Tecnologías

- **React** para la interfaz.
- **TypeScript** para el desarrollo tipado.
- **Electron** para ejecutar la aplicación como programa de escritorio.
- **Vite** para el entorno de desarrollo y la compilación de la interfaz.
- **electron-builder** u otra herramienta equivalente para generar la distribución de Windows.

## 3. Interfaz y diseño

- Diseño limpio, minimalista y fácil de utilizar.
- Tema claro por defecto, con fondo principalmente blanco.
- Menú superior y panel lateral izquierdo en tonos morados suaves.
- Modo oscuro seleccionable desde la interfaz.
- Distribución principal en dos zonas:
  - **Panel izquierdo:** árbol de carpetas y subcarpetas, con búsqueda.
  - **Panel central:** lista de notas de la carpeta seleccionada y editor de texto.
- Interfaz adaptable al tamaño de la ventana.

## 4. Funcionalidades esenciales

- Crear, renombrar y eliminar carpetas y subcarpetas.
- Crear, editar, renombrar y eliminar notas de texto.
- Mostrar las notas asociadas a la carpeta seleccionada.
- Buscar carpetas y notas por su nombre.
- Guardar los cambios automáticamente.
- Conservar carpetas y notas al cerrar y volver a abrir la aplicación.
- Mostrar una confirmación antes de eliminar carpetas o notas.
- Recordar la preferencia de tema claro u oscuro.

## 5. Almacenamiento de datos

- Todos los datos creados por el usuario deben almacenarse localmente dentro de la carpeta portable de Lilac.
- La estructura de carpetas, las notas y los archivos de configuración necesarios deben mantenerse junto al ejecutable, dentro de la misma carpeta de distribución.
- Los datos deben seguir disponibles al cerrar y volver a abrir la aplicación.
- La aplicación no debe depender de servidores ni de una conexión a Internet.
- Al actualizar o sustituir el ejecutable, se debe evitar la pérdida de los datos existentes.

## 6. Distribución portable para Windows

La distribución debe consistir en una **carpeta portable autocontenida**, no en una instalación convencional de Windows.

- El usuario descargará y ejecutará un único archivo `.exe` de distribución.
- Ese ejecutable permitirá elegir la ubicación de destino y preparará allí una carpeta portable de Lilac.
- Dentro de esa carpeta estarán el ejecutable principal de la aplicación, los archivos necesarios para ejecutarla y todos los datos creados por el usuario.
- Una vez preparada la carpeta, el usuario iniciará Lilac ejecutando el `.exe` principal desde ella.
- La aplicación no debe requerir un instalador tradicional, registrar la aplicación en el sistema ni depender de archivos de datos guardados en otras ubicaciones.
- La carpeta portable debe poder trasladarse a otra ubicación del dispositivo conservando sus datos, siempre que se mantengan juntos todos sus archivos.
- El proceso de distribución debe comprobar que la carpeta de destino es válida y no sobrescribir datos existentes sin avisar.

**Aclaración:** el `.exe` inicial funciona como herramienta para preparar o extraer la carpeta portable; no instala Lilac como una aplicación convencional. El resultado final será una carpeta autocontenida. Para mantener los datos junto al programa, la aplicación deberá guardar sus archivos en una ubicación de datos dentro de esa carpeta y gestionar correctamente los permisos de escritura.

## 7. Seguridad y fiabilidad

- Gestionar el acceso al sistema de archivos mediante las API seguras de Electron.
- No exponer acceso directo a Node.js desde la interfaz de React.
- Guardar automáticamente el contenido y minimizar el riesgo de perder cambios.
- Pedir confirmación antes de eliminar contenido.
- Evitar sobrescribir datos existentes durante la preparación o actualización de la carpeta portable.

## 8. Alcance inicial

La primera versión debe centrarse en las funciones descritas. No se requieren inicialmente cuentas de usuario, sincronización en la nube, colaboración, etiquetas, complementos ni funciones avanzadas de edición.

## 9. Criterios de aceptación

- Lilac se puede preparar desde el ejecutable de distribución, eligiendo una ubicación para la carpeta portable.
- La carpeta resultante contiene el ejecutable de Lilac y todos los archivos necesarios.
- Las carpetas, notas y configuraciones se guardan dentro de la carpeta portable.
- Se pueden crear, editar, renombrar, buscar y eliminar carpetas y notas.
- El contenido se conserva al cerrar y volver a abrir la aplicación.
- El modo claro y el modo oscuro funcionan correctamente.
- La carpeta portable se puede mover sin perder los datos, siempre que se mantenga su estructura interna.
- La interfaz respeta el diseño minimalista y la paleta de colores especificada.
