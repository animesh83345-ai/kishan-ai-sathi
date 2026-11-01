/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function normalizeIndianPhoneNumber(value: string): string | null {
  const compact = value.trim().replace(/[\s().-]/g, '');
  const normalized = compact.startsWith('0091')
    ? `+91${compact.slice(4)}`
    : compact.startsWith('91') && !compact.startsWith('+')
      ? `+${compact}`
      : compact;

  if (/^[6-9]\d{9}$/.test(normalized)) {
    return `+91${normalized}`;
  }

  return /^\+91[6-9]\d{9}$/.test(normalized) ? normalized : null;
}
