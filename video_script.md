# Guion de Demo — Solicitud Pinterest API
## GuiaDelSalon.com · Herramienta de Pines con aprobacion humana
### Duracion total: ~60 segundos

---

## [0:00-0:15] Mostrar contenido editorial de calidad

**Accion:** Abrir navegador en `https://guiadelsalon.com/color-match`
(cualquier articulo de +1000 palabras del sitio)

**Lo que debe verse:**
- URL visible en la barra del navegador: guiadelsalon.com
- Articulo completo en pantalla (scroll breve para mostrar longitud)

**Voz / texto en pantalla:**
> "GuiaDelSalon.com publica articulos editoriales sobre cuidado capilar profesional.
> Esta herramienta nos permite compartir ese contenido en Pinterest,
> siempre enlazando al articulo original."

---

## [0:15-0:30] Ejecutar flujo OAuth

**Accion (en terminal):**
```
npm run pinterest:auth
```

**Lo que debe verse en pantalla:**
1. Timestamp + URL de autorizacion de Pinterest en consola
2. El navegador se abre automaticamente con la pagina de login de Pinterest
3. Login → clic en "Autorizar" → ventana muestra "Autorizacion recibida. Puedes cerrar esta ventana."
4. En consola: `=== PASO 2 ===` → `=== PASO 3 ===` → `=== PASO 4 ===` → `=== PASO 5: Tokens guardados ===`

**Voz:**
> "El script abre automaticamente Pinterest para autorizar la app.
> Los tokens se guardan localmente en .env.scripts — nunca en ningun servidor."

---

## [0:30-0:45] Generar y aprobar manualmente un Pin

**Accion (en terminal):**
```
npm run pinterest:publish
```

**Lo que debe verse en pantalla:**

```
[timestamp] === Inicio sesion de publicacion | Pines hoy: 0/5 ===

+------------------------------------------------------+
| PIN #1 de 1                                          |
+------------------------------------------------------+
| Titulo:      Que es el Color Match Capilar y como  |
| Descripcion: Descubre como el analisis de color ca |
| URL destino: https://guiadelsalon.com/color-match  |
| Tablero:     1133218393678035986                   |
| Imagen:      https://guiadelsalon.com/og-color-mat |
+------------------------------------------------------+

Publicar este Pin? (s/n/editar):
```

Escribir `s` + Enter → consola muestra `Pin publicado con ID: [ID real]`

**Voz:**
> "Antes de publicar cualquier Pin, la herramienta muestra una previsualizacion completa
> y requiere mi aprobacion explicita. Sin mi confirmacion, no se publica nada."

---

## [0:45-1:00] Mostrar el Pin publicado en Pinterest

**Acciones:**
1. Abrir `https://www.pinterest.com/[tu_usuario]/[tu_tablero]/`
2. El nuevo Pin aparece en la primera posicion
3. Clic en el Pin → URL destino → se abre el articulo de GuiaDelSalon.com

**Voz:**
> "El Pin enlaza directamente al articulo editorial original.
> Cada publicacion queda registrada en pin_log.json con timestamp y decision tomada."

**Bonus (si el tiempo lo permite):**
- Mostrar `http://localhost:3001` (demo server activo con `npm run pinterest:demo`)
- El ultimo Pin publicado aparece automaticamente en la interfaz

---

## Notas tecnicas para la grabacion

| Ajuste | Valor recomendado |
|---|---|
| Resolucion | 1920×1080 |
| Zoom navegador | 125% |
| Fuente terminal | >= 14pt, fondo oscuro |
| Notificaciones SO | Silenciar antes de grabar |
| Numero de tomas | 1 toma continua — muestra autenticidad |

---

## Descripcion para el formulario de solicitud de API

> "Herramienta de programacion de Pines con aprobacion humana para contenido editorial de GuiaDelSalon.com.
> Permite publicar Pines que enlazan a articulos originales del sitio, con revision y confirmacion manual
> obligatoria antes de cada publicacion. Maximo 5 Pines por dia. Los tokens OAuth se almacenan
> localmente en el dispositivo del operador."
