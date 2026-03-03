# Visor Multiradar - GTHC UTPL

Aplicacion web para la visualizacion en tiempo real de datos de radares meteorologicos (GUAXX y LOXX) operados por el Grupo de Trabajo en Hidrometeorologia y Clima (GTHC) de la Universidad Tecnica Particular de Loja.

**Acceso:** [https://clima.utpl.edu.ec](https://clima.utpl.edu.ec)

## Funcionalidades

### Visualizacion en tiempo real
- Superposicion de imagenes radar sobre mapa interactivo
- Auto-actualizacion automatica de datos cada 3 minutos
- Soporte para dos radares simultaneos (GUAXX - Celica, LOXX - Loja)
- Control de visibilidad y opacidad por radar

### Animacion temporal
- Reproduccion animada de secuencias radar con periodos configurables (1h, 2h, 4h)
- Control de velocidad de reproduccion (0.5x, 1x, 2x, 4x)
- Timeline interactivo con slider y controles de navegacion (play, pause, avance, retroceso)
- Modo en vivo con auto-actualizacion de frames sin interrumpir la reproduccion
- Navegacion a fechas historicas con selector de fecha personalizada
- Boton "En vivo" para retornar al modo tiempo real
- Precarga inteligente de imagenes con cache LRU
- Atajos de teclado (espacio, flechas, Home, End)

### Mapa interactivo
- Basado en Leaflet con multiples capas base (OpenStreetMap, CartoDB Dark, CartoDB Positron)
- Marcadores de ubicacion de radares con circulos de cobertura
- Geolocalizacion del usuario
- Leyenda de reflectividad (dBZ) con escala de colores

### Interfaz adaptativa
- Diseno responsive para escritorio y movil
- Panel lateral de configuracion
- Botones flotantes (FABs) con comportamiento adaptativo segun contexto
- Sistema de notificaciones toast
- Overlay de carga con indicador de progreso

## Stack tecnologico

| Categoria | Herramienta |
|-----------|-------------|
| Framework | [React 19](https://react.dev/) |
| Build tool | [Vite 7](https://vite.dev/) |
| Estado global | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| Mapas | [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com/) |
| Linting | [ESLint 9](https://eslint.org/) |

## Estructura del proyecto

```
src/
├── main.jsx                    # Punto de entrada
├── App.jsx                     # Componente raiz y auto-refresh
├── index.css                   # Estilos globales y Tailwind
├── components/
│   ├── AnimationBar/           # Panel de animacion y timeline
│   ├── ColorLegend/            # Leyenda de reflectividad dBZ
│   ├── FABs/                   # Botones flotantes de accion
│   ├── Header/                 # Barra superior
│   ├── Map/                    # Vista de mapa y overlays radar
│   ├── Sidebar/                # Panel lateral de configuracion
│   └── common/                 # Componentes reutilizables (Loading, Toast)
├── config/
│   └── radars.js               # Configuracion de radares, animacion y capas
├── hooks/                      # Hooks personalizados (animacion, datos, geolocalizacion)
├── services/                   # Servicios de datos y cache de imagenes
├── store/
│   └── useStore.js             # Estado global con Zustand
└── utils/
    └── julianDate.js           # Utilidades de fechas y dias julianos
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de produccion
npm run build

# Preview del build
npm run preview
```

## Variables de entorno

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | URL base para los datos radar | `''` (mismo origen) |
