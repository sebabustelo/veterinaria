# Instrucciones para Optimizar Iconos PWA

## Problema
El icono de la huella desborda cuando se instala la PWA en el celular.

## Solución
Necesitas crear versiones optimizadas de los iconos con la huella más pequeña (75% del tamaño original) para que quepa bien dentro del área del icono.

## Opción 1: Usar la Herramienta HTML (Recomendado)

1. Abre el archivo `public/img/create-pwa-icons.html` en tu navegador
2. Haz clic en "Seleccionar archivo" y elige tu `icon.png` o `icon2.png`
3. La herramienta generará automáticamente versiones optimizadas
4. Haz clic en "Descargar 192x192" y "Descargar 512x512"
5. Guarda los archivos descargados como:
   - `public/img/icon-pwa-192.png`
   - `public/img/icon-pwa-512.png`

## Opción 2: Usar un Editor de Imágenes (Photoshop, GIMP, etc.)

1. Abre tu icono original (`icon.png` o `icon2.png`)
2. Crea un nuevo canvas del tamaño deseado (192x192 o 512x512)
3. Coloca un fondo sólido del color `#3d407d`
4. Redimensiona tu icono original al **75%** del tamaño del canvas
5. Centra la imagen en el canvas (debe haber un 12.5% de padding en cada lado)
6. Exporta como PNG con el nombre:
   - `icon-pwa-192.png` (para 192x192)
   - `icon-pwa-512.png` (para 512x512)

## Opción 3: Usar una Herramienta Online

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube tu icono
3. Selecciona "Maskable" y ajusta el padding al 20%
4. Descarga los iconos generados
5. Renómbralos como `icon-pwa-192.png` e `icon-pwa-512.png`
6. Colócalos en `public/img/`

## Verificación

Después de crear los iconos:

1. Verifica que los archivos existan:
   - `public/img/icon-pwa-192.png`
   - `public/img/icon-pwa-512.png`

2. Abre DevTools > Application > Manifest
3. Verifica que los iconos maskable se muestren correctamente
4. Prueba instalando la PWA nuevamente

## Nota Importante

Los iconos "maskable" deben tener un área segura donde el contenido importante (la huella) esté dentro del 80% central del icono. Esto asegura que cuando el sistema operativo aplique máscaras redondeadas, el contenido no se corte.

