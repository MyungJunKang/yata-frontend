export type ForgotPasswordDraft = {
  email?: string;
};

type ForgotErrors = Partial<Record<"email", string>>;

export function validateForgotPassword(d: ForgotPasswordDraft): ForgotErrors {
  const e: ForgotErrors = {};
  if (!d.email) e.email = "이메일을 입력해 주세요.";
  else if (!/^[^\s@]+@soongsil\.ac\.kr$/.test(d.email))
    e.email = "@soongsil.ac.kr 이메일만 사용할 수 있어요.";
  return e;
}

export type ResetPasswordDraft = {
  password?: string;
  passwordConfirm?: string;
};

type ResetErrors = Partial<Record<"password" | "passwordConfirm", string>>;

export function validateResetPassword(d: ResetPasswordDraft): ResetErrors {
  const e: ResetErrors = {};
  if (!d.password) e.password = "비밀번호를 입력해 주세요.";
  else if (d.password.length < 8)
    e.password = "비밀번호는 8자 이상이어야 해요.";
  if (!d.passwordConfirm)
    e.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
  else if (d.password && d.passwordConfirm !== d.password)
    e.passwordConfirm = "비밀번호가 일치하지 않아요.";
  return e;
}
