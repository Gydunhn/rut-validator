//src/rut.util.ts
/** Utilidades para RUT chileno - cálculo DV y validación (Módulo 11) */

const CLEAN_REGEX = /[^0-9kK]/g;

export function cleanRut(input: string): string {
  if (!input && input !== "") return "";
  // eslint-disable-next-line no-useless-escape
  return input.replace(/\s+/g, "").replace(/[.\-]/g, "").trim();
}

export function deconstructRut(input: string): {
  digits: string;
  verifier: string;
} {
  const raw = cleanRut(input);
  if (!raw) return { digits: "", verifier: "" };
  const last = raw.slice(-1);
  // Caso 1: Tiene K/k → claramente es DV
  if (/[kK]/.test(last)) {
    return {
      digits: raw.slice(0, -1).replace(CLEAN_REGEX, ""),
      verifier: last.toUpperCase(),
    };
  }
  // Caso 2: Si es solo dígitos (sin letras excepto posible K que ya manejamos)
  if (/^\d+$/.test(raw)) {
    // Longitudes especiales para RUT chileno:
    // - 6-8 dígitos: podría ser solo dígitos sin DV (común al ingresar)
    // - 7-9 caracteres con último dígito: podría ser con DV
    // Para evitar ambigüedad: si la longitud es exactamente 8,
    // y es solo dígitos, asumimos que NO incluye DV
    if (raw.length === 8) {
      // 8 dígitos → RUT completo sin DV (ej: 12345678)
      return { digits: raw, verifier: "" };
    }
    if (raw.length === 9) {
      // 9 dígitos → 8 dígitos + 1 DV (ej: 123456785)
      return {
        digits: raw.slice(0, -1),
        verifier: last,
      };
    }
    // Para 6-7 dígitos, no podemos saber con certeza
    // Mejor devolver como está y dejar que validateRutFull decida
    if (raw.length >= 6 && raw.length <= 7) {
      return { digits: raw, verifier: "" };
    }
  }
  // Caso 3: Tiene caracteres no numéricos (excepto K) o longitud atípica
  // Separar último carácter como posible DV
  if (raw.length > 1) {
    return {
      digits: raw.slice(0, -1).replace(CLEAN_REGEX, ""),
      verifier: last.toUpperCase(),
    };
  }
  // Caso 4: String muy corto o edge cases
  return { digits: raw.replace(CLEAN_REGEX, ""), verifier: "" };
}

export function calculateRutVerifier(digitsInput: string): string | null {
  if (!digitsInput) return null;
  const digits = digitsInput.replace(/\D/g, "");
  if (!/^\d+$/.test(digits)) return null;
  let sum = 0;
  let factor = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits.charAt(i), 10) * factor;
    factor++;
    if (factor > 7) factor = 2;
  }
  const remainder = sum % 11;
  const dvNum = 11 - remainder;
  if (dvNum === 11) return "0";
  if (dvNum === 10) return "K";
  return String(dvNum);
}

export function validateRutFull(fullRut: string): boolean {
  if (!fullRut || typeof fullRut !== "string") return false;
  const { digits, verifier } = deconstructRut(fullRut);
  if (!digits || !verifier) return false;
  if (!isDigitsValid(digits)) return false;
  const expected = calculateRutVerifier(digits);
  if (!expected) return false;
  return expected === verifier.toUpperCase();
}

export function isDigitsValid(digitsInput: string): boolean {
  if (!digitsInput) return false;
  const digits = digitsInput.replace(/\D/g, "");
  return /^\d{6,8}$/.test(digits);
}

export function isSuspiciousRut(digitsInput: string): boolean {
  const digits = digitsInput.replace(/\D/g, "");
  if (!digits) return true;
  if (/^(\d)\1+$/.test(digits)) return true;
  return false;
}

export type RutFormat = "dotdash" | "dash" | "nodash";

export function formatRut(
  fullRut: string,
  format: RutFormat = "dotdash"
): string {
  const cleaned = cleanRut(fullRut).toUpperCase();
  if (!cleaned) return "";
  // eslint-disable-next-line prefer-const
  let { digits, verifier } = deconstructRut(cleaned);
  if (!digits) return "";
  // Lógica mejorada para calcular DV si no existe
  if (!verifier) {
    // Solo calcular DV si los dígitos son válidos para un RUT
    if (isDigitsValid(digits)) {
      verifier = calculateRutVerifier(digits) || "";
    } else {
      // Si no son dígitos válidos, no podemos formatear
      return "";
    }
  }
  const digitsOnly = digits.replace(/^0+/, "") || "0";
  if (format === "nodash") {
    return `${digitsOnly}${verifier}`;
  }
  if (format === "dotdash") {
    const withDots = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${withDots}-${verifier}`;
  }
  // format === "dash"
  return `${digitsOnly}-${verifier}`;
}

export function validateRutDigitsOnly(digits: string): boolean {
  const cleaned = digits.replace(/\D/g, "");
  return isDigitsValid(cleaned) && !isSuspiciousRut(cleaned);
}

export function completeRut(
  digitsOnly: string,
  format: RutFormat = "dotdash"
): string | null {
  const cleaned = digitsOnly.replace(/\D/g, "");
  // Validar que sean solo dígitos y longitud correcta
  if (!/^\d{6,8}$/.test(cleaned)) return null;
  const verifier = calculateRutVerifier(cleaned);
  if (!verifier) return null;
  // Usar formatRut para formatear consistentemente
  return formatRut(cleaned + verifier, format);
}
