export const SSU_EMAIL_DOMAIN = "@soongsil.ac.kr";

export function getEmailLocalPart(email: string | undefined): string {
  if (!email) return "";
  const idx = email.indexOf("@");
  return idx === -1 ? email : email.slice(0, idx);
}

export function buildSsuEmail(local: string): string {
  const cleaned = local.replace(/[@\s]/g, "");
  return cleaned ? `${cleaned}${SSU_EMAIL_DOMAIN}` : "";
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
