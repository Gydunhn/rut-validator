// src/__tests__/rut.util.test.ts

import {
  calculateRutVerifier,
  cleanRut,
  completeRut,
  deconstructRut,
  formatRut,
  isDigitsValid,
  isSuspiciousRut,
  validateRutDigitsOnly,
  validateRutFull
} from '../rut.util';

describe('RUT Utils', () => {
  describe('cleanRut', () => {
    it('debe eliminar puntos, guiones y espacios', () => {
      expect(cleanRut('12.345.678-9')).toBe('123456789');
      expect(cleanRut('12 345 678-9')).toBe('123456789');
      expect(cleanRut('12345678-9')).toBe('123456789');
    });
    it('debe preservar la K mayúscula', () => {
      expect(cleanRut('800.000-K')).toBe('800000K');
      expect(cleanRut('800000-k')).toBe('800000k');
    });
    it('debe manejar strings vacíos', () => {
      expect(cleanRut('')).toBe('');
    });
  });

  describe('deconstructRut', () => {
    it('debe separar dígitos y verificador correctamente', () => {
      expect(deconstructRut('12345678-9')).toEqual({
        digits: '12345678',
        verifier: '9'
      });
    });
    it('debe manejar RUT con K', () => {
      expect(deconstructRut('800000-K')).toEqual({
        digits: '800000',
        verifier: 'K'
      });
    });
    it('debe manejar RUT sin formato', () => {
      expect(deconstructRut('123456789')).toEqual({
        digits: '12345678',
        verifier: '9'
      });
    });
    it('debe manejar RUT corto sin DV', () => {
      expect(deconstructRut('800000')).toEqual({
        digits: '800000',
        verifier: ''
      });
    });
    it('debe manejar 8 dígitos como RUT sin DV', () => {
      expect(deconstructRut('12345678')).toEqual({
        digits: '12345678',
        verifier: '' // ¡Importante! Vacío, no "8"
      });
    });
    it('debe manejar 9 dígitos como RUT con DV', () => {
      expect(deconstructRut('123456785')).toEqual({
        digits: '12345678',
        verifier: '5'
      });
    });
  });

  describe('calculateRutVerifier', () => {
    it('debe calcular DV correctamente', () => {
      expect(calculateRutVerifier('12345678')).toBe('5');
      expect(calculateRutVerifier('11111111')).toBe('1');
      expect(calculateRutVerifier('800000')).toBe('K');
    });
    it('debe retornar null para entrada inválida', () => {
      expect(calculateRutVerifier('')).toBe(null);
      expect(calculateRutVerifier('abc')).toBe(null);
    });
    it('debe manejar caso con DV = 0', () => {
      expect(calculateRutVerifier('24965106')).toBe('0');
    });
  });

  describe('validateRutFull', () => {
    it('debe validar RUTs correctos', () => {
      expect(validateRutFull('12.345.678-5')).toBe(true);
      expect(validateRutFull('12345678-5')).toBe(true);
      expect(validateRutFull('123456785')).toBe(true);
      expect(validateRutFull('800.000-K')).toBe(true);
      expect(validateRutFull('11.111.111-1')).toBe(true);
    });
    it('debe rechazar RUTs incorrectos', () => {
      expect(validateRutFull('12.345.678-9')).toBe(false);
      expect(validateRutFull('800000-1')).toBe(false);
    });
    it('debe rechazar entradas inválidas', () => {
      expect(validateRutFull('')).toBe(false);
      expect(validateRutFull('abc')).toBe(false);
      expect(validateRutFull('123')).toBe(false);
    });
  });

  describe('isDigitsValid', () => {
    it('debe validar longitud correcta (6-8 dígitos)', () => {
      expect(isDigitsValid('800000')).toBe(true);
      expect(isDigitsValid('1234567')).toBe(true);
      expect(isDigitsValid('12345678')).toBe(true);
    });
    it('debe rechazar longitud incorrecta', () => {
      expect(isDigitsValid('12345')).toBe(false); // muy corto
      expect(isDigitsValid('123456789')).toBe(false); // muy largo
    });
  });

  describe('isSuspiciousRut', () => {
    it('debe detectar patrones repetidos', () => {
      expect(isSuspiciousRut('11111111')).toBe(true);
      expect(isSuspiciousRut('22222222')).toBe(true);
      expect(isSuspiciousRut('00000000')).toBe(true);
    });
    it('debe aceptar RUTs normales', () => {
      expect(isSuspiciousRut('12345678')).toBe(false);
      expect(isSuspiciousRut('800000')).toBe(false);
    });
  });

  describe('formatRut', () => {
    it('debe formatear con puntos y guión (dotdash)', () => {
      expect(formatRut('123456785', 'dotdash')).toBe('12.345.678-5');
      expect(formatRut('800000K', 'dotdash')).toBe('800.000-K');
    });
    it('debe formatear solo con guión (dash)', () => {
      expect(formatRut('123456785', 'dash')).toBe('12345678-5');
    });
    it('debe formatear sin guión (nodash)', () => {
      expect(formatRut('123456785', 'nodash')).toBe('123456785');
    });
    it('debe calcular DV si no existe', () => {
      expect(formatRut('12345678', 'dotdash')).toBe('12.345.678-5');
    });
    it('debe manejar entrada con formato', () => {
      expect(formatRut('12.345.678-5', 'dash')).toBe('12345678-5');
    });
    it('debe calcular DV si solo se pasan 8 dígitos', () => {
      expect(formatRut('12345678', 'dotdash')).toBe('12.345.678-5');
    });
    it('debe preservar DV si se pasan 9 dígitos', () => {
      expect(formatRut('123456789', 'dotdash')).toBe('12.345.678-9');
    });
  });

  describe('validateRutDigitsOnly', () => {
    it('debe validar dígitos correctos', () => {
      expect(validateRutDigitsOnly('12345678')).toBe(true);
      expect(validateRutDigitsOnly('800000')).toBe(true);
    });
    it('debe rechazar dígitos sospechosos', () => {
      expect(validateRutDigitsOnly('11111111')).toBe(false);
    });
    it('debe rechazar longitud incorrecta', () => {
      expect(validateRutDigitsOnly('123')).toBe(false);
    });
  });

  describe('completeRut', () => {
    it('debe completar RUT con DV calculado', () => {
      expect(completeRut('12345678')).toBe('12.345.678-5');
      expect(completeRut('800000')).toBe('800.000-K');
    });
    it('debe permitir diferentes formatos', () => {
      expect(completeRut('12345678', 'dash')).toBe('12345678-5');
      expect(completeRut('12345678', 'nodash')).toBe('123456785');
    });
    it('debe retornar null para entrada inválida', () => {
      expect(completeRut('123')).toBe(null);
      expect(completeRut('abc')).toBe(null);
    });
  });

  // Tests de integración
  describe('Flujo completo', () => {
    it('debe validar RUT de caso real: suscriptor El Mercurio', () => {
      const rut = '800000-K';
      expect(validateRutFull(rut)).toBe(true);
      expect(formatRut(rut)).toBe('800.000-K');
    });
    it('debe validar RUT estándar', () => {
      const rutSinFormato = '123456785';
      expect(validateRutFull(rutSinFormato)).toBe(true);
      const rutFormateado = formatRut(rutSinFormato);
      expect(rutFormateado).toBe('12.345.678-5');
      expect(validateRutFull(rutFormateado)).toBe(true);
    });
    it('debe completar y validar RUT sin DV', () => {
      const digits = '12345678';
      const completed = completeRut(digits);
      expect(completed).toBe('12.345.678-5');
      expect(validateRutFull(completed!)).toBe(true);
    });
  });
});
