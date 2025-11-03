export const validateUsername = (s: string) => s.length >= 8;
export const validatePassword = (s: string) =>
  /[A-Z]/.test(s) && /\d/.test(s) && s.length >= 8;
export const same = (a: string, b: string) => a === b;
