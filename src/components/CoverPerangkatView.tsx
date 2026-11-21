import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileText, ImagePlus, Loader2, Printer, RotateCcw, Save, Trash2 } from "lucide-react";
import type {
  AkademikWorkspaceData,
  CoverLogoPreset,
  CoverPerangkatConfig,
  CoverThemeId,
} from "../types/akademik";
import { TAHUN_AJARAN_OPTIONS } from "../types/akademik";
import { createDefaultCoverConfig } from "../lib/akademikEngine";
import { exportCoverToDocx } from "../lib/akademikDocxExport";
import { exportCoverToPdf } from "../lib/akademikPdfExport";

interface CoverPerangkatViewProps {
  workspace: AkademikWorkspaceData;
  onUpdateCover: (cover: CoverPerangkatConfig) => void;
  onSaveWorkspace: () => Promise<void>;
  saving: boolean;
}

function CoverPresetEmblem({ preset, accentClass }: { preset: CoverLogoPreset; accentClass: string }) {
  if (preset === "tanpa-logo") return null;

  if (preset === "garuda-perisai") {
    return (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={accentClass} aria-hidden="true">
        <path
          d="M36 6L60 15V34C60 49.5 49.5 60.8 36 66C22.5 60.8 12 49.5 12 34V15L36 6Z"
          stroke="currentColor"
          strokeWidth="2.4"
          fill="currentColor"
          fillOpacity="0.06"
        />
        <path d="M36 14V58M20 28H52M24 41H48" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="36" cy="28" r="7" stroke="currentColor" strokeWidth="1.8" fill="white" />
      </svg>
    );
  }

  if (preset === "pelita") {
    return (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={accentClass} aria-hidden="true">
        <path
          d="M36 10L61 24.5V47.5L36 62L11 47.5V24.5L36 10Z"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="currentColor"
          fillOpacity="0.06"
        />
        <path
          d="M22 28C27 25.5 32 27 36 30.5C40 27 45 25.5 50 28V46C45 43.8 40 45 36 48C32 45 27 43.8 22 46V28Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M36 30.5V48" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  // Default: Tut Wuri Handayani inspired geometric academic crest
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" fill="none" className={accentClass} aria-hidden="true">
      <polygon
        points="38,5 67,22 67,54 38,71 9,54 9,22"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <circle cx="38" cy="38" r="20" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2" />
      <path
        d="M38 19C35 23 35 28 38 31C41 28 41 23 38 19Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M22 36C27 33 33 35 38 39C43 35 49 33 54 36V49C49 47 43 48.5 38 52C33 48.5 27 47 22 49V36Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M38 39V52" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CoverPerangkatView({
  workspace,
  onUpdateCover,
  onSaveWorkspace,
  saving,
}: CoverPerangkatViewProps) {
  const cover = workspace.coverConfig;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function patchCover(partial: Partial<CoverPerangkatConfig>) {
    onUpdateCover({ ...cover, ...partial });
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setUploadError("Format logo harus PNG atau JPG agar kompatibel dengan ekspor Word & PDF.");
      return;
    }
    if (file.size > 1500 * 1024) {
      setUploadError("Ukuran file logo maksimal 1,5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patchCover({ customLogoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleResetDefault() {
    onUpdateCover(
      createDefaultCoverConfig({
        sekolah: workspace.meta.sekolah,
        namaGuru: workspace.meta.penyusun,
        tahunAjaran: workspace.tahunAjaran,
      })
    );
  }

  async function handleExportWord() {
    setExporting(true);
    try {
      await exportCoverToDocx(cover);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      await exportCoverToPdf(cover);
    } finally {
      setExportingPdf(false);
    }
  }

  const themeFrameClasses: Record<CoverThemeId, string> = {
    "zamrud-emas": "border-4 border-double border-ink ring-1 ring-saffron-deep/60 bg-white",
    "minimalis-tegas": "border-2 border-slate-900 bg-white",
    "bingkai-akademik": "border-[6px] border-primary/90 outline outline-1 -outline-offset-8 outline-primary/35 bg-white",
  };

  const accentTextClass =
    cover.tema === "zamrud-emas"
      ? "text-ink"
      : cover.tema === "bingkai-akademik"
        ? "text-primary"
        : "text-slate-900";

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3.5">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Desain Cover Perangkat Ajar (Siap Jilid A4)
          </h2>
          <p className="text-xs text-muted-foreground">
            Sunting seluruh teks sampul, unggah logo sekolah, pilih tema bingkai, lalu cetak PDF atau unduh ke Word.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-ink whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Standar</span>
          </button>
          <button
            type="button"
            onClick={onSaveWorkspace}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="size-3.5" />
            <span>{saving ? "Menyimpan..." : "Simpan Cover"}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
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
            <span>{exportingPdf ? "Menyiapkan..." : "Unduh PDF (.pdf)"}</span>
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>{exporting ? "Menyiapkan..." : "Unduh Word (.docx)"}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Studio: Editor (Left) + Live A4 Cover Preview (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Editor Controls */}
        <section className="no-print space-y-4 rounded-xl border border-border bg-card p-5 lg:col-span-5">
          <div>
            <h3 className="text-xs font-semibold text-primary">1. Tema Bingkai Cover</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  { id: "zamrud-emas", label: "Zamrud & Emas" },
                  { id: "minimalis-tegas", label: "Minimalis Tegas" },
                  { id: "bingkai-akademik", label: "Bingkai Akademik" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => patchCover({ tema: t.id })}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    cover.tema === t.id
                      ? "border-primary bg-primary/8 text-ink"
                      : "border-border bg-canvas text-muted-foreground hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3.5">
            <h3 className="text-xs font-semibold text-primary">2. Logo Sekolah / Emblem</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  { id: "tut-wuri", label: "Tut Wuri" },
                  { id: "pelita", label: "Pelita Ilmu" },
                  { id: "garuda-perisai", label: "Perisai" },
                  { id: "tanpa-logo", label: "Tanpa Logo" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => patchCover({ logoPreset: p.id, customLogoDataUrl: undefined })}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    !cover.customLogoDataUrl && cover.logoPreset === p.id
                      ? "border-primary bg-primary/8 text-ink"
                      : "border-border bg-canvas text-muted-foreground hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-100 cursor-pointer"
              >
                <ImagePlus className="size-3.5" />
                <span>Unggah Logo Sekolah (PNG/JPG)</span>
              </button>
              {cover.customLogoDataUrl && (
                <button
                  type="button"
                  onClick={() => patchCover({ customLogoDataUrl: undefined })}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Hapus Logo</span>
                </button>
              )}
            </div>
            {uploadError && <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>}
          </div>

          <div className="space-y-3 border-t border-border pt-3.5">
            <h3 className="text-xs font-semibold text-primary">3. Kop Instansi & Satuan Pendidikan</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={cover.instansiAtas}
                onChange={(e) => patchCover({ instansiAtas: e.target.value })}
                placeholder="Instansi Atas (mis. PEMERINTAH DAERAH / KEMENAG)"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.subInstansi}
                onChange={(e) => patchCover({ subInstansi: e.target.value })}
                placeholder="Sub Instansi (mis. DINAS PENDIDIKAN KABUPATEN...)"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.namaSekolah}
                onChange={(e) => patchCover({ namaSekolah: e.target.value })}
                placeholder="Nama Satuan Pendidikan"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs font-semibold text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.alamatSekolah}
                onChange={(e) => patchCover({ alamatSekolah: e.target.value })}
                placeholder="Alamat / NPSN Sekolah"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-3.5">
            <h3 className="text-xs font-semibold text-primary">4. Judul & Identitas Perangkat</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={cover.judulUtama}
                onChange={(e) => patchCover({ judulUtama: e.target.value })}
                placeholder="Judul Cover (mis. PERANGKAT PEMBELAJARAN)"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs font-semibold text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.subJudul}
                onChange={(e) => patchCover({ subJudul: e.target.value })}
                placeholder="Subjudul Kurikulum"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={cover.mataPelajaran}
                  onChange={(e) => patchCover({ mataPelajaran: e.target.value })}
                  placeholder="Mata Pelajaran"
                  className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={cover.jenjangFaseKelas}
                  onChange={(e) => patchCover({ jenjangFaseKelas: e.target.value })}
                  placeholder="Jenjang / Fase / Kelas"
                  className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={cover.semester}
                  onChange={(e) => patchCover({ semester: e.target.value })}
                  placeholder="Semester"
                  className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                />
                <select
                  value={cover.tahunAjaran}
                  onChange={(e) => patchCover({ tahunAjaran: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs text-ink outline-none focus:border-primary"
                >
                  {TAHUN_AJARAN_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-3.5">
            <h3 className="text-xs font-semibold text-primary">
              5. Daftar Isi Ringkas di Cover (1 baris per item)
            </h3>
            <textarea
              rows={5}
              value={cover.daftarBerkas.join("\n")}
              onChange={(e) =>
                patchCover({
                  daftarBerkas: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="w-full rounded-lg border border-border bg-canvas p-2.5 text-xs leading-relaxed text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2 border-t border-border pt-3.5">
            <h3 className="text-xs font-semibold text-primary">6. Pengesahan Penyusun & Kepala Sekolah</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={cover.namaGuru}
                onChange={(e) => patchCover({ namaGuru: e.target.value })}
                placeholder="Nama Guru & Gelar"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.nipGuru}
                onChange={(e) => patchCover({ nipGuru: e.target.value })}
                placeholder="NIP Guru"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.namaKepalaSekolah}
                onChange={(e) => patchCover({ namaKepalaSekolah: e.target.value })}
                placeholder="Nama Kepala Sekolah & Gelar"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <input
                type="text"
                value={cover.nipKepalaSekolah}
                onChange={(e) => patchCover({ nipKepalaSekolah: e.target.value })}
                placeholder="NIP Kepala Sekolah"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
            </div>
            <input
              type="text"
              value={cover.kotaTahun}
              onChange={(e) => patchCover({ kotaTahun: e.target.value })}
              placeholder="Kota, Tanggal / Tahun (mis. Yogyakarta, Juli 2026)"
              className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
            />
          </div>
        </section>

        {/* Live A4 Printable Cover Sheet */}
        <div className="lg:col-span-7">
          <article className="print-container mx-auto max-w-[210mm] rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xs">
            <div
              className={`relative flex min-h-[268mm] flex-col justify-between px-8 py-10 text-center ${
                themeFrameClasses[cover.tema]
              }`}
            >
              {/* Subtle Geometric Corner Ornaments for zamrud-emas */}
              {cover.tema === "zamrud-emas" && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3 left-3 size-6 border-t-2 border-l-2 border-saffron-deep"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3 right-3 size-6 border-t-2 border-r-2 border-saffron-deep"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-saffron-deep"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-saffron-deep"
                  />
                </>
              )}

              {/* Kop Sekolah */}
              <header
                className={`pb-5 ${
                  cover.tema === "minimalis-tegas"
                    ? "border-b-2 border-slate-900 text-left"
                    : "border-b-2 border-ink"
                }`}
              >
                <p className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
                  {cover.instansiAtas}
                </p>
                {cover.subInstansi && (
                  <p className="mt-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
                    {cover.subInstansi}
                  </p>
                )}
                <h1 className={`mt-1.5 font-display text-2xl font-bold tracking-tight uppercase ${accentTextClass}`}>
                  {cover.namaSekolah}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">{cover.alamatSekolah}</p>
              </header>

              {/* Center Emblem + Title + Identity Box */}
              <div className="my-6 flex flex-col items-center space-y-6">
                {cover.customLogoDataUrl ? (
                  <img
                    src={cover.customLogoDataUrl}
                    alt="Logo Satuan Pendidikan"
                    className="h-24 w-24 object-contain"
                  />
                ) : (
                  <CoverPresetEmblem preset={cover.logoPreset} accentClass={accentTextClass} />
                )}

                <div className="space-y-2">
                  <div
                    className={`mx-auto inline-block border-y px-6 py-2 ${
                      cover.tema === "zamrud-emas"
                        ? "border-saffron-deep/60"
                        : "border-border"
                    }`}
                  >
                    <h2 className={`font-display text-3xl font-bold tracking-wide uppercase ${accentTextClass}`}>
                      {cover.judulUtama}
                    </h2>
                  </div>
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {cover.subJudul}
                  </p>
                </div>

                {/* Metadata Table */}
                <table className="w-full max-w-md border-collapse text-left text-xs">
                  <tbody>
                    {[
                      ["Mata Pelajaran", cover.mataPelajaran],
                      ["Jenjang / Fase / Kelas", cover.jenjangFaseKelas],
                      ["Semester", cover.semester],
                      ["Tahun Ajaran", cover.tahunAjaran],
                    ].map(([lbl, val]) => (
                      <tr key={lbl} className="border-b border-border">
                        <td className="w-40 bg-slate-50 px-3 py-2 font-semibold text-ink">{lbl}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800 tabular-nums">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Daftar Kelengkapan Berkas */}
                {cover.daftarBerkas.length > 0 && (
                  <div className="w-full max-w-md rounded-lg border border-border bg-slate-50/70 px-5 py-3.5 text-left">
                    <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                      Kelengkapan Perangkat Ajar:
                    </p>
                    <ol className="mt-1.5 grid gap-1 sm:grid-cols-2 list-decimal pl-4 text-xs text-slate-800">
                      {cover.daftarBerkas.map((item, i) => (
                        <li key={i} className="leading-snug">
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Bottom Signature & School Year Stamp */}
              <footer className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-6 border-t border-border pt-5 text-left text-xs text-slate-800">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-semibold text-ink">Kepala Sekolah</p>
                    <div className="h-14" />
                    <p className="font-semibold text-ink underline underline-offset-4">
                      {cover.namaKepalaSekolah || "............................................."}
                    </p>
                    <p className="mt-0.5 tabular-nums">
                      NIP. {cover.nipKepalaSekolah || "....................................."}
                    </p>
                  </div>

                  <div>
                    <p>{cover.kotaTahun || "Yogyakarta, 2026"}</p>
                    <p className="font-semibold text-ink">Guru Mata Pelajaran</p>
                    <div className="h-14" />
                    <p className="font-semibold text-ink underline underline-offset-4">
                      {cover.namaGuru || "............................................."}
                    </p>
                    <p className="mt-0.5 tabular-nums">
                      NIP. {cover.nipGuru || "....................................."}
                    </p>
                  </div>
                </div>

                <div className="border-t-2 border-ink pt-3 text-xs font-bold tracking-widest text-ink uppercase">
                  {cover.namaSekolah} · TAHUN AJARAN {cover.tahunAjaran}
                </div>
              </footer>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
