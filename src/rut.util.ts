//src/rut.util.ts
/** Utilidades para RUT chileno - cálculo DV y validación (Módulo 11) */

// Constantes globales optimizadas
const CLEAN_REGEX = /[^0-9kK]/g;
const DIGITS_ONLY_REGEX = /^\d+$/;
const REPEATED_PATTERN_REGEX = /^(\d)\1+$/;
const VALID_LENGTH_REGEX = /^\d{6,8}$/;

// Cache para cálculos frecuentes (opcional, mejora performance)
const dvCache = new Map<string, string>();

/**
 * Limpia un RUT eliminando puntos, guiones y espacios
 */
export function cleanRut(input: string): string {
  if (input == null || input === "") return "";
  
  // Versión más eficiente usando una sola regex
  return input.replace(/[^\dkK]/gi, "").toUpperCase();
}

/**
 * Descompone un RUT en dígitos y verificador
 * Mejorado con lógica más clara y eficiente
 */
export function deconstructRut(input: string): {
  digits: string;
  verifier: string;
} {
  const raw = cleanRut(input);
  if (!raw) return { digits: "", verifier: "" };
  
  const lastChar = raw.slice(-1);
  const isLastCharK = /[kK]/.test(lastChar);
  
  // Caso 1: Termina en K/k → claramente tiene DV
  if (isLastCharK) {
    return {
      digits: raw.slice(0, -1),
      verifier: "K", // Siempre mayúscula
    };
  }
  
  // Caso 2: Solo dígitos
  if (DIGITS_ONLY_REGEX.test(raw)) {
    const length = raw.length;
    
    // Lógica mejorada para determinar si incluye DV
    if (length === 9) {
      // 9 dígitos → 8 dígitos + 1 DV
      return {
        digits: raw.slice(0, -1),
        verifier: lastChar,
      };
    }
    
    if (length === 8) {
      // 8 dígitos → RUT completo sin DV
      return { digits: raw, verifier: "" };
    }
    
    // 6-7 dígitos → probablemente sin DV
    if (length >= 6 && length <= 7) {
      return { digits: raw, verifier: "" };
    }
  }
  
  // Caso 3: Mezcla de caracteres o longitud atípica
  // Asumimos que el último carácter es DV
  if (raw.length > 1) {
    return {
      digits: raw.slice(0, -1).replace(CLEAN_REGEX, ""),
      verifier: lastChar.toUpperCase(),
    };
  }
  
  // Caso 4: String muy corto
  return { digits: raw.replace(CLEAN_REGEX, ""), verifier: "" };
}

/**
 * Calcula el dígito verificador usando algoritmo Módulo 11
 * Optimizado para performance
 */
export function calculateRutVerifier(digitsInput: string): string | null {
  if (!digitsInput) return null;
  
  // Verificar cache primero
  const cacheKey = digitsInput;
  if (dvCache.has(cacheKey)) {
    return dvCache.get(cacheKey) || null;
  }
  
  const digits = digitsInput.replace(/\D/g, "");
  if (!DIGITS_ONLY_REGEX.test(digits)) return null;
  
  let sum = 0;
  let factor = 2;
  
  // Recorrer de derecha a izquierda
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += (digits.codePointAt(i)! - 48) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  
  const remainder = sum % 11;
  const dvNum = 11 - remainder;
  
  let result: string;
  if (dvNum === 11) {
    result = "0";
  } else if (dvNum === 10) {
    result = "K";
  } else {
    result = dvNum.toString();
  }
  
  // Guardar en cache para uso futuro
  dvCache.set(cacheKey, result);
  return result;
}

/**
 * Valida un RUT completo con dígito verificador
 */
export function validateRutFull(fullRut: string): boolean {
  if (typeof fullRut !== "string" || !fullRut) return false;
  
  const { digits, verifier } = deconstructRut(fullRut);
  if (!digits || !verifier) return false;
  
  if (!isDigitsValid(digits)) return false;
  
  const expected = calculateRutVerifier(digits);
  return expected != null && expected === verifier.toUpperCase();
}

/**
 * Valida que los dígitos tengan longitud correcta (6-8 dígitos)
 */
