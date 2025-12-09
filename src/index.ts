// src/index.ts
/**
 * Exportamos todos los métodos de rut.util.ts
 * Validador de RUT chileno completo con TypeScript
 */

export {
  calculateRutVerifier,
  cleanRut,
  completeRut,
  deconstructRut,
  formatRut,
  isDigitsValid,
  isSuspiciousRut,
  validateRutDigitsOnly,
  validateRutFull,
  normalizeRut,
  maskRutInput,
  extractDigits,
  extractVerifier,
  hasRutStructure,
  compareRuts,
  generateRandomRut,
  clearCache,
  RutUtils,
  type RutFormat
} from "./rut.util";