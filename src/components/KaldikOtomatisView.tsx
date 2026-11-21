import { useState } from "react";
import { CalendarDays, Download, FileText, Loader2, Printer, RotateCcw, Save, X } from "lucide-react";
import type {
  AkademikSignatureMeta,
  AkademikWorkspaceData,
  HariSekolahMode,
  KaldikDayNote,
  KaldikDayStatus,
} from "../types/akademik";
import { TAHUN_AJARAN_OPTIONS } from "../types/akademik";
import type { KaldikDayCell, KaldikYearSummary } from "../lib/akademikEngine";
import { exportKaldikToDocx } from "../lib/akademikDocxExport";
import { exportKaldikToPdf } from "../lib/akademikPdfExport";

interface KaldikOtomatisViewProps {
  workspace: AkademikWorkspaceData;
  kaldik: KaldikYearSummary;
  onChangeTahunAjaran: (tahun: string) => void;
  onChangeHariSekolah: (mode: HariSekolahMode) => void;
  onUpdateDayOverride: (dateStr: string, note: KaldikDayNote | null) => void;
  onResetYearOverrides: () => void;
  onUpdateMeta: (meta: AkademikSignatureMeta) => void;
  onSaveWorkspace: () => Promise<void>;
  saving: boolean;
}

const STATUS_META: Record<
  KaldikDayStatus,
  { label: string; shortTag: string; cellClass: string; swatchClass: string }
> = {
  efektif: {
    label: "Hari Belajar Efektif",
    shortTag: "EF",
    cellClass: "bg-white text-ink hover:bg-emerald-50 border-slate-200",
    swatchClass: "bg-white border-slate-300",
  },
  libur_akhir_pekan: {
    label: "Libur Akhir Pekan",
    shortTag: "AP",
    cellClass: "bg-slate-100 text-slate-400 hover:bg-slate-200 border-slate-200",
    swatchClass: "bg-slate-200 border-slate-300",
  },
  libur_nasional: {
    label: "Libur Nasional / Cuti",
    shortTag: "LN",
    cellClass: "bg-red-50 text-red-700 font-semibold hover:bg-red-100 border-red-200",
    swatchClass: "bg-red-100 border-red-300",
  },
  libur_semester: {
    label: "Libur Semester / Kenaikan",
    shortTag: "LS",
    cellClass: "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200",
    swatchClass: "bg-amber-100 border-amber-300",
  },
  mpls: {
    label: "MPLS / Awal Tahun",
    shortTag: "MP",
    cellClass: "bg-sky-50 text-sky-800 font-semibold hover:bg-sky-100 border-sky-200",
    swatchClass: "bg-sky-100 border-sky-300",
  },
  sts: {
    label: "Sumatif Tengah Semester (STS)",
    shortTag: "ST",
    cellClass: "bg-indigo-50 text-indigo-800 font-semibold hover:bg-indigo-100 border-indigo-200",
    swatchClass: "bg-indigo-100 border-indigo-300",
  },
  sas: {
    label: "Sumatif Akhir Semester / Tahun",
    shortTag: "SA",
    cellClass: "bg-purple-50 text-purple-800 font-semibold hover:bg-purple-100 border-purple-200",
    swatchClass: "bg-purple-100 border-purple-300",
  },
  rapor: {
    label: "Pengolahan & Pembagian Rapor",
    shortTag: "RP",
    cellClass: "bg-teal-50 text-teal-800 font-semibold hover:bg-teal-100 border-teal-200",
    swatchClass: "bg-teal-100 border-teal-300",
  },
  kegiatan: {
    label: "Kegiatan Sekolah / P5 / Kokurikuler",
    shortTag: "KG",
    cellClass: "bg-emerald-100 text-emerald-900 font-semibold hover:bg-emerald-200 border-emerald-300",
    swatchClass: "bg-emerald-200 border-emerald-400",
  },
};

