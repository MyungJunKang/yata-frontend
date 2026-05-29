export type SignupDraft = {
  name?: string;
  email?: string;
  phone?: string;
  gender?: "male" | "female";
  department?: string;
  studentId?: string;
  password?: string;
  passwordConfirm?: string;
  bank?: string;
  accountNumber?: string;
  accountHolder?: string;
};

const KEY = "yata.signup.draft";

export function readSignupDraft(): SignupDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SignupDraft) : {};
  } catch {
    return {};
  }
}

export function writeSignupDraft(draft: SignupDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearSignupDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