export function isDigitsValid(digitsInput: string): boolean {
  if (!digitsInput) return false;
  const digits = digitsInput.replace(/\D/g, "");
  return VALID_LENGTH_REGEX.test(digits);
}

/**
 * Detecta patrones repetidos sospechosos
 */
export function isSuspiciousRut(digitsInput: string): boolean {
  const digits = digitsInput.replace(/\D/g, "");
  if (!digits) return true;
  return REPEATED_PATTERN_REGEX.test(digits);
}

/**
 * Tipos de formato disponibles
 */
export type RutFormat = "dotdash" | "dash" | "nodash";

/**
 * Formatea un RUT según el formato especificado
 * Mejorado con manejo de ceros a la izquierda
 */
export function formatRut(
  fullRut: string,
  format: RutFormat = "dotdash"
): string {
  const cleaned = cleanRut(fullRut);
  if (!cleaned) return "";
  
  const { digits: originalDigits, verifier: originalVerifier } = deconstructRut(cleaned);
  if (!originalDigits) return "";
  
  // Usar variables mutables
  const digits = originalDigits;
  let verifier = originalVerifier;
  
  // Calcular DV si no existe y los dígitos son válidos
  if (!verifier && isDigitsValid(digits)) {
    verifier = calculateRutVerifier(digits) || "";
  }
  
  // Si aún no hay verifier, no podemos formatear
  if (!verifier) return "";
  
  // Preservar ceros a la izquierda para formateo consistente
  const paddedDigits = digits.padStart(8, "0");
  const digitsOnly = paddedDigits.replace(/^0+(?=\d)/, "") || "0";
  
  switch (format) {
    case "nodash":
      return `${digitsOnly}${verifier}`;
    
    case "dotdash": {
      // Formateo más eficiente
      const parts = [];
      let temp = digitsOnly;
      while (temp.length > 3) {
        parts.unshift(temp.slice(-3));
        temp = temp.slice(0, -3);
      }
      if (temp) parts.unshift(temp);
      return `${parts.join(".")}-${verifier}`;
    }
    
    case "dash":
    default:
      return `${digitsOnly}-${verifier}`;
  }
}

/**
 * Valida solo los dígitos del RUT (sin verificar DV)
 */
export function validateRutDigitsOnly(digits: string): boolean {
  const cleaned = digits.replace(/\D/g, "");
  return isDigitsValid(cleaned) && !isSuspiciousRut(cleaned);
}

/**
 * Completa un RUT calculando y agregando el DV
 */
export function completeRut(
  digitsOnly: string,
  format: RutFormat = "dotdash"
): string | null {
  const cleaned = digitsOnly.replace(/\D/g, "");
  if (!VALID_LENGTH_REGEX.test(cleaned)) return null;
  
  const verifier = calculateRutVerifier(cleaned);
  if (!verifier) return null;
  
  return formatRut(cleaned + verifier, format);
}

/**
 * Normaliza un RUT: limpia, valida, calcula DV si falta y formatea
 * Función todoenuno para uso común
 */
export function normalizeRut(
  input: string,
  format: RutFormat = "dotdash"
): string {
  if (!input) return "";
  
  const cleaned = cleanRut(input);
  if (!cleaned) return "";
  
  // Si es muy corto, devolver limpio
  if (cleaned.length < 7) return cleaned;
  
  // Usar formatRut que ya maneja cálculo de DV
  return formatRut(cleaned, format);
}

/**
 * Máscara para input en tiempo real
 * Formatea mientras el usuario escribe
 */
