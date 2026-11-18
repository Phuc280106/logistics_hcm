export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function isValidPhone(phone: string): boolean {
  return /^0\d{9,10}$/.test(phone.trim());
}

export function sanitizeOtpInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}
