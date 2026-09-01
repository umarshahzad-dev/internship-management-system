export class VknValidator {
  /**
   * Validates Turkish Vergi Kimlik Numarası (VKN) using standard checksum algorithm.
   * The number is 10 digits. The first digit is 0-9, and the checksum is calculated
   * as sum of digits at odd positions * 7 - sum of digits at even positions.
   * The result modulo 10 should equal the last digit.
   */
  static isValid(vkn: string): boolean {
    if (!/^[0-9]{10}$/.test(vkn)) {
      return false;
    }

    const digits = vkn.split('').map(Number);
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 9; i++) {
      if (i % 2 === 0) {
        oddSum += digits[i];
      } else {
        evenSum += digits[i];
      }
    }
    const checksum = (oddSum * 7 - evenSum) % 10;
    return checksum === digits[9];
  }
}
