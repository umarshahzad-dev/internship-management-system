export class VknValidator {
  /**
   * Validates Turkish Vergi Kimlik Numarası (VKN) using the official checksum algorithm.
   * A0..A9 are digits.
   */
  static isValid(vkn: string): boolean {
    if (!/^[0-9]{10}$/.test(vkn)) {
      return false;
    }

    const digits = vkn.split('').map(Number);
    let sum = 0;

    for (let i = 0; i <= 8; i++) {
      const tmp = (digits[i] + (9 - i)) % 10;
      let res = (tmp * Math.pow(2, 9 - i)) % 9;
      if (tmp !== 0 && res === 0) {
        res = 9;
      }
      sum += res;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[9];
  }
}
