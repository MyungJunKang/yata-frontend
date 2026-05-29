export type ForgotPasswordDraft = {
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

type Errors = Partial<
  Record<"email" | "password" | "passwordConfirm", string>
>;

export function validateForgotPassword(d: ForgotPasswordDraft): Errors {
  const e: Errors = {};
  if (!d.email) e.email = "이메일을 입력해 주세요.";
  else if (!/^[^\s@]+@ssu\.ac\.kr$/.test(d.email))
    e.email = "@ssu.ac.kr 이메일만 사용할 수 있어요.";
  if (!d.password) e.password = "비밀번호를 입력해 주세요.";
  else if (d.password.length < 8)
    e.password = "비밀번호는 8자 이상이어야 해요.";
  if (!d.passwordConfirm)
    e.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
  else if (d.password && d.passwordConfirm !== d.password)
    e.passwordConfirm = "비밀번호가 일치하지 않아요.";
  return e;
}