export function KaldikOtomatisView({
  workspace,
  kaldik,
  onChangeTahunAjaran,
  onChangeHariSekolah,
  onUpdateDayOverride,
  onResetYearOverrides,
  onUpdateMeta,
  onSaveWorkspace,
  saving,
}: KaldikOtomatisViewProps) {
  const [semesterFilter, setSemesterFilter] = useState<"all" | 1 | 2>("all");
  const [editingCell, setEditingCell] = useState<KaldikDayCell | null>(null);
  const [editStatus, setEditStatus] = useState<KaldikDayStatus>("efektif");
  const [editLabel, setEditLabel] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const visibleMonths =
    semesterFilter === "all"
      ? kaldik.months
      : kaldik.months.filter((m) => m.semester === semesterFilter);

  const overrideCount = Object.keys(workspace.kaldikOverrides[workspace.tahunAjaran] ?? {}).length;

  function openDayEditor(cell: KaldikDayCell) {
    setEditingCell(cell);
    setEditStatus(cell.status);
    setEditLabel(cell.label);
  }

  function handleApplyDayEdit() {
    if (!editingCell) return;
    const cleanLabel = editLabel.trim() || STATUS_META[editStatus].label;
    onUpdateDayOverride(editingCell.dateStr, {
      status: editStatus,
      label: cleanLabel,
    });
    setEditingCell(null);
  }

  function handleClearDayEdit() {
    if (!editingCell) return;
    onUpdateDayOverride(editingCell.dateStr, null);
    setEditingCell(null);
  }

  async function handleExportWord() {
    setExporting(true);
    try {
      await exportKaldikToDocx(kaldik, workspace.meta);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      await exportKaldikToPdf(kaldik, workspace.meta);
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Control Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">
              Tahun Ajaran
            </label>
            <select
              value={workspace.tahunAjaran}
              onChange={(e) => onChangeTahunAjaran(e.target.value)}
              className="mt-0.5 h-9 rounded-lg border border-border bg-canvas px-3 text-xs font-semibold text-ink outline-none focus:border-primary"
            >
              {TAHUN_AJARAN_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">
              Pola Hari Sekolah
            </label>
            <div className="mt-0.5 flex items-center rounded-lg bg-slate-100 p-0.5">
              {([5, 6] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeHariSekolah(mode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    workspace.hariSekolah === mode
                      ? "bg-card text-ink shadow-xs"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  {mode} Hari ({mode === 5 ? "Sen–Jum" : "Sen–Sab"})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">
              Tampilan Bulan
            </label>
            <div className="mt-0.5 flex items-center rounded-lg bg-slate-100 p-0.5">
              {(
                [
                  { id: "all", label: "12 Bulan" },
                  { id: 1, label: "Smt 1 (Jul–Des)" },
                  { id: 2, label: "Smt 2 (Jan–Jun)" },
                ] as const
              ).map((opt) => (
                <button
                  key={String(opt.id)}
                  type="button"
                  onClick={() => setSemesterFilter(opt.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    semesterFilter === opt.id
                      ? "bg-card text-ink shadow-xs"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {overrideCount > 0 && (
            <button
              type="button"
              onClick={onResetYearOverrides}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-ink whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset ({overrideCount})</span>
            </button>
          )}
          <button
            type="button"
            onClick={onSaveWorkspace}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="size-3.5" />
            <span>{saving ? "Menyimpan..." : "Simpan Kaldik"}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Cetak</span>
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-emerald-100 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {exportingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
            <span>{exportingPdf ? "Menyiapkan..." : "Unduh PDF (.pdf)"}</span>
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:bg-primary disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>{exporting ? "Menyiapkan..." : "Unduh Word (.docx)"}</span>
          </button>
        </div>
      </div>

      {/* Printable Document Area */}
      <div className="print-container space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
        <header className="border-b-2 border-ink pb-4 text-center">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            {workspace.meta.sekolah}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            KALENDER PENDIDIKAN & ANALISIS MINGGU EFEKTIF · {kaldik.tahunAjaran}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            Pola {kaldik.hariSekolah} Hari Sekolah · Klik tanggal mana saja untuk menyesuaikan hari libur atau agenda satuan pendidikan
          </p>
        </header>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-canvas px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">Total Minggu Efektif</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink tabular-nums">
              {kaldik.totalEffectiveWeeks}{" "}
              <span className="text-xs font-normal text-muted-foreground">Pekan</span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-canvas px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">Semester 1 (Ganjil)</p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary tabular-nums">
              {kaldik.semester1.effectiveWeeks}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ME · {kaldik.semester1.effectiveDays} HBE
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-canvas px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">Semester 2 (Genap)</p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary tabular-nums">
              {kaldik.semester2.effectiveWeeks}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ME · {kaldik.semester2.effectiveDays} HBE
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-canvas px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">Hari Belajar Efektif</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink tabular-nums">
              {kaldik.totalEffectiveDays}{" "}
              <span className="text-xs font-normal text-muted-foreground">Hari/Tahun</span>
            </p>
          </div>
        </div>

        {/* Explicit Status Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-2.5 text-xs text-slate-700">
          {(Object.entries(STATUS_META) as [KaldikDayStatus, (typeof STATUS_META)[KaldikDayStatus]][]).map(
            ([key, info]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`inline-block size-3 rounded-xs border ${info.swatchClass}`} />
                <span>{info.label}</span>
              </div>
            )
          )}
        </div>

        {/* Monthly Calendar Grids */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleMonths.map((m) => (
            <section
              key={`${m.year}-${m.month}`}
              className="print-avoid-break flex flex-col justify-between rounded-lg border border-border bg-canvas/50 p-3.5"
            >
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink">
                      {m.monthName} {m.year}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Semester {m.semester}</p>
                  </div>
                  <div className="text-right font-mono text-[11px] font-semibold text-primary tabular-nums">
                    <div>{m.effectiveWeeks} ME</div>
                    <div className="text-muted-foreground">{m.effectiveDays} HBE</div>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                    <div key={d} className={d === "Min" ? "text-red-600" : ""}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: m.leadingEmptySlots }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-7" />
                  ))}
                  {m.days.map((cell) => {
                    const meta = STATUS_META[cell.status];
                    return (
                      <button
                        key={cell.dateStr}
                        type="button"
                        onClick={() => openDayEditor(cell)}
                        title={`${cell.dateStr}: ${cell.label}${cell.isOverride ? " (Disesuaikan)" : ""}`}
                        className={`relative flex h-7 items-center justify-center rounded-sm border text-[11px] font-mono tabular-nums transition-colors cursor-pointer ${meta.cellClass}`}
                      >
                        <span>{cell.day}</span>
                        {cell.isOverride && (
                          <span className="absolute top-0.5 right-0.5 size-1 rounded-full bg-saffron-deep" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Agenda Notes */}
              <div className="mt-2.5 border-t border-border pt-2 text-[11px] text-slate-600">
                {m.agendaList.length === 0 ? (
                  <p className="italic text-muted-foreground">Pembelajaran efektif reguler</p>
                ) : (
                  <ul className="space-y-0.5">
                    {m.agendaList.slice(0, 3).map((ag) => (
                      <li key={`${ag.dateStr}-${ag.label}`} className="truncate tabular-nums">
                        <span className="font-mono font-semibold text-ink">{ag.day}:</span> {ag.label}
                      </li>
                    ))}
                    {m.agendaList.length > 3 && (
                      <li className="text-[10px] text-muted-foreground">
                        +{m.agendaList.length - 3} agenda lainnya
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Summary Table */}
        <section className="print-avoid-break pt-2">
          <h3 className="mb-2.5 font-display text-base font-bold text-ink">
            Tabel Rekapitulasi Minggu & Hari Belajar Efektif
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-ink text-ink-foreground">
                  <th className="border border-ink px-2.5 py-2 text-center">No</th>
                  <th className="border border-ink px-2.5 py-2 text-left">Bulan / Tahun</th>
                  <th className="border border-ink px-2.5 py-2 text-center">Smt</th>
                  <th className="border border-ink px-2.5 py-2 text-center">Jml Pekan</th>
                  <th className="border border-ink px-2.5 py-2 text-center">Pekan Efektif</th>
                  <th className="border border-ink px-2.5 py-2 text-center">Tdk Efektif</th>
                  <th className="border border-ink px-2.5 py-2 text-center">Hari Efektif</th>
                  <th className="border border-ink px-2.5 py-2 text-left">Agenda & Libur Penting</th>
                </tr>
              </thead>
              <tbody>
                {kaldik.months.map((m, idx) => (
                  <tr key={`${m.year}-${m.month}`} className="odd:bg-white even:bg-slate-50/70">
                    <td className="border border-border px-2.5 py-1.5 text-center font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 font-semibold text-ink">
                      {m.monthName} {m.year}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 text-center font-mono tabular-nums">
                      {m.semester}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 text-center font-mono tabular-nums">
                      {m.totalWeeks}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 text-center font-mono font-bold text-primary tabular-nums">
                      {m.effectiveWeeks}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 text-center font-mono text-muted-foreground tabular-nums">
                      {m.nonEffectiveWeeks}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 text-center font-mono font-semibold text-ink tabular-nums">
                      {m.effectiveDays}
                    </td>
                    <td className="border border-border px-2.5 py-1.5 text-slate-700">
                      {m.agendaList.length
                        ? m.agendaList
                            .slice(0, 3)
                            .map((a) => `${a.day}: ${a.label}`)
                            .join("; ")
                        : "Kegiatan belajar efektif reguler"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold text-ink">
                  <td colSpan={3} className="border border-border px-2.5 py-2 text-right">
                    TOTAL TAHUN AJARAN {kaldik.tahunAjaran}
                  </td>
                  <td className="border border-border px-2.5 py-2 text-center font-mono tabular-nums">
                    {kaldik.months.reduce((s, m) => s + m.totalWeeks, 0)}
                  </td>
                  <td className="border border-border px-2.5 py-2 text-center font-mono text-primary tabular-nums">
                    {kaldik.totalEffectiveWeeks}
                  </td>
                  <td className="border border-border px-2.5 py-2 text-center font-mono tabular-nums">
                    {kaldik.semester1.nonEffectiveWeeks + kaldik.semester2.nonEffectiveWeeks}
                  </td>
                  <td className="border border-border px-2.5 py-2 text-center font-mono text-primary tabular-nums">
                    {kaldik.totalEffectiveDays}
                  </td>
                  <td className="border border-border px-2.5 py-2 text-xs font-semibold tabular-nums">
                    Ganjil: {kaldik.semester1.effectiveWeeks} ME · Genap: {kaldik.semester2.effectiveWeeks} ME
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Editable Pengesahan Controls (no-print) + Print Signature */}
        <section className="no-print rounded-lg border border-border bg-canvas p-4">
          <p className="mb-2.5 text-xs font-semibold text-primary">
            Pengaturan Identitas & Pengesahan (Tercetak di Dokumen & Word)
          </p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              value={workspace.meta.sekolah}
              onChange={(e) => onUpdateMeta({ ...workspace.meta, sekolah: e.target.value })}
              placeholder="Nama Sekolah"
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={workspace.meta.kotaTanggal}
              onChange={(e) => onUpdateMeta({ ...workspace.meta, kotaTanggal: e.target.value })}
              placeholder="Kota, Tanggal (mis. Yogyakarta, 14 Juli 2026)"
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={workspace.meta.penyusun}
              onChange={(e) => onUpdateMeta({ ...workspace.meta, penyusun: e.target.value })}
              placeholder="Nama Guru Mapel"
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={workspace.meta.nipGuru}
              onChange={(e) => onUpdateMeta({ ...workspace.meta, nipGuru: e.target.value })}
              placeholder="NIP Guru Mapel"
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={workspace.meta.namaKepalaSekolah}
              onChange={(e) =>
                onUpdateMeta({ ...workspace.meta, namaKepalaSekolah: e.target.value })
              }
              placeholder="Nama Kepala Sekolah"
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={workspace.meta.nipKepalaSekolah}
              onChange={(e) =>
                onUpdateMeta({ ...workspace.meta, nipKepalaSekolah: e.target.value })
              }
              placeholder="NIP Kepala Sekolah"
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink outline-none focus:border-primary"
            />
          </div>
        </section>

        <footer className="print-avoid-break grid grid-cols-2 gap-8 border-t border-border pt-6 text-xs text-slate-800">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold text-ink">Kepala Sekolah</p>
            <div className="h-14" />
            <p className="font-semibold text-ink underline underline-offset-4">
              {workspace.meta.namaKepalaSekolah || "............................................."}
            </p>
            <p className="mt-0.5 tabular-nums">
              NIP. {workspace.meta.nipKepalaSekolah || "....................................."}
            </p>
          </div>
          <div>
            <p>{workspace.meta.kotaTanggal || "...................., .................. 2026"}</p>
            <p className="font-semibold text-ink">Guru Mata Pelajaran</p>
            <div className="h-14" />
            <p className="font-semibold text-ink underline underline-offset-4">
              {workspace.meta.penyusun || "............................................."}
            </p>
            <p className="mt-0.5 tabular-nums">
              NIP. {workspace.meta.nipGuru || "....................................."}
            </p>
          </div>
        </footer>
      </div>

      {/* Day Customizer Modal */}
      {editingCell && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Atur Tanggal {editingCell.dateStr}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sesuaikan status hari efektif, libur khusus, atau agenda sekolah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-slate-100 hover:text-ink cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink">Status Hari</label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as KaldikDayStatus;
                    setEditStatus(nextStatus);
                    setEditLabel(STATUS_META[nextStatus].label);
                  }}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                >
                  {(Object.entries(STATUS_META) as [KaldikDayStatus, (typeof STATUS_META)[KaldikDayStatus]][]).map(
                    ([val, info]) => (
                      <option key={val} value={val}>
                        {info.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink">Keterangan / Agenda</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="Mis. Pesantren Kilat / Class Meeting / Libur Daerah"
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-3.5">
              {editingCell.isOverride ? (
                <button
                  type="button"
                  onClick={handleClearDayEdit}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                >
                  Kembalikan Bawaan
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-ink cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyDayEdit}
                  className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:bg-primary cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
