const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (!e || !EMAIL_RE.test(e)) {
    return "ایمیل معتبر وارد کن.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  }
  return null;
}

export function validateDisplayName(name: string): string | null {
  const n = name.trim();
  if (n.length < 2) {
    return "نام نمایشی را حداقل با دو کاراکتر وارد کن.";
  }
  if (n.length > 255) {
    return "نام نمایشی خیلی بلند است.";
  }
  return null;
}
