import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  BookOpen,
  BookmarkCheck,
  BookmarkPlus,
  Copy,
  Download,
  FileText,
  LogOut,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Brand } from "./Brand";
import { ModulBuilderForm } from "./ModulBuilderForm";
import { ModulDocumentView } from "./ModulDocumentView";
import { PanduanPmView } from "./PanduanPmView";
import { AdminTeachersView } from "./AdminTeachersView";
import { KaldikOtomatisView } from "./KaldikOtomatisView";
import { ProtaProsemView } from "./ProtaProsemView";
import { CoverPerangkatView } from "./CoverPerangkatView";
import { PresensiNilaiView } from "./PresensiNilaiView";
import type { Jenjang, ModulAjar, TeacherUser } from "../types/modul";
import type {
  AcademicClass,
  AkademikSignatureMeta,
  AkademikWorkspaceData,
  AttendanceMap,
  CoverPerangkatConfig,
  GradeSheetMap,
  HariSekolahMode,
  KaldikDayNote,
  ProsemDocument,
  ProtaDocument,
} from "../types/akademik";
import {
  buildKaldikYear,
  createDefaultCoverConfig,
  createStarterClasses,
} from "../lib/akademikEngine";

interface ModulWorkspaceProps {
  user: TeacherUser;
  token: string;
  onLogout: () => void;
}

type WorkspaceTab = "library" | "builder" | "kurikulum" | "penilaian" | "guide" | "admin";
type KurikulumSubTab = "kaldik" | "prota-prosem" | "cover";

function buildInitialAkademikData(user: TeacherUser): AkademikWorkspaceData {
  const starterClasses = createStarterClasses();
  const tahunAjaran = "2026/2027";
  return {
    tahunAjaran,
    hariSekolah: 5,
    kktpMinimal: 71,
    bobotFormatif: 40,
    meta: {
      sekolah: user.school || "Satuan Pendidikan Indonesia",
      penyusun: user.name || "Guru Mata Pelajaran",
      nipGuru: "",
      namaKepalaSekolah: "",
      nipKepalaSekolah: "",
      kotaTanggal: `Indonesia, ${new Date().getFullYear()}`,
    },
    coverConfig: createDefaultCoverConfig({
      sekolah: user.school || "Satuan Pendidikan Indonesia",
      namaGuru: user.name || "Guru Mata Pelajaran",
      tahunAjaran,
    }),
    classes: starterClasses,
    selectedClassId: starterClasses[0].id,
    kaldikOverrides: {},
    protaRecords: {},
    prosemRecords: {},
    presensiRecords: {},
    nilaiRecords: {},
  };
}

function mergeAkademikData(
  raw: Partial<AkademikWorkspaceData> | null | undefined,
  user: TeacherUser
): AkademikWorkspaceData {
  const base = buildInitialAkademikData(user);
  if (!raw || typeof raw !== "object") return base;
  const classes =
    Array.isArray(raw.classes) && raw.classes.length > 0 ? raw.classes : base.classes;
  return {
    ...base,
    ...raw,
    meta: { ...base.meta, ...(raw.meta ?? {}) },
    coverConfig: { ...base.coverConfig, ...(raw.coverConfig ?? {}) },
    classes,
    selectedClassId:
      raw.selectedClassId && classes.some((c) => c.id === raw.selectedClassId)
        ? raw.selectedClassId
        : classes[0].id,
    kaldikOverrides: raw.kaldikOverrides ?? {},
    protaRecords: raw.protaRecords ?? {},
    prosemRecords: raw.prosemRecords ?? {},
    presensiRecords: raw.presensiRecords ?? {},
    nilaiRecords: raw.nilaiRecords ?? {},
  };
}

