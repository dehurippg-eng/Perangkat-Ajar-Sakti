import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Brand } from "./Brand";
import type { TeacherUser } from "../types/modul";

interface LoginViewProps {
  onSuccess: (user: TeacherUser, token: string) => void;
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Email atau password salah.");
        return;
      }

      onSuccess(data.user, data.token);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba beberapa saat lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink-gradient p-12 text-ink-foreground lg:flex">
        <Brand tone="light" />

        <div className="relative z-10 max-w-lg">
          <p className="font-display text-4xl leading-tight font-medium text-saffron text-balance">
            “Setiap orang menjadi guru, setiap rumah menjadi sekolah.”
          </p>
          <p className="mt-4 text-sm font-medium text-ink-muted">— Ki Hajar Dewantara</p>

          <div className="mt-10 grid grid-cols-2 gap-3.5 text-sm">
            {[
              ["SD/MI · Fase A–C", "Modul Ajar, LKPD & 8 Lampiran"],
              ["SMP/MTs · Fase D", "Kaldik, Prota & Prosem Otomatis"],
              ["SMA/MA · Fase E–F", "Daftar Hadir & Rekap Nilai KKTP"],
              ["SMK/MAK · Fase E–F", "Cover & Daftar Isi Siap Jilid"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-xl border border-ink-foreground/15 bg-ink-foreground/5 p-4"
              >
                <div className="font-semibold text-ink-foreground">{title}</div>
                <div className="mt-1 text-xs text-ink-muted">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-ink-muted">
          Tanpa Batas Pemakaian untuk Seluruh Guru Terdaftar di Indonesia · Kurikulum Merdeka
        </p>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full border-[40px] border-saffron/10"
        />
      </aside>

      <main className="flex items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Masuk Akun Guru
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Masuk menggunakan email dan password yang telah didaftarkan oleh Admin. Seluruh fitur perangkat ajar dapat digunakan tanpa batas pemakaian.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-red-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan password akun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-ink-foreground transition-colors hover:bg-primary disabled:opacity-60 cursor-pointer"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              <span>Masuk Akun</span>
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Belum memiliki akun? Hubungi Admin untuk pembuatan akun guru baru.
          </p>
        </div>
      </main>
    </div>
  );
}
