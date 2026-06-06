import type { SignupDraft } from "./signup-storage";

type StepOneErrors = Partial<
  Record<
    "name" | "email" | "phone" | "gender" | "department" | "studentId",
    string
  >
>;

type StepTwoErrors = Partial<Record<"password" | "passwordConfirm", string>>;

type StepThreeErrors = Partial<
  Record<"bank" | "accountNumber" | "accountHolder", string>
>;

export function validateStepOne(d: SignupDraft): StepOneErrors {
  const e: StepOneErrors = {};
  if (!d.name?.trim()) e.name = "이름을 입력해 주세요.";
  if (!d.email) e.email = "이메일을 입력해 주세요.";
  else if (!/^[^\s@]+@soongsil\.ac\.kr$/.test(d.email))
    e.email = "@soongsil.ac.kr 이메일만 사용할 수 있어요.";
  if (!d.phone) e.phone = "전화번호를 입력해 주세요.";
  else if (!/^010-\d{4}-\d{4}$/.test(d.phone))
    e.phone = "010-0000-0000 형식이어야 해요.";
  if (!d.gender) e.gender = "성별을 선택해 주세요.";
  if (!d.department?.trim()) e.department = "학과를 선택해 주세요.";
  if (!d.studentId) e.studentId = "학번을 선택해 주세요.";
  return e;
}

export function validateStepTwo(d: SignupDraft): StepTwoErrors {
  const e: StepTwoErrors = {};
  if (!d.password) e.password = "비밀번호를 입력해 주세요.";
  else if (d.password.length < 8)
    e.password = "비밀번호는 8자 이상이어야 해요.";
  if (!d.passwordConfirm) e.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
  else if (d.password && d.passwordConfirm !== d.password)
    e.passwordConfirm = "비밀번호가 일치하지 않아요.";
  return e;
}

export function validateStepThree(d: SignupDraft): StepThreeErrors {
  const e: StepThreeErrors = {};
  if (!d.bank) e.bank = "은행을 선택해 주세요.";
  if (!d.accountNumber) e.accountNumber = "계좌번호를 입력해 주세요.";
  else if (!/^\d{6,16}$/.test(d.accountNumber.replace(/-/g, "")))
    e.accountNumber = "올바른 계좌번호 형식이 아니에요.";
  if (!d.accountHolder?.trim()) e.accountHolder = "예금주를 입력해 주세요.";
  return e;
}