export function maskRutInput(value: string): string {
  const cleaned = cleanRut(value);
  if (!cleaned) return "";
  
  const length = cleaned.length;
  
  // Para inputs muy cortos, devolver sin formato
  if (length <= 1) return cleaned;
  
  // 1. Si termina en K/k → siempre es DV (agregar guión)
  // 2. Si tiene 8 dígitos exactos → solo puntos (sin guión)
  // 3. Si tiene 9+ caracteres → asumir que el último es DV
  
  const lastChar = cleaned.slice(-1);
  const endsWithK = /[kK]/.test(lastChar);
  
  if (endsWithK) {
    // Caso especial: termina en K → siempre es DV
    const digits = cleaned.slice(0, -1);
    const verifier = "K"; // Siempre mayúscula
    
    // Formatear dígitos
    const formattedDigits = digits
      .split("")
      .reverse()
      .join("")
      .replace(/(\d{3})(?=\d)/g, "$1.")
      .split("")
      .reverse()
      .join("");
    
    return `${formattedDigits}-${verifier}`;
  }
  
  const isExactlyEightDigits = length === 8 && /^\d+$/.test(cleaned);
  
  if (isExactlyEightDigits) {
    // 8 dígitos exactos → formatear solo con puntos
    const parts = [];
    let temp = cleaned;
    while (temp.length > 3) {
      parts.unshift(temp.slice(-3));
      temp = temp.slice(0, -3);
    }
    if (temp) parts.unshift(temp);
    return parts.join(".");
  }
  
  // Para otros casos
  let digits = cleaned;
  let verifier = "";
  
  // Solo separar DV si tenemos 9+ caracteres (y no es K)
  if (length >= 9) {
    verifier = cleaned.slice(-1);
    digits = cleaned.slice(0, -1);
  }
  
  // Formatear dígitos con puntos
  const formattedDigits = digits
    .split("")
    .reverse()
    .join("")
    .replace(/(\d{3})(?=\d)/g, "$1.")
    .split("")
    .reverse()
    .join("");
  
  // Agregar verifier si existe
  if (verifier && /[0-9]/.test(verifier)) {
    return `${formattedDigits}-${verifier}`;
  }
  
  return formattedDigits;
}

/**
 * Extrae solo los dígitos del RUT (sin DV)
 */
export function extractDigits(rut: string): string {
  const { digits } = deconstructRut(rut);
  return digits || "";
}

/**
 * Extrae solo el dígito verificador
 */
export function extractVerifier(rut: string): string {
  const { verifier } = deconstructRut(rut);
  return verifier || "";
}

/**
 * Verifica si un string tiene la estructura básica de un RUT
 * (sin validar el cálculo del DV)
 */
export function hasRutStructure(input: string): boolean {
  if (!input) return false;

  const cleaned = cleanRut(input);
  if (cleaned.length < 3) return false;
  
  const digits = cleaned.replace(/\D/g, "");
  return digits.length >= 3;
}

/**
 * Compara dos RUTs ignorando formato
 */
export function compareRuts(rut1: string, rut2: string): boolean {
  // Normalizar ambos a formato sin guión para comparar
  const normalized1 = normalizeRut(rut1, "nodash");
  const normalized2 = normalizeRut(rut2, "nodash");
  
  if (!normalized1 || !normalized2) return false;
  
  return normalized1 === normalized2;
}

/**
 * Genera un RUT aleatorio válido (útil para testing)
 */
export function generateRandomRut(format: RutFormat = "dotdash"): string {
  // RUTs válidos conocidos para asegurar validez
  const validRuts = [
    "12345678",  // → DV = 5
    "11111111",  // → DV = 1  
    "87654321",  // → DV = 3
    "800000",    // → DV = K
    "24965106",  // → DV = 0
  ];
  
  // Elegir uno aleatorio
  const randomIndex = Math.floor(Math.random() * validRuts.length);
  const randomRutDigits = validRuts[randomIndex];
  
  // Usar formatRut que calculará el DV automáticamente
  return formatRut(randomRutDigits, format);
}

/**
 * Limpia el cache de cálculos (útil para testing o memoria)
 */
export function clearCache(): void {
  dvCache.clear();
}

// Exportar todas las funciones en un objeto para facilitar el import
export const RutUtils = {
  cleanRut,
  deconstructRut,
  calculateRutVerifier,
  validateRutFull,
  isDigitsValid,
  isSuspiciousRut,
  formatRut,
  validateRutDigitsOnly,
  completeRut,
  normalizeRut,
  maskRutInput,
  extractDigits,
  extractVerifier,
  hasRutStructure,
  compareRuts,
  generateRandomRut,
  clearCache,
};