"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  clearSignupDraft,
  readSignupDraft,
  writeSignupDraft,
  type SignupDraft,
} from "@/features/auth/lib/signup-storage";

type SignupContextValue = {
  draft: SignupDraft;
  setField: <K extends keyof SignupDraft>(key: K, value: SignupDraft[K]) => void;
  reset: () => void;
};

const SignupContext = createContext<SignupContextValue | null>(null);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<SignupDraft>({});

  useEffect(() => {
    setDraft(readSignupDraft());
  }, []);

  const setField = useCallback<SignupContextValue["setField"]>((key, value) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      writeSignupDraft(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setDraft({});
    clearSignupDraft();
  }, []);

  return (
    <SignupContext.Provider value={{ draft, setField, reset }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("useSignup must be used within SignupProvider");
  return ctx;
}
