# 🔗 Guía de Integración API-Frontend

## ✅ Integración Completada

La integración entre la API (NestJS) y el frontend (React) ha sido completada exitosamente. Los datos mock han sido reemplazados por llamadas reales a la API.

## 🏗️ **Arquitectura de la Integración**

### **Servicios API (`src/shared/services/`)**
- `api.ts` - Cliente HTTP base con manejo de autenticación JWT
- `auth.service.ts` - Autenticación y gestión de usuarios
- `inventory.service.ts` - Gestión de productos e inventario
- `movements.service.ts` - Movimientos de entrada y salida
- `equipment.service.ts` - Gestión de equipos y herramientas

### **Hooks Personalizados (`src/features/*/hooks/`)**
- `useInventory.ts` - Estado y operaciones de inventario
- `useMovements.ts` - Estado y operaciones de movimientos
- `useEquipment.ts` - Estado y operaciones de equipos

### **Componentes Actualizados**
- ✅ **ProductTable** - Manejo de estados de carga y errores
- ✅ **MovementTable** - Integración con API real
- ✅ **EquipmentTable** - Operaciones CRUD completas
- ✅ **ProtectedRoute** - Verificación de autenticación con loading

## 🚀 **Cómo Iniciar el Sistema Completo**

### **1. Iniciar la API (Backend)**
```bash
cd ayni-almacen-api

# Verificar que la base de datos esté configurada
npm run db:generate
npm run db:push
npm run db:seed

# Iniciar en modo desarrollo
npm run start:dev
```
**API disponible en:** http://localhost:3000

### **2. Iniciar el Frontend**
```bash
cd project

# Instalar dependencias (si es necesario)
npm install

# Iniciar en modo desarrollo
npm run dev
```
**Frontend disponible en:** http://localhost:5173

## 🔐 **Autenticación**

### **Credenciales por defecto:**
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### **Flujo de autenticación:**
1. Login → JWT token almacenado en localStorage
2. Token enviado automáticamente en todas las requests
3. Verificación automática al iniciar la aplicación
4. Logout → Token removido del localStorage

## 📊 **Funcionalidades Integradas**

### **✅ Inventario**
- Listar productos con búsqueda en tiempo real
- Crear, actualizar y eliminar productos
- Estados de carga y manejo de errores
- Indicadores de stock bajo

### **✅ Movimientos**
- Entradas y salidas de inventario
- Creación de movimientos
- Actualización de cantidades en salidas
- Actualización automática de stock

### **✅ Equipos**
- Gestión de reportes de equipos
- Control de salida y retorno
- Estados de equipos (Bueno, Regular, Malo, etc.)
- Firmas digitales

### **✅ Reportes**
- Generación de PDFs con datos reales
- Reportes de salidas integrados

## 🔧 **Configuración API**

### **URL Base de la API:**
```typescript
// src/shared/services/api.ts
const API_BASE_URL = 'http://localhost:3000';
```

### **Endpoints principales:**
- `POST /auth/login` - Autenticación
- `GET /inventory/products` - Listar productos
- `POST /inventory/products` - Crear producto
- `GET /movements/entries` - Listar entradas
- `POST /movements/entries` - Crear entrada
- `GET /movements/exits` - Listar salidas
- `POST /movements/exits` - Crear salida
- `GET /equipment` - Listar equipos
- `POST /equipment` - Crear reporte de equipo

## 🛠️ **Estados de Carga y Errores**

### **Estados manejados:**
- ⏳ **Loading** - Spinners durante las operaciones
- ❌ **Error** - Mensajes de error con botón de reintento
- ✅ **Success** - Actualizaciones automáticas de listas
- 🔄 **Refetch** - Actualización manual de datos

### **Ejemplo de manejo de errores:**
```typescript
if (error) {
  return (
    <div className="text-center p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={refetch}>Reintentar</button>
    </div>
  );
}
```

## 📱 **Experiencia de Usuario**

### **Mejoras implementadas:**
- **Búsqueda en tiempo real** con debounce (300ms)
- **Estados de carga** con spinners elegantes
- **Manejo de errores** con mensajes claros
- **Persistencia de sesión** - No necesitas volver a loguearte
- **Actualizaciones automáticas** después de operaciones CRUD

## 🚨 **Troubleshooting**

### **Problema: "Failed to fetch"**
- ✅ Verificar que la API esté ejecutándose en puerto 3000
- ✅ Verificar configuración de CORS en la API
- ✅ Revisar que la base de datos esté conectada

### **Problema: "Unauthorized"**
- ✅ Verificar credenciales de login
- ✅ Limpiar localStorage y volver a autenticarse
- ✅ Verificar que el token JWT no haya expirado

### **Problema: "Network Error"**
- ✅ Verificar conectividad de red
- ✅ Verificar que ambos servidores estén funcionando
- ✅ Revisar configuración de firewall

## 🎉 **¡Sistema Listo!**

La integración está completa y el sistema de inventario AYNI es completamente funcional:

1. **Backend robusto** con NestJS + PostgreSQL + Prisma
2. **Frontend moderno** con React + TypeScript + Tailwind
3. **Autenticación JWT** implementada
4. **Estados de carga** y manejo de errores
5. **CRUD completo** para todas las entidades
6. **Reportes PDF** con datos reales

**El sistema está listo para producción** y puede ser desplegado en cualquier entorno.

## 📚 **Documentación Adicional**

- **API Docs**: http://localhost:3000/api (Swagger)
- **Arquitectura Frontend**: `project/ARCHITECTURE.md`
- **Setup API**: `ayni-almacen-api/SETUP.md`
