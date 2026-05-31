"use client";

import { getFirebaseAuth } from "@/config/firebase";
import { getFirebaseErrorMessage } from "@/lib/taskHelpers";
import { swalAlertError } from "@/lib/swal";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { ensureUserProfile } from "@/lib/userService";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      await swalAlertError("กรุณากรอกอีเมลและรหัสผ่าน");
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password,
        );
        await ensureUserProfile(cred.user.uid, cred.user.email, inviteCode);
      } else {
        const cred = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password,
        );
        await ensureUserProfile(cred.user.uid, cred.user.email, inviteCode);
      }
      router.replace("/");
    } catch (err) {
      await swalAlertError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center linear-text-secondary">
        กำลังตรวจสอบสถานะ...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] linear-card">
        <div className="mb-8 text-center">
          <FontAwesomeIcon
            icon={faListCheck}
            className="mb-3 text-2xl text-[var(--linear-accent)]"
          />
          <h1 className="linear-heading-lg">Smart Task Management</h1>
          <p className="mt-2 linear-label">
            {isRegister ? "สมัครสมาชิกเพื่อเริ่มใช้งาน" : "เข้าสู่ระบบเพื่อจัดการงานของคุณ"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="linear-label mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="linear-input"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="linear-label mb-1 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="linear-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="linear-btn linear-btn-primary w-full"
          >
            <FontAwesomeIcon
              icon={isRegister ? faUserPlus : faRightToBracket}
            />
            {loading
              ? "กำลังดำเนินการ..."
              : isRegister
                ? "สมัครสมาชิก"
                : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-6 text-center linear-label">
          {isRegister ? (
            <>
              มีบัญชีอยู่แล้ว?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[var(--linear-accent)] transition-colors hover:text-[var(--linear-accent-hover)]"
              >
                เข้าสู่ระบบ
              </button>
            </>
          ) : (
            <>
              ยังไม่มีบัญชี?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-[var(--linear-accent)] transition-colors hover:text-[var(--linear-accent-hover)]"
              >
                สมัครสมาชิก
              </button>
            </>
          )}
        </p>

        <p className="mt-4 text-center linear-text-tertiary text-[12px]">
          <Link
            href="/landing"
            className="text-[var(--linear-accent)] transition-colors hover:text-[var(--linear-accent-hover)]"
          >
            ดูหน้า Landing
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center linear-text-secondary">
          ...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
