import { useState } from "react";
import { Download, FileText, Loader2, Plus, Printer, RefreshCw, Save, Trash2 } from "lucide-react";
import { JENJANG_CONFIG, type Jenjang } from "../types/modul";
import type {
  AkademikSignatureMeta,
  AkademikWorkspaceData,
  ProsemDocument,
  ProtaDocument,
  ProtaRow,
} from "../types/akademik";
import { TAHUN_AJARAN_OPTIONS } from "../types/akademik";
import {
  generateAutoProsem,
  generateAutoProta,
  getDefaultJpPerWeek,
  type KaldikYearSummary,
} from "../lib/akademikEngine";
import { exportProsemToDocx, exportProtaToDocx } from "../lib/akademikDocxExport";
import { exportProsemToPdf, exportProtaToPdf } from "../lib/akademikPdfExport";

interface ProtaProsemViewProps {
  workspace: AkademikWorkspaceData;
  kaldik: KaldikYearSummary;
  onChangeTahunAjaran: (tahun: string) => void;
  onSaveProta: (key: string, doc: ProtaDocument) => void;
  onSaveProsem: (key: string, doc: ProsemDocument) => void;
  onUpdateMeta: (meta: AkademikSignatureMeta) => void;
  onSaveWorkspace: () => Promise<void>;
  saving: boolean;
}

