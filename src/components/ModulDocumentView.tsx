import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  BookmarkCheck,
  BookmarkPlus,
  Check,
  Download,
  Edit3,
  FileText,
  Loader2,
  Paperclip,
  Printer,
  X,
} from "lucide-react";
import { DAFTAR_LAMPIRAN, type ModulAjar } from "../types/modul";
import { exportModulToDocx } from "../lib/docxExport";
import { exportModulToPdf } from "../lib/pdfExport";
import { resolveLampiran } from "../lib/lampiranHelper";

interface SaveActionResult {
  ok: boolean;
  message?: string;
}

interface ModulDocumentViewProps {
  modul: ModulAjar;
  currentUserId: string;
  initialIncludedLampiran?: number[];
  onBack: () => void;
  onSaveEdit: (updated: ModulAjar) => Promise<SaveActionResult | void>;
  onSaveToArchive?: (modul: ModulAjar) => Promise<SaveActionResult | void>;
}

export function ModulDocumentView({
  modul,
  currentUserId,
  initialIncludedLampiran,
  onBack,
  onSaveEdit,
  onSaveToArchive,
}: ModulDocumentViewProps) {
  const [sectionView, setSectionView] = useState<"all" | "modul" | "lampiran">("all");
  const [selectedLampiran, setSelectedLampiran] = useState<number[]>(
    (initialIncludedLampiran ?? [1, 2, 3, 4, 5, 6, 7, 8]).filter((id) => id >= 1 && id <= 8)
  );
  const [showLampiranDrawer, setShowLampiranDrawer] = useState(false);
  const [includeCoverAndToc, setIncludeCoverAndToc] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ModulAjar>(modul);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [exportingWord, setExportingWord] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const active = editing ? draft : modul;
  const activeLampiran = resolveLampiran(active);
  const isOwnedByCurrentUser = modul.ownerId === currentUserId;

  function showTimedNotice(type: "ok" | "err", text: string) {
    setSaveNotice({ type, text });
    window.setTimeout(() => setSaveNotice(null), 4500);
  }

  function toggleLampiranItem(id: number) {
    setSelectedLampiran((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  }

  function startEditing() {
    const cloned: ModulAjar = JSON.parse(JSON.stringify(modul));
    const resolved = resolveLampiran(cloned);
    cloned.lampiran = {
      ...resolved,
      ...(cloned.lampiran ?? {}),
      asesmenDiagnostik: cloned.lampiran?.asesmenDiagnostik ?? resolved.asesmenDiagnostik,
      penilaianSikap: cloned.lampiran?.penilaianSikap ?? resolved.penilaianSikap,
      asesmenFormatif: cloned.lampiran?.asesmenFormatif ?? resolved.asesmenFormatif,
      bahanAjar: cloned.lampiran?.bahanAjar ?? resolved.bahanAjar,
      refleksiDanUmpanBalik: cloned.lampiran?.refleksiDanUmpanBalik ?? resolved.refleksiDanUmpanBalik,
      mediaAjar: cloned.lampiran?.mediaAjar ?? resolved.mediaAjar,
      kktp: cloned.lampiran?.kktp ?? resolved.kktp,
      glosariumDanPustaka: cloned.lampiran?.glosariumDanPustaka ?? resolved.glosariumDanPustaka,
    };
    setDraft(cloned);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await onSaveEdit(draft);
      if (result && !result.ok) {
        showTimedNotice("err", result.message || "Gagal menyimpan perubahan modul.");
      } else {
        setEditing(false);
        showTimedNotice(
          "ok",
          result?.message || "Perubahan modul ajar berhasil disimpan ke penyimpanan akun Anda."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveExistingToArchive() {
    if (!onSaveToArchive) return;
    setArchiving(true);
    try {
      const result = await onSaveToArchive(active);
      if (result && !result.ok) {
        showTimedNotice("err", result.message || "Gagal menyimpan modul ke akun Anda.");
      } else {
        showTimedNotice(
          "ok",
          result?.message || "Modul ajar berhasil disimpan ke penyimpanan akun guru Anda."
        );
      }
    } finally {
      setArchiving(false);
    }
  }

  async function handleExportWord() {
    setExportingWord(true);
    try {
      const targetList = sectionView === "modul" ? [] : selectedLampiran;
      await exportModulToDocx(active, targetList, { includeCoverAndToc });
    } finally {
      setExportingWord(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const targetList = sectionView === "modul" ? [] : selectedLampiran;
      await exportModulToPdf(active, targetList, { includeCoverAndToc, sectionView });
    } finally {
      setExportingPdf(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const showModul = sectionView === "all" || sectionView === "modul";
  const showLampiran = sectionView === "all" || sectionView === "lampiran";
  const hasLampiran = (id: number) => selectedLampiran.includes(id);

  return (
    <div className="space-y-4">
      <div className="no-print space-y-3 rounded-xl border border-border bg-card px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali</span>
            </button>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {[
                { id: "all", label: "Lengkap (Modul + 8 Lampiran)" },
                { id: "modul", label: "Modul Ajar" },
                { id: "lampiran", label: "8 Lampiran" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSectionView(tab.id as "all" | "modul" | "lampiran")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sectionView === tab.id
                      ? "bg-card text-ink shadow-xs"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIncludeCoverAndToc((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                includeCoverAndToc
                  ? "border-primary bg-primary/8 text-ink"
                  : "border-border bg-card text-muted-foreground hover:text-ink"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>Sampul & Daftar Isi</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLampiranDrawer((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                showLampiranDrawer
                  ? "border-primary bg-primary/8 text-ink"
                  : "border-border bg-card text-ink hover:bg-slate-50"
              }`}
            >
              <Paperclip className="size-3.5" />
              <span>Lampiran ({selectedLampiran.length}/8)</span>
            </button>

            {!editing && onSaveToArchive && !isOwnedByCurrentUser && (
              <button
                type="button"
                onClick={handleSaveExistingToArchive}
                disabled={archiving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-emerald-100 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {archiving ? <Loader2 className="size-3.5 animate-spin" /> : <BookmarkPlus className="size-3.5" />}
                <span>Simpan ke Akun</span>
              </button>
            )}

            {!editing && isOwnedByCurrentUser && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-primary whitespace-nowrap shrink-0">
                <BookmarkCheck className="size-3.5" />
                <span>Tersimpan di Akun</span>
              </span>
            )}

            {!editing ? (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>Sunting Teks</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(modul);
                    setEditing(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-ink whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <X className="size-3.5" />
                  <span>Batal</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-ink whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  <span>Simpan</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-emerald-100 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {exportingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
              <span>{exportingPdf ? "Menyiapkan PDF..." : "Unduh PDF (.pdf)"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              disabled={exportingWord}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {exportingWord ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              <span>Unduh Word (.docx)</span>
            </button>
          </div>
        </div>

        {saveNotice && (
          <div
            className={`rounded-lg border px-3.5 py-2 text-xs font-medium ${
              saveNotice.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {saveNotice.text}
          </div>
        )}

        {/* Checklist Lampiran Drawer */}
        {showLampiranDrawer && (
          <div className="border-t border-border pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
              <p className="text-xs font-medium text-muted-foreground">
                Pilih lampiran yang digabungkan ke dalam satu berkas Modul Ajar saat dicetak (PDF) atau diunduh ke Word (.docx):
              </p>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedLampiran([1, 2, 3, 4, 5, 6, 7, 8])}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Pilih Semua (8)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLampiran([])}
                  className="font-medium text-muted-foreground hover:text-ink cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {DAFTAR_LAMPIRAN.map((item) => {
                const checked = hasLampiran(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer ${
                      checked
                        ? "border-primary bg-primary/5 text-ink"
                        : "border-border bg-canvas text-muted-foreground hover:text-ink"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleLampiranItem(item.id)}
                      className="mt-0.5 size-3.5 accent-primary"
                    />
                    <span className="leading-snug font-medium">{item.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* A4 Document Sheet */}
      <article className="print-container mx-auto max-w-[210mm] rounded-xl border border-border bg-card px-7 pt-4 pb-6 md:px-9 md:pt-5 md:pb-7 text-slate-900">
        {includeCoverAndToc && (
          <div className="space-y-5">
            {/* Halaman Sampul Penjilidan */}
            <section className="rounded-lg border border-border bg-slate-50/50 px-5 py-4 text-center">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Perangkat Pembelajaran Kurikulum Merdeka
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Pendekatan Pembelajaran Mendalam (Deep Learning)
              </p>

              <div className="my-4 border-y-2 border-ink bg-card px-5 py-4">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Modul Ajar Lengkap & Lampiran Perangkat
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink text-balance">
                  {active.identitas.judulModul}
                </h2>
                <p className="mt-1.5 text-sm text-slate-700">
                  Mata Pelajaran: {active.identitas.mataPelajaran} · {active.identitas.jenjang} (
                  {active.identitas.fase} / {active.identitas.kelas})
                </p>
              </div>

              <table className="mx-auto w-full border-collapse text-left text-xs">
                <tbody>
                  {[
                    ["Satuan Pendidikan", active.identitas.sekolah],
                    ["Tahun Ajaran", active.identitas.tahunAjaran],
                    ["Topik / Materi Pokok", active.identitas.topik],
                    [
                      "Alokasi Waktu",
                      `${active.identitas.alokasiWaktu} (${active.identitas.jumlahPertemuan} Pertemuan)`,
                    ],
                    ["Model Pembelajaran", active.identitas.modelPembelajaran],
                    [
                      "Guru Penyusun",
                      `${active.identitas.penyusun}${
                        active.identitas.nipGuru ? ` (NIP. ${active.identitas.nipGuru})` : ""
                      }`,
                    ],
                    [
                      "Kepala Sekolah",
                      `${active.identitas.namaKepalaSekolah || "........................................"}${
                        active.identitas.nipKepalaSekolah
                          ? ` (NIP. ${active.identitas.nipKepalaSekolah})`
                          : ""
                      }`,
                    ],
                  ].map(([lbl, val]) => (
                    <tr key={String(lbl)} className="border-b border-border bg-card align-top">
                      <td className="w-44 bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">{lbl}</td>
                      <td className="px-3 py-1.5 text-slate-800 text-justify align-top">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Halaman Daftar Isi Lengkap Siap Jilid */}
            <section className="print-page-break space-y-2.5 border-b-2 border-dashed border-border pb-5">
              <header className="border-b-2 border-ink pb-2.5 text-center">
                <h2 className="font-display text-xl font-semibold text-ink">DAFTAR ISI</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Kelengkapan Berkas Penjilidan · {active.identitas.judulModul}
                </p>
              </header>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-ink text-ink-foreground">
                    <th className="w-24 border border-ink px-3 py-2 text-left font-semibold">Bagian</th>
                    <th className="border border-ink px-3 py-2 text-left font-semibold">
                      Uraian Komponen Modul Ajar & Lampiran
                    </th>
                    <th className="w-32 border border-ink px-3 py-2 text-center font-semibold">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showModul && (
                    <>
                      {[
                        { kode: "Bagian I", judul: "Halaman Sampul / Identitas Penjilidan", ket: "Hal. i", href: "#" },
                        { kode: "Bagian II", judul: "Daftar Isi Modul Ajar Lengkap", ket: "Hal. ii", href: "#" },
                        { kode: "A", judul: "Identitas Modul Ajar", ket: "Modul Inti", href: "#bagian-a" },
                        {
                          kode: "B",
                          judul: "Identifikasi Kesiapan Murid & Dimensi Profil Lulusan",
                          ket: "Modul Inti",
                          href: "#bagian-b",
                        },
                        {
                          kode: "C",
                          judul: "Desain Pembelajaran (CP, TP, Pemahaman Bermakna & Kerangka PM)",
                          ket: "Modul Inti",
                          href: "#bagian-c",
                        },
                        {
                          kode: "D",
                          judul: "Pengalaman Belajar (Memahami, Mengaplikasi, Merefleksi)",
                          ket: "Modul Inti",
                          href: "#bagian-d",
                        },
                        {
                          kode: "E",
                          judul: "Asesmen Pembelajaran (Awal, Formatif, Sumatif)",
                          ket: "Modul Inti",
                          href: "#bagian-e",
                        },
                        { kode: "F", judul: "Glosarium & Daftar Pustaka", ket: "Penutup Modul", href: "#bagian-f" },
                        {
                          kode: "TTD",
                          judul: "Lembar Pengesahan Kepala Sekolah & Guru Mata Pelajaran",
                          ket: "Pengesahan",
                          href: "#pengesahan",
                        },
                      ].map((row) => (
                        <tr key={row.kode} className="align-top">
                          <td className="border border-border bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                            {row.kode}
                          </td>
                          <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">
                            <a href={row.href} className="hover:text-primary hover:underline">
                              {row.judul}
                            </a>
                          </td>
                          <td className="border border-border px-3 py-1.5 text-center text-muted-foreground align-top">
                            {row.ket}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {showLampiran &&
                    DAFTAR_LAMPIRAN.filter((item) => hasLampiran(item.id)).map((item) => {
                      const colonIdx = item.title.indexOf(":");
                      const kode = colonIdx > -1 ? item.title.slice(0, colonIdx) : `Lampiran ${item.id}`;
                      const judul = colonIdx > -1 ? item.title.slice(colonIdx + 1).trim() : item.title;
                      return (
                        <tr key={item.id} className="align-top">
                          <td className="border border-border bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                            {kode}
                          </td>
                          <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">
                            <a href={`#lampiran-${item.id}`} className="hover:text-primary hover:underline">
                              {judul}
                            </a>
                          </td>
                          <td className="border border-border px-3 py-1.5 text-center text-muted-foreground align-top">
                            Lampiran Terpadu
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              <p className="text-xs italic text-muted-foreground text-justify">
                Catatan Penjilidan: Berkas ini memuat Modul Ajar lengkap dan{" "}
                <span className="font-mono tabular-nums">{showLampiran ? selectedLampiran.length : 0}</span>{" "}
                Lampiran terintegrasi siap cetak/jilid ukuran A4.
              </p>
            </section>
          </div>
        )}

        {showModul && (
          <div className={includeCoverAndToc ? "pt-2 print-page-break" : ""}>
            {/* Document Header */}
            <header className="border-b-2 border-ink pb-3 text-center">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Modul Ajar Kurikulum Merdeka · Pendekatan Pembelajaran Mendalam
              </p>
              {editing ? (
                <input
                  type="text"
                  value={draft.identitas.judulModul}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      identitas: { ...draft.identitas, judulModul: e.target.value },
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-center font-display text-2xl font-semibold text-ink"
                />
              ) : (
                <h1 className="mt-1 font-display text-2xl font-semibold text-ink text-balance">
                  {active.identitas.judulModul}
                </h1>
              )}
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                {active.identitas.jenjang} · {active.identitas.fase} · {active.identitas.kelas} ·{" "}
                {active.identitas.mataPelajaran} · {active.identitas.alokasiWaktu}
              </p>
            </header>

            {/* A. Identitas Modul */}
            <section id="bagian-a" className="mt-3.5 scroll-mt-20">
              <h2 className="border-b border-border pb-1 font-display text-base font-semibold text-ink">
                A. Identitas Modul
              </h2>
              <table className="mt-2 w-full border-collapse text-sm">
                <tbody>
                  {[
                    ["Nama Penyusun", active.identitas.penyusun, "penyusun"],
                    ["Satuan Pendidikan", active.identitas.sekolah, "sekolah"],
                    ["Tahun Ajaran", active.identitas.tahunAjaran, "tahunAjaran"],
                    [
                      "Jenjang / Fase / Kelas",
                      `${active.identitas.jenjang} / ${active.identitas.fase} / ${active.identitas.kelas}`,
                      null,
                    ],
                    ["Mata Pelajaran", active.identitas.mataPelajaran, null],
                    ["Topik / Materi Pokok", active.identitas.topik, "topik"],
                    [
                      "Alokasi Waktu",
                      `${active.identitas.alokasiWaktu} (${active.identitas.jumlahPertemuan} Pertemuan)`,
                      null,
                    ],
                    ["Model Pembelajaran", active.identitas.modelPembelajaran, null],
                  ].map(([label, val, field]) => (
                    <tr key={String(label)} className="border-b border-border align-top">
                      <td className="w-48 bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                        {label}
                      </td>
                      <td className="px-3 py-1.5 text-slate-800 text-justify align-top">
                        {editing && field ? (
                          <input
                            type="text"
                            value={String(draft.identitas[field as keyof typeof draft.identitas])}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                identitas: { ...draft.identitas, [field]: e.target.value },
                              })
                            }
                            className="w-full rounded border border-border px-2 py-1 text-sm"
                          />
                        ) : (
                          val
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* B. Identifikasi */}
            <section id="bagian-b" className="mt-3.5 scroll-mt-20 space-y-2.5">
              <h2 className="border-b border-border pb-1 font-display text-base font-semibold text-ink">
                B. Identifikasi Kesiapan & Dimensi Profil Lulusan
              </h2>
              <div>
                <h3 className="text-xs font-semibold text-primary">Kesiapan Belajar Murid</h3>
                {editing ? (
                  <textarea
                    rows={3}
                    value={draft.identifikasi.kesiapanMurid}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        identifikasi: { ...draft.identifikasi, kesiapanMurid: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border p-2.5 text-sm leading-relaxed"
                  />
                ) : (
                  <p className="mt-1 text-sm leading-relaxed text-slate-800 text-justify">
                    {active.identifikasi.kesiapanMurid}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-primary">Karakteristik Materi</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-800 text-justify">
                  {active.identifikasi.karakteristikMateri}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-primary">Dimensi Profil Lulusan</h3>
                <p className="mt-1 text-sm text-slate-800 text-justify">
                  {active.identifikasi.dimensiProfilLulusan.join(" · ")}
                </p>
              </div>
            </section>

            {/* C. Desain Pembelajaran */}
            <section id="bagian-c" className="mt-3.5 scroll-mt-20 space-y-2.5">
              <h2 className="border-b border-border pb-1 font-display text-base font-semibold text-ink">
                C. Desain Pembelajaran
              </h2>
              <div>
                <h3 className="text-xs font-semibold text-primary">Capaian Pembelajaran (CP)</h3>
                {editing ? (
                  <textarea
                    rows={2}
                    value={draft.desainPembelajaran.capaianPembelajaran}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        desainPembelajaran: {
                          ...draft.desainPembelajaran,
                          capaianPembelajaran: e.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border p-2.5 text-sm leading-relaxed"
                  />
                ) : (
                  <p className="mt-1 text-sm leading-relaxed text-slate-800 text-justify">
                    {active.desainPembelajaran.capaianPembelajaran}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary">Tujuan Pembelajaran (TP)</h3>
                {editing ? (
                  <textarea
                    rows={4}
                    value={draft.desainPembelajaran.tujuanPembelajaran.join("\n")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        desainPembelajaran: {
                          ...draft.desainPembelajaran,
                          tujuanPembelajaran: e.target.value.split("\n"),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border p-2.5 text-sm leading-relaxed"
                  />
                ) : (
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                    {active.desainPembelajaran.tujuanPembelajaran.map((tp, i) => (
                      <li key={i}>{tp}</li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="rounded-lg border border-border bg-slate-50/70 p-3">
                <h3 className="text-xs font-semibold text-primary">Pemahaman Bermakna</h3>
                {editing ? (
                  <textarea
                    rows={2}
                    value={draft.desainPembelajaran.pemahamanBermakna}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        desainPembelajaran: {
                          ...draft.desainPembelajaran,
                          pemahamanBermakna: e.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-card p-2 text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm leading-relaxed text-slate-800 text-justify">
                    {active.desainPembelajaran.pemahamanBermakna}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary">Pertanyaan Pemantik</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                  {active.desainPembelajaran.pertanyaanPemantik.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-2.5 pt-0.5 sm:grid-cols-2 print:grid-cols-2">
                <div className="rounded-lg border border-border p-2.5">
                  <div className="text-xs font-semibold text-primary">Praktik Pedagogis</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 text-justify">
                    {active.desainPembelajaran.praktikPedagogis}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <div className="text-xs font-semibold text-primary">Kemitraan Pembelajaran</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 text-justify">
                    {active.desainPembelajaran.kemitraanPembelajaran}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <div className="text-xs font-semibold text-primary">Lingkungan Belajar</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 text-justify">
                    {active.desainPembelajaran.lingkunganBelajar}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <div className="text-xs font-semibold text-primary">Pemanfaatan Digital</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 text-justify">
                    {active.desainPembelajaran.pemanfaatanDigital}
                  </p>
                </div>
              </div>
            </section>

            {/* D. Pengalaman Belajar */}
            <section id="bagian-d" className="mt-3.5 scroll-mt-20 space-y-2.5">
              <h2 className="border-b border-border pb-1 font-display text-base font-semibold text-ink">
                D. Pengalaman Belajar (Langkah Pembelajaran Mendalam)
              </h2>

              <div>
                <h3 className="text-xs font-semibold text-primary">1. Kegiatan Awal</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                  {active.pengalamanBelajar.kegiatanAwal.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-primary">2. Kegiatan Inti</h3>
                {active.pengalamanBelajar.kegiatanInti.map((step, idx) => (
                  <div key={idx} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-1.5">
                      <div className="text-sm font-semibold text-ink">
                        Tahap {idx + 1}: {step.phase}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        Prinsip {step.principle} · {step.durationMinutes} menit
                      </div>
                    </div>
                    <div className="mt-2 grid gap-4 md:grid-cols-2 print:grid-cols-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">Aktivitas Guru</div>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                          {step.teacherActivities.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-600">Aktivitas Murid</div>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                          {step.studentActivities.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary">3. Kegiatan Penutup</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                  {active.pengalamanBelajar.kegiatanPenutup.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* E. Asesmen Pembelajaran */}
            <section id="bagian-e" className="mt-3.5 scroll-mt-20 space-y-2.5">
              <h2 className="border-b border-border pb-1 font-display text-base font-semibold text-ink">
                E. Asesmen Pembelajaran
              </h2>
              <div className="space-y-1.5 text-sm leading-relaxed text-slate-800 text-justify">
                <p>
                  <span className="font-semibold text-ink">Asesmen Awal:</span>{" "}
                  {active.asesmen.asesmenAwal}
                </p>
                <p>
                  <span className="font-semibold text-ink">Asesmen Formatif:</span>{" "}
                  {active.asesmen.asesmenFormatif}
                </p>
                <p>
                  <span className="font-semibold text-ink">Asesmen Sumatif:</span>{" "}
                  {active.asesmen.asesmenSumatif}
                </p>
              </div>
            </section>

            {/* F. Glosarium & Daftar Pustaka (Akhir Modul Ajar) */}
            <section id="bagian-f" className="mt-3.5 scroll-mt-20 space-y-2.5">
              <h2 className="border-b border-border pb-1 font-display text-base font-semibold text-ink">
                F. Glosarium & Daftar Pustaka
              </h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-ink text-ink-foreground">
                    <th className="w-48 border border-ink px-3 py-1.5 text-left font-semibold">Istilah</th>
                    <th className="border border-ink px-3 py-1.5 text-left font-semibold">Definisi</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLampiran.glosariumDanPustaka.glosarium.map((g, i) => (
                    <tr key={i} className="align-top">
                      <td className="border border-border bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                        {g.istilah}
                      </td>
                      <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">{g.definisi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <h3 className="text-xs font-semibold text-primary">Daftar Pustaka</h3>
                {editing && draft.lampiran ? (
                  <textarea
                    rows={3}
                    value={draft.lampiran.glosariumDanPustaka.daftarPustaka.join("\n")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lampiran: {
                          ...draft.lampiran!,
                          glosariumDanPustaka: {
                            ...draft.lampiran!.glosariumDanPustaka,
                            daftarPustaka: e.target.value.split("\n"),
                          },
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-border p-2 text-xs leading-relaxed"
                  />
                ) : (
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                    {activeLampiran.glosariumDanPustaka.daftarPustaka.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Pengesahan: TTD Kepala Sekolah & Guru Mata Pelajaran */}
            <section id="pengesahan" className="mt-6 scroll-mt-20 print-avoid-break border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold text-ink">Kepala Sekolah</p>
                  <div className="h-12" />
                  {editing ? (
                    <div className="space-y-1.5 pr-4">
                      <input
                        type="text"
                        value={draft.identitas.namaKepalaSekolah ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            identitas: { ...draft.identitas, namaKepalaSekolah: e.target.value },
                          })
                        }
                        placeholder="Nama Kepala Sekolah & Gelar"
                        className="w-full rounded border border-border px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={draft.identitas.nipKepalaSekolah ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            identitas: { ...draft.identitas, nipKepalaSekolah: e.target.value },
                          })
                        }
                        placeholder="NIP Kepala Sekolah"
                        className="w-full rounded border border-border px-2 py-1 text-xs"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-ink underline underline-offset-4">
                        {active.identitas.namaKepalaSekolah || "...................................................."}
                      </p>
                      <p className="mt-1">
                        NIP. {active.identitas.nipKepalaSekolah || "..........................................."}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={draft.identitas.kotaTanggal ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          identitas: { ...draft.identitas, kotaTanggal: e.target.value },
                        })
                      }
                      placeholder="Tempat, Tanggal Bulan Tahun"
                      className="mb-1 w-full rounded border border-border px-2 py-1 text-xs"
                    />
                  ) : (
                    <p>{active.identitas.kotaTanggal || "...................., ...................... 2026"}</p>
                  )}
                  <p className="font-semibold text-ink">Guru Mata Pelajaran</p>
                  <div className="h-12" />
                  <p className="font-semibold text-ink underline underline-offset-4">
                    {active.identitas.penyusun}
                  </p>
                  {editing ? (
                    <input
                      type="text"
                      value={draft.identitas.nipGuru ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          identitas: { ...draft.identitas, nipGuru: e.target.value },
                        })
                      }
                      placeholder="NIP Guru Mata Pelajaran"
                      className="mt-1.5 w-full rounded border border-border px-2 py-1 text-xs"
                    />
                  ) : (
                    <p className="mt-1">
                      NIP. {active.identitas.nipGuru || "..........................................."}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 8 LAMPIRAN TERINTEGRASI */}
        {showLampiran && selectedLampiran.length > 0 && (
          <div className={showModul ? "mt-6 border-t-2 border-dashed border-border pt-5 print-page-break" : ""}>
            <header className="border-b-2 border-ink pb-3 text-center">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Lampiran Perangkat Ajar ({selectedLampiran.length} Lampiran Terpadu)
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-ink text-balance">
                {active.identitas.judulModul}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                {active.identitas.jenjang} · {active.identitas.mataPelajaran} · {active.identitas.kelas} ({active.identitas.fase})
              </p>
              <div className="no-print mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
                {DAFTAR_LAMPIRAN.filter((item) => hasLampiran(item.id)).map((item) => (
                  <a
                    key={item.id}
                    href={`#lampiran-${item.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Lampiran {item.id}
                  </a>
                ))}
              </div>
            </header>

            <div className="mt-3.5 space-y-4">
              {/* Lampiran 1: Asesmen Diagnostik */}
              {hasLampiran(1) && (
                <section id="lampiran-1" className="scroll-mt-20 space-y-2.5">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 1: Asesmen Diagnostik
                  </h3>
                  {editing && draft.lampiran?.asesmenDiagnostik ? (
                    <textarea
                      rows={2}
                      value={draft.lampiran.asesmenDiagnostik.tujuanDiagnostik}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lampiran: {
                            ...draft.lampiran!,
                            asesmenDiagnostik: {
                              ...draft.lampiran!.asesmenDiagnostik!,
                              tujuanDiagnostik: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border p-2 text-sm leading-relaxed"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-slate-800 text-justify">
                      <span className="font-semibold text-ink">Tujuan Pemetaan Awal:</span>{" "}
                      {activeLampiran.asesmenDiagnostik.tujuanDiagnostik}
                    </p>
                  )}

                  <div className="rounded-lg border border-border p-3.5">
                    <h4 className="text-xs font-semibold text-primary">
                      A. Asesmen Diagnostik Non-Kognitif (Kesiapan & Gaya Belajar)
                    </h4>
                    {editing && draft.lampiran?.asesmenDiagnostik ? (
                      <textarea
                        rows={3}
                        value={draft.lampiran.asesmenDiagnostik.diagnostikNonKognitif.join("\n")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            lampiran: {
                              ...draft.lampiran!,
                              asesmenDiagnostik: {
                                ...draft.lampiran!.asesmenDiagnostik!,
                                diagnostikNonKognitif: e.target.value.split("\n"),
                              },
                            },
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-border p-2 text-xs leading-relaxed"
                      />
                    ) : (
                      <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                        {activeLampiran.asesmenDiagnostik.diagnostikNonKognitif.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold text-primary">
                      B. Asesmen Diagnostik Kognitif (Pemetaan Prasyarat Materi)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-ink text-ink-foreground">
                            <th className="w-10 border border-ink px-2.5 py-2 text-left font-semibold">No</th>
                            <th className="border border-ink px-2.5 py-2 text-left font-semibold">
                              Pertanyaan Diagnostik
                            </th>
                            <th className="w-48 border border-ink px-2.5 py-2 text-left font-semibold">
                              Tujuan Pemetaan
                            </th>
                            <th className="w-56 border border-ink px-2.5 py-2 text-left font-semibold">
                              Tindak Lanjut Diferensiasi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeLampiran.asesmenDiagnostik.diagnostikKognitif.map((item) => (
                            <tr key={item.nomor} className="align-top">
                              <td className="border border-border bg-slate-50 px-2.5 py-1.5 font-mono font-semibold text-ink tabular-nums align-top">
                                {item.nomor}
                              </td>
                              <td className="border border-border px-2.5 py-1.5 text-slate-800 text-justify align-top">
                                {item.pertanyaan}
                              </td>
                              <td className="border border-border px-2.5 py-1.5 text-slate-700 text-justify align-top">
                                {item.tujuanPemetaan}
                              </td>
                              <td className="border border-border px-2.5 py-1.5 text-slate-700 text-justify align-top">
                                {item.tindakLanjut}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Lampiran 2: Penilaian Non Tes (Penilaian Sikap) */}
              {hasLampiran(2) && (
                <section id="lampiran-2" className="scroll-mt-20 space-y-3">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 2: Penilaian Non Tes (Penilaian Sikap)
                  </h3>
                  <div className="space-y-1 text-xs leading-relaxed text-slate-800 text-justify">
                    <p>
                      <span className="font-semibold text-ink">Teknik & Instrumen:</span>{" "}
                      {activeLampiran.penilaianSikap.teknikPenilaian}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Skala Penilaian:</span>{" "}
                      {activeLampiran.penilaianSikap.skalaKeterangan}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-ink text-ink-foreground">
                          <th className="w-10 border border-ink px-2.5 py-2 text-left font-semibold">No</th>
                          <th className="w-44 border border-ink px-2.5 py-2 text-left font-semibold">
                            Dimensi Profil Lulusan
                          </th>
                          <th className="border border-ink px-2.5 py-2 text-left font-semibold">
                            Indikator Sikap yang Diamati
                          </th>
                          <th className="border border-ink px-2.5 py-2 text-left font-semibold">
                            Kriteria Teramati (SB/B)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLampiran.penilaianSikap.aspekSikap.map((aspek, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="border border-border bg-slate-50 px-2.5 py-1.5 font-mono font-semibold text-ink tabular-nums align-top">
                              {idx + 1}
                            </td>
                            <td className="border border-border bg-slate-50/50 px-2.5 py-1.5 font-semibold text-ink align-top">
                              {aspek.dimensi}
                            </td>
                            <td className="border border-border px-2.5 py-1.5 text-slate-800 text-justify align-top">
                              {aspek.indikator}
                            </td>
                            <td className="border border-border px-2.5 py-1.5 text-slate-700 text-justify align-top">
                              {aspek.kriteriaTampak}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold text-primary">
                      Lembar Observasi Sikap Peserta Didik (Siap Cetak)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-ink">
                            <th className="w-10 border border-border px-2 py-1.5 text-center font-semibold">No</th>
                            <th className="border border-border px-2.5 py-1.5 text-left font-semibold">
                              Nama Peserta Didik
                            </th>
                            {activeLampiran.penilaianSikap.aspekSikap.map((aspek, idx) => (
                              <th
                                key={idx}
                                className="border border-border px-2 py-1.5 text-center font-semibold"
                              >
                                {aspek.dimensi.split(" ")[0]} (SB/B/C/PB)
                              </th>
                            ))}
                            <th className="w-40 border border-border px-2.5 py-1.5 text-left font-semibold">
                              Catatan Guru
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map((rowNo) => (
                            <tr key={rowNo} className="align-top">
                              <td className="border border-border px-2 py-1.5 text-center font-mono text-slate-600 tabular-nums align-top">
                                {rowNo}
                              </td>
                              <td className="border border-border px-2.5 py-1.5 text-slate-400 align-top">
                                .............................................
                              </td>
                              {activeLampiran.penilaianSikap.aspekSikap.map((_, idx) => (
                                <td key={idx} className="border border-border px-2 py-1.5 text-center text-slate-300 align-top">
                                  {" "}
                                </td>
                              ))}
                              <td className="border border-border px-2.5 py-1.5 text-slate-300 align-top"> </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Lampiran 3: Asesmen Formatif */}
              {hasLampiran(3) && (
                <section id="lampiran-3" className="scroll-mt-20 space-y-3">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 3: Asesmen Formatif
                  </h3>
                  {editing && draft.lampiran?.asesmenFormatif ? (
                    <textarea
                      rows={2}
                      value={draft.lampiran.asesmenFormatif.petunjukPengerjaan}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lampiran: {
                            ...draft.lampiran!,
                            asesmenFormatif: {
                              ...draft.lampiran!.asesmenFormatif!,
                              petunjukPengerjaan: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border p-2.5 text-sm leading-relaxed"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-slate-700 text-justify">
                      {activeLampiran.asesmenFormatif.petunjukPengerjaan}
                    </p>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-ink text-ink-foreground">
                          <th className="w-10 border border-ink px-2.5 py-2 text-left font-semibold">No</th>
                          <th className="w-44 border border-ink px-2.5 py-2 text-left font-semibold">
                            Indikator & Level
                          </th>
                          <th className="border border-ink px-2.5 py-2 text-left font-semibold">
                            Butir Pertanyaan
                          </th>
                          <th className="border border-ink px-2.5 py-2 text-left font-semibold">
                            Kunci / Kriteria Jawaban
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLampiran.asesmenFormatif.daftarSoal.map((s) => (
                          <tr key={s.nomor} className="align-top">
                            <td className="border border-border bg-slate-50 px-2.5 py-1.5 font-mono font-semibold text-ink tabular-nums align-top">
                              {s.nomor}
                            </td>
                            <td className="border border-border px-2.5 py-1.5 text-slate-700 align-top">
                              <div className="font-semibold text-ink">{s.levelKognitif}</div>
                              <div className="mt-0.5 text-justify">{s.indikator}</div>
                            </td>
                            <td className="border border-border px-2.5 py-1.5 text-slate-800 text-justify align-top">
                              {s.pertanyaan}
                            </td>
                            <td className="border border-border px-2.5 py-1.5 text-slate-700 text-justify align-top">
                              {s.kunciJawaban}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-border bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-800 space-y-1 text-justify">
                    <p>
                      <span className="font-semibold text-ink">Rumus Skor:</span>{" "}
                      {activeLampiran.asesmenFormatif.pedomanPenskoran.rumusNilai}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Kriteria Ketuntasan:</span>{" "}
                      {activeLampiran.asesmenFormatif.pedomanPenskoran.kriteriaKetuntasan}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Tindak Lanjut:</span>{" "}
                      {activeLampiran.asesmenFormatif.pedomanPenskoran.catatanTindakLanjut}
                    </p>
                  </div>
                </section>
              )}

              {/* Lampiran 4: Bahan Ajar */}
              {hasLampiran(4) && (
                <section id="lampiran-4" className="scroll-mt-20 space-y-3">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 4: Bahan Ajar
                  </h3>
                  <p className="text-sm font-semibold text-primary">
                    {activeLampiran.bahanAjar.judulBahanAjar}
                  </p>
                  {editing && draft.lampiran?.bahanAjar ? (
                    <div className="space-y-2.5">
                      <textarea
                        rows={4}
                        value={draft.lampiran.bahanAjar.ringkasanMateri}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            lampiran: {
                              ...draft.lampiran!,
                              bahanAjar: {
                                ...draft.lampiran!.bahanAjar!,
                                ringkasanMateri: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-border p-2.5 text-sm leading-relaxed"
                      />
                      <textarea
                        rows={3}
                        value={draft.lampiran.bahanAjar.poinKonsepKunci.join("\n")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            lampiran: {
                              ...draft.lampiran!,
                              bahanAjar: {
                                ...draft.lampiran!.bahanAjar!,
                                poinKonsepKunci: e.target.value.split("\n"),
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-border p-2.5 text-sm leading-relaxed"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed text-slate-800 text-justify">
                        {activeLampiran.bahanAjar.ringkasanMateri}
                      </p>
                      <div>
                        <h4 className="text-xs font-semibold text-primary">Poin Konsep Kunci</h4>
                        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800 text-justify">
                          {activeLampiran.bahanAjar.poinKonsepKunci.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 text-justify">
                        <span className="font-semibold text-ink">Referensi Bahan Ajar:</span>{" "}
                        {activeLampiran.bahanAjar.sumberReferensiGuru}
                      </p>
                    </>
                  )}
                </section>
              )}

              {/* Lampiran 5: Lembar Kerja Peserta Didik (LKPD) */}
              {hasLampiran(5) && (
                <section id="lampiran-5" className="scroll-mt-20 space-y-2.5">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 5: Lembar Kerja Peserta Didik (LKPD)
                  </h3>
                  {editing ? (
                    <input
                      type="text"
                      value={draft.lkpd.judulLkpd}
                      onChange={(e) =>
                        setDraft({ ...draft, lkpd: { ...draft.lkpd, judulLkpd: e.target.value } })
                      }
                      className="w-full rounded-lg border border-border bg-canvas px-3 py-1.5 text-sm font-semibold text-ink"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-primary">{active.lkpd.judulLkpd}</p>
                  )}

                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="align-top">
                        <td className="w-44 border border-border bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                          Nama / Kelompok
                        </td>
                        <td className="border border-border px-3 py-1.5 text-slate-400 align-top">
                          ....................................................................................
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="border border-border bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                          Kelas / Tanggal
                        </td>
                        <td className="border border-border px-3 py-1.5 text-slate-600 align-top">
                          {active.identitas.kelas} / ..........................................
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div>
                    <h4 className="text-xs font-semibold text-primary">Tujuan Kegiatan</h4>
                    {editing ? (
                      <textarea
                        rows={2}
                        value={draft.lkpd.tujuanLkpd}
                        onChange={(e) =>
                          setDraft({ ...draft, lkpd: { ...draft.lkpd, tujuanLkpd: e.target.value } })
                        }
                        className="mt-1 w-full rounded-lg border border-border p-2 text-sm leading-relaxed"
                      />
                    ) : (
                      <p className="mt-1 text-sm leading-relaxed text-slate-800 text-justify">{active.lkpd.tujuanLkpd}</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <h4 className="text-xs font-semibold text-primary">Petunjuk Belajar</h4>
                      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                        {active.lkpd.petunjukBelajar.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <h4 className="text-xs font-semibold text-primary">Alat, Bahan & Sumber</h4>
                      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                        {active.lkpd.alatDanBahan.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {active.lkpd.aktivitas.map((act) => (
                      <div key={act.stepNumber} className="rounded-lg border border-border p-3.5">
                        <h4 className="text-sm font-semibold text-ink">
                          Aktivitas {act.stepNumber}: {act.title}
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700 text-justify">{act.instruction}</p>
                        <div className="mt-2.5 space-y-3">
                          {act.promptQuestions.map((q, qi) => (
                            <div key={qi}>
                              <p className="text-sm font-medium text-ink text-justify">
                                {qi + 1}. {q}
                              </p>
                              <div className="mt-1.5 space-y-3">
                                {Array.from({ length: Math.max(2, act.answerLines) }).map((_, lineIdx) => (
                                  <div key={lineIdx} className="h-4 border-b border-dotted border-slate-300" />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Lampiran 6: Lembar Refleksi & Umpan Balik Peserta Didik */}
              {hasLampiran(6) && (
                <section id="lampiran-6" className="scroll-mt-20 space-y-3">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 6: Lembar Refleksi & Umpan Balik Peserta Didik
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    {activeLampiran.refleksiDanUmpanBalik.petunjukPengisian}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <h4 className="text-xs font-semibold text-primary">Refleksi Peserta Didik</h4>
                      {activeLampiran.refleksiDanUmpanBalik.refleksiPesertaDidik.map((q, i) => (
                        <div key={i}>
                          <p className="text-xs leading-relaxed text-slate-800 text-justify">
                            {i + 1}. {q}
                          </p>
                          <div className="mt-2 h-4 border-b border-dotted border-slate-300" />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <h4 className="text-xs font-semibold text-primary">Umpan Balik Peserta Didik</h4>
                      {activeLampiran.refleksiDanUmpanBalik.umpanBalikPesertaDidik.map((q, i) => (
                        <div key={i}>
                          <p className="text-xs leading-relaxed text-slate-800 text-justify">
                            {i + 1}. {q}
                          </p>
                          <div className="mt-2 h-4 border-b border-dotted border-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50/70 p-3">
                    <h4 className="text-xs font-semibold text-primary">Rencana Tindak Lanjut Guru</h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                      {activeLampiran.refleksiDanUmpanBalik.tindakLanjutGuru.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Lampiran 7: Media Ajar (Otomatis & Relevan) */}
              {hasLampiran(7) && (
                <section id="lampiran-7" className="scroll-mt-20 space-y-3">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 7: Media Ajar
                  </h3>
                  {editing && draft.lampiran?.mediaAjar ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-xs font-semibold text-primary">Media Ajar Utama</label>
                        <textarea
                          rows={3}
                          value={draft.lampiran.mediaAjar.mediaUtama.join("\n")}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              lampiran: {
                                ...draft.lampiran!,
                                mediaAjar: {
                                  ...draft.lampiran!.mediaAjar!,
                                  mediaUtama: e.target.value.split("\n"),
                                },
                              },
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-border p-2 text-xs leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-primary">Alat & Bahan Pendukung</label>
                        <textarea
                          rows={3}
                          value={draft.lampiran.mediaAjar.alatDanBahanPendukung.join("\n")}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              lampiran: {
                                ...draft.lampiran!,
                                mediaAjar: {
                                  ...draft.lampiran!.mediaAjar!,
                                  alatDanBahanPendukung: e.target.value.split("\n"),
                                },
                              },
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-border p-2 text-xs leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-primary">Sumber Digital</label>
                        <input
                          type="text"
                          value={draft.lampiran.mediaAjar.sumberDigital}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              lampiran: {
                                ...draft.lampiran!,
                                mediaAjar: {
                                  ...draft.lampiran!.mediaAjar!,
                                  sumberDigital: e.target.value,
                                },
                              },
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-primary">Panduan Penggunaan</label>
                        <textarea
                          rows={2}
                          value={draft.lampiran.mediaAjar.panduanPenggunaan}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              lampiran: {
                                ...draft.lampiran!,
                                mediaAjar: {
                                  ...draft.lampiran!.mediaAjar!,
                                  panduanPenggunaan: e.target.value,
                                },
                              },
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-border p-2 text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                        <div className="rounded-lg border border-border p-3.5">
                          <h4 className="text-xs font-semibold text-primary">Media Ajar Utama</h4>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                            {activeLampiran.mediaAjar.mediaUtama.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-border p-3.5">
                          <h4 className="text-xs font-semibold text-primary">Alat & Bahan Pendukung</h4>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 text-justify">
                            {activeLampiran.mediaAjar.alatDanBahanPendukung.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-800 text-justify">
                        <span className="font-semibold text-ink">Sumber Belajar Digital:</span>{" "}
                        {activeLampiran.mediaAjar.sumberDigital}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-800 text-justify">
                        <span className="font-semibold text-ink">Panduan Penggunaan:</span>{" "}
                        {activeLampiran.mediaAjar.panduanPenggunaan}
                      </p>
                    </>
                  )}
                </section>
              )}

              {/* Lampiran 8: KKTP */}
              {hasLampiran(8) && (
                <section id="lampiran-8" className="scroll-mt-20 space-y-3">
                  <h3 className="border-b border-ink pb-1 font-display text-base font-semibold text-ink">
                    Lampiran 8: KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    <span className="font-semibold text-ink">Pendekatan KKTP:</span>{" "}
                    {activeLampiran.kktp.pendekatan}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-ink text-ink-foreground">
                          <th className="border border-ink px-3 py-2 text-left font-semibold">Kriteria</th>
                          <th className="border border-ink px-3 py-2 text-left font-semibold">Mahir (4)</th>
                          <th className="border border-ink px-3 py-2 text-left font-semibold">Cakap (3)</th>
                          <th className="border border-ink px-3 py-2 text-left font-semibold">Layak (2)</th>
                          <th className="border border-ink px-3 py-2 text-left font-semibold">
                            Perlu Bimbingan (1)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLampiran.kktp.kriteriaKetuntasan.map((row, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="border border-border bg-slate-50 px-3 py-1.5 font-semibold text-ink align-top">
                              {row.criterion}
                            </td>
                            <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">{row.excellent}</td>
                            <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">{row.good}</td>
                            <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">{row.developing}</td>
                            <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">{row.needsSupport}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold text-primary">
                      Interval Nilai & Tindak Lanjut Ketercapaian
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-ink">
                            <th className="w-28 border border-border px-3 py-1.5 text-left font-semibold">
                              Rentang Nilai
                            </th>
                            <th className="w-36 border border-border px-3 py-1.5 text-left font-semibold">
                              Predikat
                            </th>
                            <th className="border border-border px-3 py-1.5 text-left font-semibold">
                              Interpretasi Penguasaan
                            </th>
                            <th className="border border-border px-3 py-1.5 text-left font-semibold">
                              Tindak Lanjut Guru
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeLampiran.kktp.intervalNilai.map((iv, idx) => (
                            <tr key={idx} className="align-top">
                              <td className="border border-border bg-slate-50 px-3 py-1.5 font-mono font-semibold text-ink tabular-nums align-top">
                                {iv.rentang}
                              </td>
                              <td className="border border-border px-3 py-1.5 font-semibold text-ink align-top">
                                {iv.predikat}
                              </td>
                              <td className="border border-border px-3 py-1.5 text-slate-800 text-justify align-top">
                                {iv.interpretasi}
                              </td>
                              <td className="border border-border px-3 py-1.5 text-slate-700 text-justify align-top">
                                {iv.tindakLanjut}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
