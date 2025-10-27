# AsyncSelect - Componente Select Personalizado para React

Componente reutilizable con búsqueda integrada que carga datos desde el backend.

## Características

✅ Carga asíncrona de datos  
✅ Búsqueda en tiempo real  
✅ Diseño personalizado con Tailwind  
✅ Modo oscuro incluido  
✅ Sin dependencias de jQuery/Select2  

## Uso

```tsx
import { AsyncSelect } from '@/shared';

const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);

<AsyncSelect
  endpoint="/inventory/categories"
  label="Categoría"
  placeholder="Selecciona una categoría"
  value={selectedCategory}
  onChange={(value) => setSelectedCategory(value)}
  name="categoria"
  required
/>
```

## Props

- `endpoint`: URL del endpoint backend
- `label`: Etiqueta del campo (opcional)
- `placeholder`: Texto placeholder
- `value`: Valor seleccionado (id)
- `onChange`: Función (value) => void
- `name`: Nombre del campo HTML
- `required`: Si es obligatorio
- `error`: Mensaje de error

## Endpoints del Backend

- `/inventory/categories` - Categorías
- `/inventory/locations` - Ubicaciones  
- `/providers` - Proveedores

Respuesta esperada:
```json
[
  { "id": "1", "nombre": "Categoría 1" },
  { "id": "2", "nombre": "Categoría 2" }
]
```
