# 🇨🇱 @gydunhn/rut-validator

[![npm version](https://img.shields.io/npm/v/@gydunhn/rut-validator.svg)](https://www.npmjs.com/package/@gydunhn/rut-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.39-purple.svg)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.7-pink.svg)](https://prettier.io/)

Validador de RUT chileno ligero, sin dependencias y confiable. Implementa el algoritmo Módulo 11 con precisión matemática. Este validador soporta RUTs desde aproximadamente 800.000 (casos históricos) hasta 99.999.999

## ✨ Características

- ✅ **Validación completa con algoritmo Módulo 11** - Validación matemática real, no solo regex
- 🎯 **Formatos flexibles** - Acepta `12.345.678-9`, `12345678-9`, `123456789`
- 🔢 **Cálculo automático de DV** - Genera el dígito verificador cuando lo necesites
- 🧹 **Formateo automático** - Transforma cualquier formato a `12.345.678-9`
- 🛡️ **Detección de patrones sospechosos** - Rechaza `11.111.111-1` y similares
- 📦 **Zero dependencias** - Bundle pequeño y rápido
- 🌐 **Universal** - CommonJS (dist/index.js) y ES Modules (dist/index.mjs)
- 💪 **TypeScript nativo** - Tipos incluidos out-of-the-box
- 🎯 **Soporte amplio de RUTs** - Desde 800.000 hasta 99.999.999
- 🧪 **Testing exhaustivo** - 35+ tests con 100% de cobertura
- 🎨 **Formatos configurables** - `dotdash`, `dash`, `nodash`
- 🛠️ **Linting y formateo** - ESLint y Prettier preconfigurados

## 📦 Instalación

### Uso con PNPM

**pnpm** es un gestor de paquetes rápido y eficiente, ideal para proyectos con muchas dependencias. Esta biblioteca es 100% compatible con pnpm y recomendamos su uso por sus ventajas:

- **Instalación más rápida**: pnpm reutiliza paquetes ya descargados en un almacenamiento global, ahorrando tiempo y espacio en disco.
- **Menor uso de disco**: A diferencia de npm/yarn, pnpm evita la duplicación de dependencias.
- **Instalación segura**: Usa enlaces simbólicos para mantener la integridad de las dependencias.

> **Nota:** Si ya usas npm o yarn, no hay problema. Esta biblioteca funcionará igual de bien, pero pnpm puede mejorar tu experiencia de desarrollo.

```bash
pnpm add @gydunhn/rut-validator
```

```bash
npm install @gydunhn/rut-validator
```

```bash
yarn add @gydunhn/rut-validator
```

## 🚀 Uso Rápido

### Validación

```typescript
import { validateRutFull } from '@gydunhn/rut-validator';

validateRutFull('12.345.678-5');  // true
validateRutFull('12345678-5');    // true
validateRutFull('123456785');     // true (sin formato)
validateRutFull('800.000-K');     // true (RUTs antiguos)
validateRutFull('12.345.678-9');  // false (DV incorrecto)
```

### Formateo

```typescript
import { formatRut } from '@gydunhn/rut-validator';

formatRut('123456785', 'dotdash');  // '12.345.678-5'
formatRut('123456785', 'dash');     // '12345678-5'
formatRut('123456785', 'nodash');   // '123456785'

// Calcula DV si no existe
formatRut('12345678');  // '12.345.678-5'
```

### Cálculo de Dígito Verificador

```typescript
import { calculateRutVerifier, completeRut } from '@gydunhn/rut-validator';

calculateRutVerifier('12345678');  // '5'
calculateRutVerifier('800000');    // 'K'

completeRut('12345678');           // '12.345.678-5'
completeRut('12345678', 'dash');   // '12345678-5'
```

### Limpieza y Deconstrucción

```typescript
import { cleanRut, deconstructRut } from '@gydunhn/rut-validator';

cleanRut('12.345.678-9');  // '123456789'
cleanRut('12 345 678-9');  // '123456789'

deconstructRut('12345678-9');
// { digits: '12345678', verifier: '9' }
```

### Validación Avanzada

```typescript
import { 
  validateRutDigitsOnly, 
  isDigitsValid, 
  isSuspiciousRut 
} from '@gydunhn/rut-validator';

// Solo valida formato de dígitos (sin verificar DV)
validateRutDigitsOnly('12345678');  // true
validateRutDigitsOnly('11111111');  // false (sospechoso)

// Validar longitud (6-8 dígitos)
isDigitsValid('12345678');  // true
isDigitsValid('123');       // false

// Detectar patrones repetidos
isSuspiciousRut('11111111');  // true
isSuspiciousRut('12345678');  // false
```

## 🎨 Integración con Frameworks

### Angular

```typescript
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { validateRutFull, formatRut, cleanRut } from '@gydunhn/rut-validator';

// Validador personalizado
export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!control.value) return null;
    return validateRutFull(control.value) ? null : { invalidRut: true };
  };
}

// En tu componente
export class MyComponent {
  form = this.fb.group({
    rut: ['', [Validators.required, rutValidator()]]
  });

  // Formateo en blur
  onRutBlur(): void {
    const rutValue = this.form.get('rut')?.value;
    if (rutValue) {
      const formatted = formatRut(rutValue, 'dotdash');
      this.form.patchValue({ rut: formatted }, { emitEvent: false });
    }
  }

  // Limpieza mientras escribe
  onRutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = cleanRut(input.value).slice(0, 9);
    input.value = cleaned;
    this.form.patchValue({ rut: cleaned }, { emitEvent: false });
  }
}
```

### React

```tsx
import { useState } from 'react';
import { validateRutFull, formatRut, cleanRut } from '@gydunhn/rut-validator';

function RutInput() {
  const [rut, setRut] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanRut(e.target.value).slice(0, 9);
    setRut(cleaned);
  };

  const handleBlur = () => {
    if (rut) {
      const formatted = formatRut(rut, 'dotdash');
      setRut(formatted);
      
      if (!validateRutFull(formatted)) {
        setError('RUT inválido');
      } else {
        setError('');
      }
    }
  };

  return (
    <div>
      <input
        type="text"
        value={rut}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="12.345.678-9"
        maxLength={12}
      />
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
}
```

### Vue 3

```html
<template>
  <div>
    <input
      v-model="rut"
      @input="handleInput"
      @blur="handleBlur"
      placeholder="12.345.678-9"
      maxlength="12"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { validateRutFull, formatRut, cleanRut } from '@gydunhn/rut-validator';

const rut = ref('');
const error = ref('');

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  rut.value = cleanRut(target.value).slice(0, 9);
};

const handleBlur = () => {
  if (rut.value) {
    const formatted = formatRut(rut.value, 'dotdash');
    rut.value = formatted;
    
    error.value = validateRutFull(formatted) ? '' : 'RUT inválido';
  }
};
</script>
```

## 📚 API Completa

### Tipos

```typescript
type RutFormat = 'dotdash' | 'dash' | 'nodash';
```

### Funciones

#### `validateRutFull(fullRut: string): boolean`

Valida RUT completo con DV usando algoritmo Módulo 11.

#### `formatRut(fullRut: string, format?: RutFormat): string`

Formatea RUT. Opciones: `'dotdash'` (default), `'dash'`, `'nodash'`.

#### `calculateRutVerifier(digits: string): string | null`

Calcula dígito verificador. Retorna '0'-'9' o 'K'.

#### `completeRut(digitsOnly: string, format?: RutFormat): string | null`

Agrega DV calculado y formatea el RUT.

#### `validateRutDigitsOnly(digits: string): boolean`

Valida solo dígitos (sin DV). Rechaza patrones sospechosos.

#### `isDigitsValid(digits: string): boolean`

Verifica longitud válida (6-8 dígitos).

#### `isSuspiciousRut(digits: string): boolean`

Detecta patrones repetidos (11111111, 22222222, etc).

#### `cleanRut(input: string): string`

Elimina puntos, guiones y espacios. Preserva dígitos y 'K'.

#### `deconstructRut(input: string): { digits: string; verifier: string }`

Separa dígitos y verificador.

## 🛠️ Desarrollo

### Scripts NPM

```bash
# Build del proyecto
pnpm build

# Ejecutar tests
pnpm test
pnpm test:watch      # Modo watch
pnpm test:coverage   # Con cobertura

# Linting y formateo
pnpm lint            # Verificar linting
pnpm lint:fix        # Corregir automáticamente
pnpm format          # Formatear código
pnpm format:check    # Verificar formato

# Workflow completo (CI/CD)
pnpm ci              # format:check + lint + test + build

# Publicación (prepublish)
pnpm prepublishOnly  # lint + test + build

```

### Requisitos

- Node.js 16+
- npm, yarn o pnpm (se recomienda PNPM)
- TypeScript 5.9+

### Estructura del Proyecto

```bash
src/
├── __tests__/
│   └── rut.util.test.ts    # Tests unitarios (35+ tests)
├── index.ts                # Punto de entrada
└── rut.util.ts             # Implementación principal
dist/
├── index.js               # CommonJS build
├── index.mjs              # ES Modules build
└── index.d.ts             # TypeScript definitions
```

### Testing

El proyecto incluye 35+ tests que cubren:

- ✅ Validación de RUTs correctos
- ✅ Rechazo de RUTs inválidos
- ✅ Cálculo preciso del dígito verificador
- ✅ Formateo en todos los formatos
- ✅ Manejo de edge cases
- ✅ Detección de patrones sospechosos

```bash
# Ver cobertura de tests
pnpm test:coverage
```

## 🔧 Configuración Técnica

### TypeScript

- Target: ES2020
- Strict mode habilitado
- Módulos ES
- Declaraciones automáticas

### Build

- Rollup para bundling
- Soporte para CommonJS y ES Modules
- Minificación con Terser
- Source maps incluidos

### Calidad de Código

- ESLint 9 con configuraciones recomendadas
- Prettier para formateo consistente
- EditorConfig para consistencia entre editores
- Husky para git hooks (opcional)

## 🧪 Ejemplos de Uso

### Casos Comunes

```typescript
// Caso 1: Validación de formulario
const rutInput = '12.345.678-5';
if (validateRutFull(rutInput)) {
  console.log('RUT válido');
  const formatted = formatRut(rutInput); // '12.345.678-5'
}

// Caso 2: Generación de RUT completo
const digits = '12345678';
const fullRut = completeRut(digits); // '12.345.678-5'

// Caso 3: Normalización de entrada de usuario
const userInput = ' 12.345.678-5 ';
const cleaned = cleanRut(userInput); // '123456785'
const normalized = formatRut(cleaned); // '12.345.678-5'
```

### Edge Cases Manejados

```typescript
// RUTs con K
validateRutFull('800000-K'); // true

// RUTs sin DV (calcula automáticamente)
formatRut('12345678'); // '12.345.678-5'

// RUTs con DV = 0
validateRutFull('24.965.106-0'); // true

// Entradas con espacios y múltiples formatos
cleanRut(' 12 345.678-5 '); // '123456785'
```

### Guías de Contribución

- Sigue las convenciones de código existentes
- Asegúrate que todos los tests pasen
- Actualiza la documentación si es necesario
- Agrega tests para nuevas funcionalidades

## 📝 Licencia

MIT © [Gydunhn](https://github.com/gydunhn)

## 📮 Soporte

- 📦 [npm package](https://www.npmjs.com/package/@gydunhn/rut-validator)

---

**Nota**: Este validador soporta RUTs desde aproximadamente 800.000 (casos históricos) hasta 99.999.999. El algoritmo está basado en el estándar chileno Módulo 11.
