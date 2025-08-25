# Arquitectura del Sistema de Inventario

## Screaming Architecture

Este proyecto utiliza **Screaming Architecture**, donde la estructura del código "grita" cuál es su propósito de negocio. En lugar de organizar por capas técnicas (components, services, utils), organizamos por características de negocio.

## Estructura del Proyecto

```
src/
├── features/                    # Características de negocio (¡El corazón del proyecto!)
│   ├── auth/                   # 🔐 Autenticación y autorización
│   │   ├── components/         # LoginForm
│   │   ├── types/             # User, LoginCredentials
│   │   └── hooks/             # useAuth (si fuera necesario)
│   │
│   ├── inventory/             # 📦 Gestión de inventario y productos
│   │   ├── components/        # ProductTable
│   │   ├── types/            # Product
│   │   ├── data/             # mockData
│   │   └── hooks/            # hooks específicos de inventario
│   │
│   ├── movements/             # 📈 Movimientos de entrada y salida
│   │   ├── components/        # MovementTable, AddMovementForm
│   │   ├── types/            # MovementEntry, MovementExit
│   │   └── hooks/            # hooks de movimientos
│   │
│   ├── equipment/             # 🔧 Gestión de equipos y herramientas
│   │   ├── components/        # EquipmentTable, AddEquipmentForm
│   │   ├── types/            # EquipmentReport
│   │   └── hooks/            # hooks de equipos
│   │
│   └── reports/               # 📊 Generación de reportes
│       ├── components/        # (futuro: ReportGenerator)
│       └── utils/            # pdfGenerator
│
├── shared/                     # Código compartido entre features
│   ├── components/            # Header, DashboardTabs, StockIndicator
│   ├── types/                # TabType, re-exports de tipos
│   ├── hooks/                # useAuth (context global)
│   ├── utils/                # utilidades generales
│   └── constants/            # constantes globales
│
├── pages/                     # Páginas de la SPA
│   ├── LoginPage.tsx         # Página de login
│   ├── DashboardPage.tsx     # Layout principal del dashboard
│   ├── InventoryPage.tsx     # Página de inventario
│   ├── MovementsPage.tsx     # Página de movimientos
│   └── EquipmentPage.tsx     # Página de equipos
│
├── router/                    # Configuración de routing
│   ├── index.tsx             # Configuración principal del router
│   └── ProtectedRoute.tsx    # Componente de rutas protegidas
│
├── App.tsx                   # Componente principal
├── main.tsx                  # Punto de entrada
└── index.css                # Estilos globales
```

## Principios de la Screaming Architecture

### 1. **Organización por Dominio de Negocio**
- `features/auth/` - Todo lo relacionado con autenticación
- `features/inventory/` - Todo lo relacionado con productos e inventario
- `features/movements/` - Todo lo relacionado con entradas y salidas
- `features/equipment/` - Todo lo relacionado con equipos y herramientas
- `features/reports/` - Todo lo relacionado con reportes

### 2. **Cohesión Alta, Acoplamiento Bajo**
- Cada feature es independiente y contiene todo lo necesario
- Los componentes compartidos están en `shared/`
- Las dependencias entre features son mínimas

### 3. **Fácil Navegación**
- ¿Necesitas modificar algo de inventario? → `features/inventory/`
- ¿Agregar un nuevo tipo de reporte? → `features/reports/`
- ¿Cambiar la autenticación? → `features/auth/`

### 4. **Escalabilidad**
- Agregar una nueva feature es simple: crear nueva carpeta en `features/`
- Cada feature puede tener su propia estructura interna
- Fácil de dividir en microservicios si fuera necesario

## Configuración SPA (Single Page Application)

### Router
- **React Router Dom** para navegación del lado del cliente
- Rutas protegidas con `ProtectedRoute`
- Historia del navegador manejada automáticamente

### Rutas Principales
- `/` - Redirección al login
- `/login` - Página de autenticación
- `/dashboard` - Layout principal con sub-rutas:
  - `/dashboard/inventory` - Gestión de inventario
  - `/dashboard/movements` - Entradas y salidas
  - `/dashboard/equipment` - Gestión de equipos

### Beneficios de la SPA
- ✅ Navegación rápida sin recargas de página
- ✅ Estado persistente entre páginas
- ✅ Mejor experiencia de usuario
- ✅ Funciona como aplicación nativa
- ✅ SEO-friendly con configuración correcta

## Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **React Router Dom** - Routing SPA
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconografía
- **jsPDF** - Generación de PDFs
- **Vite** - Bundler y dev server

## Comandos

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Ventajas de esta Arquitectura

1. **Claridad**: La estructura grita "Sistema de Inventario"
2. **Mantenibilidad**: Cada feature es independiente
3. **Escalabilidad**: Fácil agregar nuevas características
4. **Testabilidad**: Cada feature se puede testear aisladamente
5. **Onboarding**: Nuevos desarrolladores entienden rápidamente el proyecto
6. **Refactoring**: Cambios localizados, menor riesgo
