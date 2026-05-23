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
  faEnvelope,
  faListCheck,
  faLock,
  faRightToBracket,
  faSpinner,
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
        await ensureUserProfile(
          cred.user.uid,
          cred.user.email,
          inviteCode,
        );
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
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} spin className="text-sky-600" />
        <p className="text-slate-600 dark:text-slate-400">กำลังตรวจสอบสถานะ...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-sky-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <FontAwesomeIcon
            icon={faListCheck}
            className="mb-3 text-4xl text-sky-600 dark:text-sky-400"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Task Log
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isRegister ? "สมัครสมาชิกเพื่อเริ่มใช้งาน" : "เข้าสู่ระบบเพื่อจัดการงานของคุณ"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
              Username (Email)
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-sky-500 transition focus:border-sky-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <FontAwesomeIcon icon={faLock} className="text-slate-400" />
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
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-sky-500 transition focus:border-sky-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FontAwesomeIcon
              icon={
                loading ? faSpinner : isRegister ? faUserPlus : faRightToBracket
              }
              spin={loading}
            />
            {loading
              ? "กำลังดำเนินการ..."
              : isRegister
                ? "สมัครสมาชิก"
                : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {isRegister ? (
            <>
              มีบัญชีอยู่แล้ว?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                เข้าสู่ระบบที่นี่
              </button>
            </>
          ) : (
            <>
              ยังไม่มีบัญชี?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                สมัครสมาชิกที่นี่
              </button>
            </>
          )}
        </p>

        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href="/landing" className="text-sky-600 hover:underline dark:text-sky-400">
            ดูหน้า Landing & Demo
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">...</div>}>
      <LoginForm />
    </Suspense>
  );
}
