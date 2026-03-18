# Pasos para resolver el error CORS cacheado

## El Problema
El navegador tiene CORS cacheado de `http://localhost:8082` pero ahora estás en `http://localhost:8083`.

## Solución (ejecuta en orden):

### Opción 1: Limpiar caché completo del navegador
1. Abre Chrome DevTools (F12)
2. Click **derecho** en el botón de refresh
3. Selecciona **"Empty Cache and Hard Reload"**
4. Cierra completamente Chrome (todas las ventanas)
5. Vuelve a abrir Chrome y navega a `http://localhost:8083`

### Opción 2: Usar ventana de incógnito
1. Ctrl+Shift+N para abrir ventana de incógnito
2. Navega a `http://localhost:8083`
3. Esto evita completamente el caché

### Opción 3: Cambiar puerto en Supabase (si las opciones anteriores no funcionan)
1. Ve a Supabase Dashboard → Settings → API
2. En "Allowed CORS Origins", cambia `http://localhost:8082` a `http://localhost:8083`
3. O mejor aún, agrega ambos separados por coma: `http://localhost:8082,http://localhost:8083`

## Verificación
Después de limpiar el caché, deberías ver en la consola:
```
[ScaleRunner] Questions count: [número > 0]
```

En lugar de:
```
[ScaleRunner] Questions count: 0
```