export function ProtaProsemView({
  workspace,
  kaldik,
  onChangeTahunAjaran,
  onSaveProta,
  onSaveProsem,
  onSaveWorkspace,
  saving,
}: ProtaProsemViewProps) {
  const initialClass =
    workspace.classes.find((c) => c.id === workspace.selectedClassId) ?? workspace.classes[0];

  const [mode, setMode] = useState<"prota" | "prosem">("prota");
  const [semester, setSemester] = useState<1 | 2>(1);
  const [jenjang, setJenjang] = useState<Jenjang>(initialClass?.jenjang ?? "SMP/MTs");
  const [fase, setFase] = useState<string>(initialClass?.fase ?? "Fase D");
  const [kelas, setKelas] = useState<string>(initialClass?.kelasTingkat ?? "Kelas 8");
  const [mataPelajaran, setMataPelajaran] = useState<string>(
    initialClass?.mataPelajaranDefault ?? "IPA (Ilmu Pengetahuan Alam)"
  );
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const faseList = JENJANG_CONFIG[jenjang].fases;
  const activeFaseObj = faseList.find((f) => f.fase === fase) ?? faseList[0];
  const kelasList = activeFaseObj.kelasList;
  const mapelList = JENJANG_CONFIG[jenjang].mapel;

  const protaKey = `${workspace.tahunAjaran}|${jenjang}|${kelas}|${mataPelajaran}`;
  const prosemKey = `${workspace.tahunAjaran}|${semester}|${jenjang}|${kelas}|${mataPelajaran}`;

  const activeProta: ProtaDocument =
    workspace.protaRecords[protaKey] ??
    generateAutoProta({
      tahunAjaran: workspace.tahunAjaran,
      jenjang,
      fase,
      kelas,
      mataPelajaran,
      kaldik,
    });

  const activeProsem: ProsemDocument =
    workspace.prosemRecords[prosemKey] ??
    generateAutoProsem({
      prota: activeProta,
      semester,
      kaldik,
    });

  function handleChangeJenjang(nextJenjang: Jenjang) {
    const nextCfg = JENJANG_CONFIG[nextJenjang];
    const nextFase = nextCfg.fases[0].fase;
    const nextKelas = nextCfg.fases[0].kelasList[0];
    const nextMapel = nextCfg.mapel[0];
    setJenjang(nextJenjang);
    setFase(nextFase);
    setKelas(nextKelas);
    setMataPelajaran(nextMapel);
  }

  function handleChangeFase(nextFase: string) {
    const found = JENJANG_CONFIG[jenjang].fases.find((f) => f.fase === nextFase);
    setFase(nextFase);
    if (found && !found.kelasList.includes(kelas)) {
      setKelas(found.kelasList[0]);
    }
  }

  function updateProta(nextDoc: ProtaDocument) {
    onSaveProta(protaKey, nextDoc);
  }

  function updateProsem(nextDoc: ProsemDocument) {
    onSaveProsem(prosemKey, nextDoc);
  }

  function handleAutoRegenerate() {
    const freshProta = generateAutoProta({
      tahunAjaran: workspace.tahunAjaran,
      jenjang,
      fase,
      kelas,
      mataPelajaran,
      jpPerMinggu: activeProta.jpPerMinggu || getDefaultJpPerWeek(jenjang, mataPelajaran),
      kaldik,
    });
    onSaveProta(protaKey, freshProta);

    const freshSem1 = generateAutoProsem({ prota: freshProta, semester: 1, kaldik });
    const freshSem2 = generateAutoProsem({ prota: freshProta, semester: 2, kaldik });
    onSaveProsem(`${workspace.tahunAjaran}|1|${jenjang}|${kelas}|${mataPelajaran}`, freshSem1);
    onSaveProsem(`${workspace.tahunAjaran}|2|${jenjang}|${kelas}|${mataPelajaran}`, freshSem2);
  }

  function handleSyncProsemFromProta() {
    const synced = generateAutoProsem({ prota: activeProta, semester, kaldik });
    onSaveProsem(prosemKey, synced);
  }

  function handlePatchProtaRow(idx: number, patch: Partial<ProtaRow>) {
    const nextRows = activeProta.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    updateProta({ ...activeProta, rows: nextRows });
  }

  function handleAddProtaRow() {
    const newRow: ProtaRow = {
      id: `prota-custom-${Date.now()}`,
      semester: 1,
      elemen: `Elemen (${fase})`,
      materiPokok: "Topik Pembelajaran Tambahan",
      alokasiJp: activeProta.jpPerMinggu * 2,
      keterangan: "Pembelajaran Inti + Asesmen",
    };
    updateProta({ ...activeProta, rows: [...activeProta.rows, newRow] });
  }

  function handleDeleteProtaRow(idx: number) {
    if (activeProta.rows.length <= 1) return;
    updateProta({
      ...activeProta,
      rows: activeProta.rows.filter((_, i) => i !== idx),
    });
  }

  async function handleExportWord() {
    setExporting(true);
    try {
      if (mode === "prota") {
        await exportProtaToDocx(activeProta, kaldik, workspace.meta);
      } else {
        await exportProsemToDocx(activeProsem, kaldik, workspace.meta);
      }
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      if (mode === "prota") {
        await exportProtaToPdf(activeProta, kaldik, workspace.meta);
      } else {
        await exportProsemToPdf(activeProsem, kaldik, workspace.meta);
      }
    } finally {
      setExportingPdf(false);
    }
  }

  const semMonths = kaldik.months.filter((m) => m.semester === semester);
  const totalScheduledJp = activeProta.rows.reduce((s, r) => s + (Number(r.alokasiJp) || 0), 0);
  const targetYearJp = kaldik.totalEffectiveWeeks * (activeProta.jpPerMinggu || 2);

  return (
    <div className="space-y-5">
      {/* Control Bar */}
      <div className="no-print space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("prota")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                mode === "prota" ? "bg-card text-ink shadow-xs" : "text-muted-foreground hover:text-ink"
              }`}
            >
              Program Tahunan (Prota)
            </button>
            <button
              type="button"
              onClick={() => setMode("prosem")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                mode === "prosem" ? "bg-card text-ink shadow-xs" : "text-muted-foreground hover:text-ink"
              }`}
            >
              Program Semester (Prosem)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoRegenerate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Susun Otomatis dari Kaldik</span>
            </button>
            <button
              type="button"
              onClick={onSaveWorkspace}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>{saving ? "Menyimpan..." : "Simpan"}</span>
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

        {/* Context Selectors */}
        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">Tahun Ajaran</label>
            <select
              value={workspace.tahunAjaran}
              onChange={(e) => onChangeTahunAjaran(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
            >
              {TAHUN_AJARAN_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">Jenjang</label>
            <select
              value={jenjang}
              onChange={(e) => handleChangeJenjang(e.target.value as Jenjang)}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
            >
              {(Object.keys(JENJANG_CONFIG) as Jenjang[]).map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">Fase</label>
            <select
              value={fase}
              onChange={(e) => handleChangeFase(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
            >
              {faseList.map((f) => (
                <option key={f.fase} value={f.fase}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">Kelas</label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
            >
              {kelasList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground">Mata Pelajaran</label>
            <select
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
            >
              {mapelList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {mode === "prota" ? (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground">JP / Minggu</label>
              <input
                type="number"
                min={1}
                max={24}
                value={activeProta.jpPerMinggu}
                onChange={(e) =>
                  updateProta({
                    ...activeProta,
                    jpPerMinggu: Math.max(1, Number(e.target.value) || 2),
                  })
                }
                className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs font-mono font-semibold text-ink outline-none focus:border-primary"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
              >
                <option value={1}>Semester I (Ganjil)</option>
                <option value={2}>Semester II (Genap)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Document Sheet */}
      <div className="print-container space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
        <header className="border-b-2 border-ink pb-4 text-center">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            {workspace.meta.sekolah}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            {mode === "prota"
              ? "PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA"
              : `PROGRAM SEMESTER (PROSEM) · SEMESTER ${semester === 1 ? "I (GANJIL)" : "II (GENAP)"}`}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {mataPelajaran} · {jenjang} ({fase} / {kelas}) · Tahun Ajaran {workspace.tahunAjaran}
          </p>
        </header>

        {mode === "prota" ? (
          <>
            {/* Prota Calculation Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-canvas px-4 py-3 text-xs">
              <div className="text-slate-700 tabular-nums">
                Basis Kaldik:{" "}
                <strong className="text-ink">{kaldik.totalEffectiveWeeks} Minggu Efektif</strong> (Ganjil{" "}
                {kaldik.semester1.effectiveWeeks} ME + Genap {kaldik.semester2.effectiveWeeks} ME) ×{" "}
                <strong className="text-ink">{activeProta.jpPerMinggu} JP/Minggu</strong> = Target{" "}
                <strong className="text-primary">{targetYearJp} JP</strong>
              </div>
              <div className="font-mono font-semibold tabular-nums">
                Terjadwal: <span className="text-primary">{totalScheduledJp} JP</span>
                {totalScheduledJp !== targetYearJp && (
                  <span className="ml-2 text-amber-700">
                    (Selisih {totalScheduledJp - targetYearJp > 0 ? "+" : ""}
                    {totalScheduledJp - targetYearJp} JP)
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-ink text-ink-foreground">
                    <th className="w-10 border border-ink px-2 py-2 text-center">No</th>
                    <th className="w-20 border border-ink px-2 py-2 text-center">Smt</th>
                    <th className="w-40 border border-ink px-2.5 py-2 text-left">Elemen / Lingkup</th>
                    <th className="border border-ink px-2.5 py-2 text-left">
                      Topik / Materi Pokok Kurikulum Merdeka
                    </th>
                    <th className="w-24 border border-ink px-2 py-2 text-center">Alokasi JP</th>
                    <th className="w-44 border border-ink px-2.5 py-2 text-left">Keterangan</th>
                    <th className="no-print w-12 border border-ink px-2 py-2 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProta.rows.map((row, idx) => (
                    <tr key={row.id} className="odd:bg-white even:bg-slate-50/60">
                      <td className="border border-border px-2 py-1.5 text-center font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="border border-border px-1.5 py-1.5 text-center">
                        <select
                          value={row.semester}
                          onChange={(e) =>
                            handlePatchProtaRow(idx, { semester: Number(e.target.value) as 1 | 2 })
                          }
                          className="w-full rounded border border-border bg-white px-1.5 py-1 text-center text-xs font-semibold text-ink print:border-0 print:bg-transparent"
                        >
                          <option value={1}>Smt 1</option>
                          <option value={2}>Smt 2</option>
                        </select>
                      </td>
                      <td className="border border-border px-1.5 py-1.5">
                        <input
                          type="text"
                          value={row.elemen}
                          onChange={(e) => handlePatchProtaRow(idx, { elemen: e.target.value })}
                          className="w-full rounded border border-border bg-white px-2 py-1 text-xs text-ink print:border-0 print:bg-transparent print:p-0"
                        />
                      </td>
                      <td className="border border-border px-1.5 py-1.5">
                        <input
                          type="text"
                          value={row.materiPokok}
                          onChange={(e) => handlePatchProtaRow(idx, { materiPokok: e.target.value })}
                          className="w-full rounded border border-border bg-white px-2 py-1 text-xs font-semibold text-ink print:border-0 print:bg-transparent print:p-0"
                        />
                      </td>
                      <td className="border border-border px-1.5 py-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={row.alokasiJp}
                          onChange={(e) =>
                            handlePatchProtaRow(idx, {
                              alokasiJp: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-16 rounded border border-border bg-white px-1.5 py-1 text-center font-mono text-xs font-bold text-primary tabular-nums print:border-0 print:bg-transparent"
                        />
                      </td>
                      <td className="border border-border px-1.5 py-1.5">
                        <input
                          type="text"
                          value={row.keterangan}
                          onChange={(e) => handlePatchProtaRow(idx, { keterangan: e.target.value })}
                          className="w-full rounded border border-border bg-white px-2 py-1 text-xs text-slate-700 print:border-0 print:bg-transparent print:p-0"
                        />
                      </td>
                      <td className="no-print border border-border px-1.5 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteProtaRow(idx)}
                          title="Hapus Baris"
                          className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-ink">
                    <td colSpan={4} className="border border-border px-3 py-2 text-right">
                      TOTAL ALOKASI JAM PELAJARAN SETAHUN
                    </td>
                    <td className="border border-border px-2 py-2 text-center font-mono text-primary tabular-nums">
                      {totalScheduledJp} JP
                    </td>
                    <td colSpan={2} className="border border-border px-2.5 py-2 text-xs font-semibold tabular-nums">
                      {kaldik.totalEffectiveWeeks} Minggu Efektif Kaldik
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAddProtaRow}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-2 text-xs font-semibold text-ink hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Tambah Baris Materi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSyncProsemFromProta();
                  setMode("prosem");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Distribusikan ke Matriks Prosem</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Prosem Matrix */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-canvas px-4 py-2.5 text-xs">
              <span className="text-slate-700">
                Pekan bertanda <strong className="text-slate-500">×</strong> otomatis non-efektif sesuai Kaldik (MPLS/STS/SAS/Libur). Klik angka JP pada pekan efektif untuk mengubah distribusi.
              </span>
              <button
                type="button"
                onClick={handleSyncProsemFromProta}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Sinkronkan dari Prota</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-ink text-ink-foreground">
                    <th rowSpan={2} className="w-8 border border-ink px-1.5 py-1.5 text-center">
                      No
                    </th>
                    <th rowSpan={2} className="min-w-[200px] border border-ink px-2 py-1.5 text-left">
                      Materi Pokok / Topik
                    </th>
                    <th rowSpan={2} className="w-12 border border-ink px-1.5 py-1.5 text-center">
                      JP
                    </th>
                    {semMonths.map((m) => (
                      <th
                        key={`${m.year}-${m.month}`}
                        colSpan={m.weeks.length}
                        className="border border-ink/80 px-1 py-1 text-center font-semibold"
                      >
                        {m.monthName.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-primary text-white">
                    {semMonths.flatMap((m) =>
                      m.weeks.map((w) => (
                        <th
                          key={`${m.month}-${w.weekIndex}`}
                          title={w.dominantNote || (w.isEffective ? "Pekan Efektif" : "Pekan Non-Efektif")}
                          className={`w-8 border border-white/25 px-1 py-1 text-center font-mono text-[10px] ${
                            w.isEffective ? "bg-primary" : "bg-slate-600 text-slate-200"
                          }`}
                        >
                          {w.weekIndex}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeProsem.rows.map((row, rIdx) => {
                    const rowDistributed = Object.values(row.pekanJp).reduce(
                      (s, v) => s + (Number(v) || 0),
                      0
                    );
                    return (
                      <tr key={row.id} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border border-border px-1.5 py-1 text-center font-mono tabular-nums">
                          {rIdx + 1}
                        </td>
                        <td className="border border-border px-2 py-1 font-medium text-ink">
                          <input
                            type="text"
                            value={row.materiPokok}
                            onChange={(e) => {
                              const nextRows = activeProsem.rows.map((r, i) =>
                                i === rIdx ? { ...r, materiPokok: e.target.value } : r
                              );
                              updateProsem({ ...activeProsem, rows: nextRows });
                            }}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11px] font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="border border-border px-1.5 py-1 text-center font-mono font-bold text-primary tabular-nums">
                          {rowDistributed || row.alokasiJp}
                        </td>
                        {semMonths.flatMap((m) =>
                          m.weeks.map((w) => {
                            const key = `${m.month}-${w.weekIndex}`;
                            if (!w.isEffective) {
                              return (
                                <td
                                  key={key}
                                  title={w.dominantNote || "Pekan Non-Efektif"}
                                  className="border border-border bg-slate-100 px-1 py-1 text-center font-mono text-slate-400"
                                >
                                  ×
                                </td>
                              );
                            }
                            const val = row.pekanJp[key] ?? 0;
                            return (
                              <td
                                key={key}
                                className={`border border-border p-0 text-center ${
                                  val > 0 ? "bg-emerald-50" : ""
                                }`}
                              >
                                <input
                                  type="number"
                                  min={0}
                                  max={24}
                                  value={val === 0 ? "" : val}
                                  placeholder="·"
                                  onChange={(e) => {
                                    const num = Math.max(0, Number(e.target.value) || 0);
                                    const nextPekan = { ...row.pekanJp };
                                    if (num === 0) delete nextPekan[key];
                                    else nextPekan[key] = num;
                                    const nextRows = activeProsem.rows.map((r, i) =>
                                      i === rIdx ? { ...r, pekanJp: nextPekan } : r
                                    );
                                    updateProsem({ ...activeProsem, rows: nextRows });
                                  }}
                                  className="h-7 w-full bg-transparent text-center font-mono text-[11px] font-semibold text-ink outline-none focus:bg-white"
                                />
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

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
    </div>
  );
}
