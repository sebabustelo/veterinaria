# Configuración PWA - Vettix

La aplicación Vettix está configurada como Progressive Web App (PWA) y puede ser instalada en dispositivos móviles y de escritorio.

## Características PWA Implementadas

✅ **Manifest.json** - Configuración de la aplicación  
✅ **Service Worker** - Funcionalidad offline y caché  
✅ **Botón de instalación** - Promoción de instalación  
✅ **Iconos** - Iconos para diferentes tamaños  
✅ **Meta tags** - Configuración para iOS y Android  

## Cómo Probar la Instalación

### En Chrome/Edge (Desktop)

1. Ejecuta la aplicación en modo desarrollo o producción
2. Abre las DevTools (F12)
3. Ve a la pestaña "Application" o "Aplicación"
4. En el panel izquierdo, verifica:
   - **Manifest**: Debe mostrar la información de la PWA
   - **Service Workers**: Debe mostrar el service worker registrado
5. En la barra de direcciones, verás un icono de instalación (+ o 📥)
6. Haz clic para instalar la aplicación

### En Chrome/Edge (Mobile)

1. Abre la aplicación en el navegador móvil
2. Aparecerá un banner en la parte inferior sugiriendo instalar
3. O ve al menú del navegador (⋮) y selecciona "Instalar aplicación"

### En Safari (iOS)

1. Abre la aplicación en Safari
2. Toca el botón de compartir (cuadrado con flecha)
3. Selecciona "Añadir a pantalla de inicio"
4. La aplicación aparecerá como un icono en la pantalla de inicio

### Simular Instalación en DevTools

1. Abre DevTools (F12)
2. Ve a "Application" > "Manifest"
3. Haz clic en "Add to homescreen" para simular la instalación
4. O usa el botón flotante "Instalar App" que aparece automáticamente

## Verificar Funcionamiento

### Service Worker
- Abre DevTools > Application > Service Workers
- Debe mostrar "activated and is running"
- Puedes forzar actualización con "Update"

### Manifest
- DevTools > Application > Manifest
- Verifica que todos los campos estén correctos
- Los iconos deben cargarse correctamente

### Funcionalidad Offline
1. Abre DevTools > Network
2. Activa "Offline"
3. Recarga la página
4. La aplicación debe seguir funcionando con recursos cacheados

## Archivos Creados

- `/public/manifest.json` - Configuración de la PWA
- `/public/service-worker.js` - Service Worker para caché
- `/src/utils/registerServiceWorker.js` - Registro del SW
- `/src/components/PWAInstallButton.jsx` - Botón de instalación
- `/src/components/PWAInstallButton.css` - Estilos del botón

## Personalización

### Cambiar Iconos
Reemplaza los archivos en `/public/img/`:
- `icon.png` (192x192px)
- `icon2.png` (512x512px)

### Actualizar Manifest
Edita `/public/manifest.json` para cambiar:
- Nombre de la aplicación
- Colores del tema
- Descripción
- Shortcuts

### Modificar Service Worker
Edita `/public/service-worker.js` para:
- Agregar más recursos al caché
- Cambiar la estrategia de caché
- Agregar notificaciones push

## Notas

- La PWA solo funciona en HTTPS (o localhost en desarrollo)
- El service worker se actualiza automáticamente cada hora
- El botón de instalación solo aparece cuando la PWA es instalable
- Una vez instalada, la app funciona como una aplicación nativa