export function ModulWorkspace({ user, token, onLogout }: ModulWorkspaceProps) {
  const [tab, setTab] = useState<WorkspaceTab>("library");
  const [kurikulumSubTab, setKurikulumSubTab] = useState<KurikulumSubTab>("kaldik");
  const [modules, setModules] = useState<ModulAjar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lampiranSelectionMap, setLampiranSelectionMap] = useState<Record<string, number[]>>({});
  const [search, setSearch] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState<"Semua" | Jenjang>("Semua");
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "mine" | "shared">("all");
  const [archiveNotice, setArchiveNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingModuleId, setSavingModuleId] = useState<string | null>(null);
  const [importingJson, setImportingJson] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Shared Akademik Workspace State (Kaldik, Prota, Prosem, Cover, Presensi, Nilai)
  const [akademikData, setAkademikData] = useState<AkademikWorkspaceData>(() =>
    buildInitialAkademikData(user)
  );
  const [savingAkademik, setSavingAkademik] = useState(false);
  const [akademikNotice, setAkademikNotice] = useState<string | null>(null);

  function showArchiveNotice(type: "ok" | "err", text: string) {
    setArchiveNotice({ type, text });
    window.setTimeout(() => setArchiveNotice(null), 4500);
  }

  const isAdmin = user.role === "admin";

  // Obeys Top Bar Contract: max 5 single-line nav items
  const navItems: { id: WorkspaceTab; label: string }[] = isAdmin
    ? [
        { id: "library", label: "Daftar Modul" },
        { id: "builder", label: "Buat Modul" },
        { id: "kurikulum", label: "Prota & Kaldik" },
        { id: "penilaian", label: "Presensi & Nilai" },
        { id: "admin", label: "Kelola Guru" },
      ]
    : [
        { id: "library", label: "Daftar Modul" },
        { id: "builder", label: "Buat Modul" },
        { id: "kurikulum", label: "Prota & Kaldik" },
        { id: "penilaian", label: "Presensi & Nilai" },
        { id: "guide", label: "Panduan PM" },
      ];

  async function fetchModules() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/modules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memuat daftar modul.");
      } else {
        setModules(data.modules || []);
      }
    } catch {
      setError("Gagal terhubung ke server untuk memuat arsip modul.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAkademik() {
    try {
      const res = await fetch("/api/akademik", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setAkademikData(mergeAkademikData(json.data, user));
    } catch {
      // Keep local starter akademik data cleanly
    }
  }

  useEffect(() => {
    fetchModules();
    fetchAkademik();
  }, [token]);

  async function handleSaveAkademik() {
    setSavingAkademik(true);
    setAkademikNotice(null);
    try {
      const res = await fetch("/api/akademik", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: akademikData }),
      });
      if (res.ok) {
        setAkademikNotice("Perangkat akademik berhasil disimpan ke server.");
        window.setTimeout(() => setAkademikNotice(null), 3500);
      } else {
        const err = await res.json().catch(() => ({}));
        setAkademikNotice(err.error || "Gagal menyimpan data perangkat akademik.");
      }
    } catch {
      setAkademikNotice("Tidak dapat terhubung ke server saat menyimpan.");
    } finally {
      setSavingAkademik(false);
    }
  }

  const kaldik = useMemo(
    () =>
      buildKaldikYear(
        akademikData.tahunAjaran,
        akademikData.hariSekolah,
        akademikData.kaldikOverrides[akademikData.tahunAjaran] ?? {}
      ),
    [akademikData.tahunAjaran, akademikData.hariSekolah, akademikData.kaldikOverrides]
  );

  const selectedModul = modules.find((m) => m.id === selectedId) ?? null;

  const myModulesCount = useMemo(
    () => modules.filter((m) => m.ownerId === user.id).length,
    [modules, user.id]
  );
  const sharedModulesCount = useMemo(
    () => modules.filter((m) => m.ownerId === "shared-demo").length,
    [modules]
  );

  const filteredModules = modules.filter((m) => {
    const matchesOwner =
      ownershipFilter === "all" ||
      (ownershipFilter === "mine" ? m.ownerId === user.id : m.ownerId === "shared-demo");
    const matchesJenjang = jenjangFilter === "Semua" || m.identitas.jenjang === jenjangFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      m.identitas.judulModul.toLowerCase().includes(q) ||
      m.identitas.mataPelajaran.toLowerCase().includes(q) ||
      m.identitas.topik.toLowerCase().includes(q);
    return matchesOwner && matchesJenjang && matchesQuery;
  });

  async function handleSaveEdit(updated: ModulAjar): Promise<{ ok: boolean; message?: string }> {
    try {
      // Jika guru menyunting modul template/milik bersama, otomatis simpan sebagai salinan pribadi ke akun guru tersebut
      if (updated.ownerId !== user.id && !isAdmin) {
        const copyPayload: Omit<ModulAjar, "id" | "createdAt" | "updatedAt"> = {
          ...updated,
          ownerId: user.id,
          identitas: {
            ...updated.identitas,
            penyusun:
              updated.ownerId === "shared-demo" &&
              updated.identitas.penyusun === "Tim Kurikulum Merdeka"
                ? user.name
                : updated.identitas.penyusun,
            sekolah:
              updated.ownerId === "shared-demo" ? user.school : updated.identitas.sekolah,
          },
        };
        const res = await fetch("/api/modules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ modul: copyPayload }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.modul) {
          setModules((prev) => [data.modul, ...prev]);
          if (lampiranSelectionMap[updated.id]) {
            setLampiranSelectionMap((prev) => ({
              ...prev,
              [data.modul.id]: prev[updated.id],
            }));
          }
          setSelectedId(data.modul.id);
          return {
            ok: true,
            message: "Modul ajar dan perubahannya berhasil disimpan ke penyimpanan akun Anda.",
          };
        }
        return { ok: false, message: data.error || "Gagal menyimpan modul ke akun Anda." };
      }

      const res = await fetch(`/api/modules/${encodeURIComponent(updated.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ modul: updated }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.modul) {
        setModules((prev) => prev.map((m) => (m.id === data.modul.id ? data.modul : m)));
        return {
          ok: true,
          message: "Perubahan modul ajar berhasil disimpan ke penyimpanan akun Anda.",
        };
      }
      return { ok: false, message: data.error || "Gagal memperbarui modul ajar." };
    } catch {
      return { ok: false, message: "Tidak dapat terhubung ke server saat menyimpan modul." };
    }
  }

  async function handleSaveToArchive(modul: ModulAjar): Promise<{ ok: boolean; message?: string }> {
    setSavingModuleId(modul.id);
    try {
      const payload: Omit<ModulAjar, "id" | "createdAt" | "updatedAt"> = {
        ...modul,
        ownerId: user.id,
        identitas: {
          ...modul.identitas,
          penyusun: modul.ownerId === "shared-demo" ? user.name : modul.identitas.penyusun,
          sekolah: modul.ownerId === "shared-demo" ? user.school : modul.identitas.sekolah,
        },
      };
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ modul: payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.modul) {
        setModules((prev) => [data.modul, ...prev]);
        if (lampiranSelectionMap[modul.id]) {
          setLampiranSelectionMap((prev) => ({
            ...prev,
            [data.modul.id]: prev[modul.id],
          }));
        }
        if (selectedId === modul.id) {
          setSelectedId(data.modul.id);
        }
        showArchiveNotice(
          "ok",
          `"${modul.identitas.judulModul}" tersimpan di Penyimpanan Akun Anda.`
        );
        return {
          ok: true,
          message: "Modul ajar berhasil disimpan ke penyimpanan akun Anda.",
        };
      }
      const msg = data.error || "Gagal menyimpan modul ke penyimpanan akun.";
      showArchiveNotice("err", msg);
      return { ok: false, message: msg };
    } catch {
      const msg = "Tidak dapat terhubung ke server saat menyimpan modul.";
      showArchiveNotice("err", msg);
      return { ok: false, message: msg };
    } finally {
      setSavingModuleId(null);
    }
  }

  async function handleDuplicate(modul: ModulAjar) {
    const copyPayload: Omit<ModulAjar, "id" | "createdAt" | "updatedAt"> = {
      ...modul,
      ownerId: user.id,
      identitas: {
        ...modul.identitas,
        judulModul: `${modul.identitas.judulModul} (Salinan)`,
        penyusun: user.name,
        sekolah: user.school,
      },
    };
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ modul: copyPayload }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.modul) {
      setModules((prev) => [data.modul, ...prev]);
      showArchiveNotice("ok", `Salinan "${data.modul.identitas.judulModul}" disimpan ke akun Anda.`);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/modules/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setModules((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) setSelectedId(null);
      showArchiveNotice("ok", "Modul ajar telah dihapus dari penyimpanan.");
    }
  }

  function handleBackupModulesJson() {
    const owned = modules.filter((m) => m.ownerId === user.id);
    const targetList = owned.length > 0 ? owned : filteredModules;
    if (targetList.length === 0) {
      showArchiveNotice("err", "Belum ada modul ajar yang dapat dicadangkan.");
      return;
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      ownerName: user.name,
      ownerEmail: user.email,
      school: user.school,
      modules: targetList,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeUser = user.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.href = url;
    a.download = `arsip-modul-ajar-${safeUser || "guru"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showArchiveNotice(
      "ok",
      `${targetList.length} modul ajar berhasil dicadangkan ke berkas JSON.`
    );
  }

  async function handleImportModulesFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportingJson(true);
    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.modules)
        ? parsed.modules
        : parsed?.identitas
        ? [parsed]
        : [];
      if (list.length === 0) {
        showArchiveNotice("err", "Berkas JSON tidak memuat struktur modul ajar yang valid.");
        return;
      }
      const res = await fetch("/api/modules/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ modules: list }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.modules)) {
        setModules((prev) => [...data.modules, ...prev]);
        setOwnershipFilter("mine");
        showArchiveNotice(
          "ok",
          `${data.modules.length} modul ajar berhasil disimpan ke Penyimpanan Akun Anda.`
        );
      } else {
        showArchiveNotice("err", data.error || "Gagal mengimpor berkas modul ajar.");
      }
    } catch {
      showArchiveNotice("err", "Berkas JSON gagal dibaca. Pastikan format berkas benar.");
    } finally {
      setImportingJson(false);
    }
  }

  function handleChangeTahunAjaran(tahun: string) {
    setAkademikData((prev) => ({
      ...prev,
      tahunAjaran: tahun,
      coverConfig: { ...prev.coverConfig, tahunAjaran: tahun },
    }));
  }

  function handleChangeHariSekolah(mode: HariSekolahMode) {
    setAkademikData((prev) => ({ ...prev, hariSekolah: mode }));
  }

  function handleUpdateDayOverride(dateStr: string, note: KaldikDayNote | null) {
    setAkademikData((prev) => {
      const yearMap = { ...(prev.kaldikOverrides[prev.tahunAjaran] ?? {}) };
      if (note === null) {
        delete yearMap[dateStr];
      } else {
        yearMap[dateStr] = note;
      }
      return {
        ...prev,
        kaldikOverrides: {
          ...prev.kaldikOverrides,
          [prev.tahunAjaran]: yearMap,
        },
      };
    });
  }

  function handleResetYearOverrides() {
    setAkademikData((prev) => {
      const next = { ...prev.kaldikOverrides };
      delete next[prev.tahunAjaran];
      return { ...prev, kaldikOverrides: next };
    });
  }

  function handleUpdateMeta(meta: AkademikSignatureMeta) {
    setAkademikData((prev) => ({ ...prev, meta }));
  }

  function handleUpdateCover(cover: CoverPerangkatConfig) {
    setAkademikData((prev) => ({ ...prev, coverConfig: cover }));
  }

  function handleSaveProta(key: string, doc: ProtaDocument) {
    setAkademikData((prev) => ({
      ...prev,
      protaRecords: { ...prev.protaRecords, [key]: doc },
    }));
  }

  function handleSaveProsem(key: string, doc: ProsemDocument) {
    setAkademikData((prev) => ({
      ...prev,
      prosemRecords: { ...prev.prosemRecords, [key]: doc },
    }));
  }

  function handleUpdateClasses(classes: AcademicClass[], selectedClassId: string) {
    setAkademikData((prev) => ({ ...prev, classes, selectedClassId }));
  }

  function handleUpdatePresensi(key: string, map: AttendanceMap) {
    setAkademikData((prev) => ({
      ...prev,
      presensiRecords: { ...prev.presensiRecords, [key]: map },
    }));
  }

  function handleUpdateNilai(key: string, map: GradeSheetMap) {
    setAkademikData((prev) => ({
      ...prev,
      nilaiRecords: { ...prev.nilaiRecords, [key]: map },
    }));
  }

  function handleUpdateNilaiSettings(kktpMinimal: number, bobotFormatif: number) {
    setAkademikData((prev) => ({ ...prev, kktpMinimal, bobotFormatif }));
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* 3-Zone Top Bar */}
      <header className="no-print sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setTab("library");
            }}
            className="text-left cursor-pointer"
          >
            <Brand compact />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = !selectedModul && tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setTab(item.id);
                  }}
                  className={`border-b-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "border-primary text-ink"
                      : "border-transparent text-muted-foreground hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden max-w-[180px] truncate text-xs font-medium text-muted-foreground sm:inline">
              {user.name}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Mobile navigation row */}
        {!selectedModul && (
          <div className="no-print mb-6 flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 md:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex-1 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tab === item.id ? "bg-card text-ink shadow-xs" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {akademikNotice && !selectedModul && (tab === "kurikulum" || tab === "penilaian") && (
          <div className="no-print mb-4 rounded-lg border border-primary/30 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-primary">
            {akademikNotice}
          </div>
        )}

        {selectedModul ? (
          <ModulDocumentView
            key={selectedModul.id}
            modul={selectedModul}
            currentUserId={user.id}
            initialIncludedLampiran={lampiranSelectionMap[selectedModul.id]}
            onBack={() => setSelectedId(null)}
            onSaveEdit={handleSaveEdit}
            onSaveToArchive={handleSaveToArchive}
          />
        ) : tab === "builder" ? (
          <ModulBuilderForm
            user={user}
            token={token}
            onGenerated={(newModul, includedLampiran) => {
              setLampiranSelectionMap((prev) => ({
                ...prev,
                [newModul.id]: includedLampiran,
              }));
              setModules((prev) => [newModul, ...prev]);
              setSelectedId(newModul.id);
              setTab("library");
            }}
            onCancel={() => setTab("library")}
          />
        ) : tab === "kurikulum" ? (
          <div className="space-y-5">
            {/* Segmented Sub-navigation for Kaldik, Prota/Prosem & Cover */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  Perangkat Kurikulum & Penjilidan
                </h1>
                <p className="text-xs text-muted-foreground">
                  Kalender Pendidikan multi-tahun, Prota & Prosem otomatis, serta desain Cover Perangkat Ajar.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  [
                    { id: "kaldik", label: "Kaldik Otomatis" },
                    { id: "prota-prosem", label: "Prota & Prosem" },
                    { id: "cover", label: "Cover Perangkat" },
                  ] as const
                ).map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setKurikulumSubTab(sub.id)}
                    className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      kurikulumSubTab === sub.id
                        ? "bg-card text-ink shadow-xs"
                        : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {kurikulumSubTab === "kaldik" ? (
              <KaldikOtomatisView
                workspace={akademikData}
                kaldik={kaldik}
                onChangeTahunAjaran={handleChangeTahunAjaran}
                onChangeHariSekolah={handleChangeHariSekolah}
                onUpdateDayOverride={handleUpdateDayOverride}
                onResetYearOverrides={handleResetYearOverrides}
                onUpdateMeta={handleUpdateMeta}
                onSaveWorkspace={handleSaveAkademik}
                saving={savingAkademik}
              />
            ) : kurikulumSubTab === "prota-prosem" ? (
              <ProtaProsemView
                workspace={akademikData}
                kaldik={kaldik}
                onChangeTahunAjaran={handleChangeTahunAjaran}
                onSaveProta={handleSaveProta}
                onSaveProsem={handleSaveProsem}
                onUpdateMeta={handleUpdateMeta}
                onSaveWorkspace={handleSaveAkademik}
                saving={savingAkademik}
              />
            ) : (
              <CoverPerangkatView
                workspace={akademikData}
                onUpdateCover={handleUpdateCover}
                onSaveWorkspace={handleSaveAkademik}
                saving={savingAkademik}
              />
            )}
          </div>
        ) : tab === "penilaian" ? (
          <div className="space-y-5">
            <div className="no-print">
              <h1 className="font-display text-2xl font-semibold text-ink">
                Daftar Hadir & Rekap Nilai Otomatis
              </h1>
              <p className="text-xs text-muted-foreground">
                Presensi bulanan sinkron Kaldik, manajemen kelas/rombel, dan rekap nilai Kurikulum Merdeka berbasis KKTP.
              </p>
            </div>
            <PresensiNilaiView
              workspace={akademikData}
              onChangeTahunAjaran={handleChangeTahunAjaran}
              onUpdateClasses={handleUpdateClasses}
              onUpdatePresensi={handleUpdatePresensi}
              onUpdateNilai={handleUpdateNilai}
              onUpdateNilaiSettings={handleUpdateNilaiSettings}
              onUpdateMeta={handleUpdateMeta}
              onSaveWorkspace={handleSaveAkademik}
              saving={savingAkademik}
            />
          </div>
        ) : tab === "guide" ? (
          <PanduanPmView onStartBuilder={() => setTab("builder")} />
        ) : tab === "admin" && isAdmin ? (
          <AdminTeachersView token={token} currentUser={user} />
        ) : (
          <div className="space-y-6">
            {/* Workspace Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold text-ink">
                  Arsip Modul Ajar & LKPD
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user.school} ·{" "}
                  <span className="font-mono font-semibold text-ink tabular-nums">{myModulesCount}</span> tersimpan di akun Anda ·{" "}
                  <span className="font-mono tabular-nums">{modules.length}</span> total tersedia
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportModulesFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  disabled={importingJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="size-3.5 text-primary" />
                  <span>{importingJson ? "Mengimpor..." : "Impor (.json)"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBackupModulesJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="size-3.5 text-primary" />
                  <span>Cadangkan (.json)</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setTab("guide")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BookOpen className="size-3.5 text-primary" />
                    <span>Panduan PM</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTab("builder")}
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="size-4 text-saffron" />
                  <span>Buat Modul Baru</span>
                </button>
              </div>
            </div>

            {archiveNotice && (
              <div
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${
                  archiveNotice.type === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {archiveNotice.text}
              </div>
            )}

            {/* Filter & Search Toolbar */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari judul modul, mata pelajaran, atau topik..."
                    className="h-9 w-full rounded-lg border border-border bg-canvas pr-3 pl-9 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                  {(
                    [
                      { id: "all", label: `Semua (${modules.length})` },
                      { id: "mine", label: `Penyimpanan Saya (${myModulesCount})` },
                      { id: "shared", label: `Template Bersama (${sharedModulesCount})` },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOwnershipFilter(item.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                        ownershipFilter === item.id
                          ? "bg-card text-ink shadow-xs"
                          : "text-muted-foreground hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
                {(["Semua", "SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setJenjangFilter(j)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      jenjangFilter === j
                        ? "bg-card text-ink shadow-xs"
                        : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-card p-6" />
                ))}
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
                <FileText className="mx-auto size-8 text-muted-foreground" />
                <h2 className="mt-3 font-display text-lg font-semibold text-ink">
                  {ownershipFilter === "mine"
                    ? "Penyimpanan akun Anda masih kosong"
                    : "Belum ada modul yang cocok"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ownershipFilter === "mine"
                    ? "Simpan modul dari Template Bersama atau susun Modul Ajar baru untuk mengisi arsip pribadi Anda."
                    : "Ubah kata kunci pencarian atau susun Modul Ajar & LKPD baru sesuai kelas Anda."}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  {ownershipFilter === "mine" && (
                    <button
                      type="button"
                      onClick={() => setOwnershipFilter("all")}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      <span>Lihat Semua Modul</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTab("builder")}
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary cursor-pointer"
                  >
                    <Plus className="size-4 text-saffron" />
                    <span>Susun Modul Baru</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredModules.map((modul) => {
                  const isMine = modul.ownerId === user.id;
                  const canDelete = isAdmin || isMine;
                  const formattedUpdated = modul.updatedAt
                    ? new Date(modul.updatedAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "";
                  return (
                    <article
                      key={modul.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-slate-300"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-muted-foreground tabular-nums">
                          <span>
                            {modul.identitas.jenjang} · {modul.identitas.fase} · {modul.identitas.kelas} ·{" "}
                            {modul.identitas.mataPelajaran} · {modul.identitas.alokasiWaktu} · 8 Lampiran
                          </span>
                        </div>
                        <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                          {modul.identitas.judulModul}
                        </h2>
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                          {modul.identitas.topik}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {isMine ? (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <BookmarkCheck className="size-3.5 shrink-0" />
                                <span>Tersimpan di Akun</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Template Bersama</span>
                            )}
                            {formattedUpdated && (
                              <span className="text-muted-foreground tabular-nums">· {formattedUpdated}</span>
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {modul.identitas.modelPembelajaran}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isMine && (
                            <button
                              type="button"
                              onClick={() => handleSaveToArchive(modul)}
                              disabled={savingModuleId === modul.id}
                              title="Simpan ke Akun Saya"
                              aria-label="Simpan ke Akun Saya"
                              className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-emerald-100 disabled:opacity-60 whitespace-nowrap cursor-pointer"
                            >
                              <BookmarkPlus className="size-3.5" />
                              <span>{savingModuleId === modul.id ? "Menyimpan..." : "Simpan"}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(modul)}
                            title="Duplikat Modul"
                            aria-label="Duplikat Modul"
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-slate-50 hover:text-ink cursor-pointer"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(modul.id)}
                              title="Hapus Modul"
                              aria-label="Hapus Modul"
                              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedId(modul.id)}
                            className="rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary whitespace-nowrap cursor-pointer"
                          >
                            Buka Dokumen
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
