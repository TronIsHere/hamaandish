/** Escapes a string for safe use inside a MongoDB `$regex` pattern. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
];

export function getInitials(name: string): string {
  const clean = name.replace(/^u\//, "").trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0]! + words[1][0]!).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const clean = name.replace(/^u\//, "");
  return avatarColors[clean.charCodeAt(0) % avatarColors.length]!;
}

function toPersianDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "چند لحظه پیش";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${toPersianDigits(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${toPersianDigits(days)} روز پیش`;
  const months = Math.floor(days / 30);
  return `${toPersianDigits(months)} ماه پیش`;
}

export function estimateReadTime(text: string): string {
  const plain = text.replace(/<[^>]*>/g, " ").trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${toPersianDigits(minutes)} دقیقه مطالعه`;
}
