import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Trash2, UserPlus } from "lucide-react";
import type { TeacherUser } from "../types/modul";

interface AdminTeachersViewProps {
  token: string;
  currentUser: TeacherUser;
}

export function AdminTeachersView({ token, currentUser }: AdminTeachersViewProps) {
  const [users, setUsers] = useState<TeacherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add teacher form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [jabatan, setJabatan] = useState("Guru Mata Pelajaran");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  // Reset teacher password inline state
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  // Admin own password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [changingOwnPass, setChangingOwnPass] = useState(false);
  const [ownPassNotice, setOwnPassNotice] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setNotice({ type: "error", text: data.error || "Gagal memuat daftar akun." });
      }
    } catch {
      setNotice({ type: "error", text: "Gagal terhubung ke server." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [token]);

  async function handleCreateTeacher(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          school: school.trim(),
          jabatan: jabatan.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ type: "error", text: data.error || "Gagal menambahkan akun guru." });
      } else {
        setUsers((prev) => [...prev, data.user]);
        setNotice({
          type: "success",
          text: `Akun guru atas nama ${data.user.name} (${data.user.email}) berhasil ditambahkan.`,
        });
        setName("");
        setEmail("");
        setSchool("");
        setJabatan("Guru Mata Pelajaran");
        setPassword("");
      }
    } catch {
      setNotice({ type: "error", text: "Gagal menambahkan akun guru." });
    } finally {
      setCreating(false);
    }
  }

  async function handleResetTeacherPassword(userId: string) {
    if (resetPasswordVal.length < 6) {
      setNotice({ type: "error", text: "Password baru guru minimal 6 karakter." });
      return;
    }
    setResetBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: resetPasswordVal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ type: "error", text: data.error || "Gagal memperbarui password guru." });
      } else {
        setNotice({ type: "success", text: "Password akun guru berhasil diperbarui." });
        setResetTargetId(null);
        setResetPasswordVal("");
      }
    } catch {
      setNotice({ type: "error", text: "Gagal memperbarui password." });
    } finally {
      setResetBusy(false);
    }
  }

  async function handleDeleteTeacher(userId: string, teacherName: string) {
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ type: "error", text: data.error || "Gagal menghapus akun guru." });
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setNotice({ type: "success", text: `Akun ${teacherName} telah dihapus.` });
      }
    } catch {
      setNotice({ type: "error", text: "Gagal menghapus akun guru." });
    }
  }

  async function handleChangeOwnPassword(e: FormEvent) {
    e.preventDefault();
    setOwnPassNotice(null);
    setChangingOwnPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword: newAdminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOwnPassNotice({ type: "error", text: data.error || "Gagal mengubah password." });
      } else {
        setOwnPassNotice({ type: "success", text: "Password admin berhasil diperbarui." });
        setCurrentPassword("");
        setNewAdminPassword("");
      }
    } catch {
      setOwnPassNotice({ type: "error", text: "Gagal mengubah password admin." });
    } finally {
      setChangingOwnPass(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Kelola Akun Guru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Panel Administrator ({currentUser.name} · {currentUser.email}) untuk menambahkan dan mengelola akses guru.
        </p>
      </div>

      {notice && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form Tambah Akun Guru */}
        <form
          onSubmit={handleCreateTeacher}
          className="space-y-4 rounded-xl border border-border bg-card p-6 lg:col-span-5"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <UserPlus className="size-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-ink">Tambah Akun Guru</h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="t-name" className="block text-xs font-semibold text-ink">
              Nama Lengkap & Gelar
            </label>
            <input
              id="t-name"
              type="text"
              placeholder="cth. Siti Aminah, S.Pd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="t-email" className="block text-xs font-semibold text-ink">
              Email Guru
            </label>
            <input
              id="t-email"
              type="email"
              placeholder="siti.aminah@sekolah.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="t-school" className="block text-xs font-semibold text-ink">
              Satuan Pendidikan / Sekolah
            </label>
            <input
              id="t-school"
              type="text"
              placeholder="cth. MTs Negeri 1 Kota"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="t-jabatan" className="block text-xs font-semibold text-ink">
              Jabatan / Mata Pelajaran
            </label>
            <input
              id="t-jabatan"
              type="text"
              placeholder="Guru Matematika"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="t-pass" className="block text-xs font-semibold text-ink">
              Password Awal Guru
            </label>
            <div className="relative">
              <input
                id="t-pass"
                type={showPass ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-border bg-canvas pr-10 pl-3 text-sm text-ink outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Sembunyikan password" : "Lihat password"}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-ink cursor-pointer"
              >
                {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary disabled:opacity-60 cursor-pointer"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4 text-saffron" />}
            <span>Buat Akun Guru</span>
          </button>
        </form>

        {/* Daftar Akun + Ubah Password Admin */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-display text-lg font-semibold text-ink">Daftar Akun Terdaftar</h2>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {users.length} akun
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Memuat daftar akun...</div>
            ) : (
              <div className="mt-3 divide-y divide-border">
                {users.map((u) => {
                  const isResetting = resetTargetId === u.id;
                  return (
                    <div key={u.id} className="py-3.5 first:pt-1 last:pb-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink">{u.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {u.email} · {u.school} ·{" "}
                            <span className="font-medium text-primary">
                              {u.role === "admin" ? "Admin" : u.jabatan || "Guru"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetId(isResetting ? null : u.id);
                              setResetPasswordVal("");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-slate-50 cursor-pointer"
                          >
                            <KeyRound className="size-3.5" />
                            <span>Atur Password</span>
                          </button>

                          {u.role !== "admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTeacher(u.id, u.name)}
                              aria-label={`Hapus akun ${u.name}`}
                              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isResetting && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-canvas p-3">
                          <input
                            type="password"
                            minLength={6}
                            placeholder="Password baru (min. 6 karakter)"
                            value={resetPasswordVal}
                            onChange={(e) => setResetPasswordVal(e.target.value)}
                            className="h-9 min-w-[200px] flex-1 rounded-md border border-border bg-card px-3 text-xs text-ink outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            disabled={resetBusy}
                            onClick={() => handleResetTeacherPassword(u.id)}
                            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-ink disabled:opacity-60 cursor-pointer"
                          >
                            {resetBusy ? "Menyimpan..." : "Simpan Password"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setResetTargetId(null)}
                            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-ink cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ubah Password Admin */}
          <form
            onSubmit={handleChangeOwnPassword}
            className="space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <div className="border-b border-border pb-3">
              <h2 className="font-display text-base font-semibold text-ink">
                Ubah Password Admin Saya
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Segera perbarui password sementara demi keamanan akun administrator Anda.
              </p>
            </div>

            {ownPassNotice && (
              <div
                className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                  ownPassNotice.type === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                {ownPassNotice.text}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="curr-pass" className="block text-xs font-semibold text-ink">
                  Password Saat Ini
                </label>
                <input
                  id="curr-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="new-pass" className="block text-xs font-semibold text-ink">
                  Password Baru
                </label>
                <input
                  id="new-pass"
                  type="password"
                  minLength={6}
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changingOwnPass}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
              >
                {changingOwnPass && <Loader2 className="size-3.5 animate-spin" />}
                <span>Perbarui Password Admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
