// src/index.ts
/**
 * Exportamos todos los métodos de rut.util.ts
 * Validador de RUT chileno completo con TypeScript
 */

export {
  calculateRutVerifier,
  cleanRut, clearCache, compareRuts, completeRut,
  deconstructRut, extractDigits,
  extractVerifier, formatRut, generateRandomRut, hasRutStructure, isDigitsValid,
  isSuspiciousRut, maskRutInput, normalizeRut, RutUtils, validateRutDigitsOnly,
  validateRutFull, type RutFormat
} from "./rut.util";
