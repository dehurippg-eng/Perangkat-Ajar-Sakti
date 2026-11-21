import { useState } from "react";
import {
  CheckSquare,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Printer,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { JENJANG_CONFIG, type Jenjang } from "../types/modul";
import type {
  AcademicClass,
  AcademicStudent,
  AkademikSignatureMeta,
  AkademikWorkspaceData,
  AttendanceCode,
  AttendanceMap,
  GradeSheetMap,
  StudentGradeEntry,
} from "../types/akademik";
import { NAMA_BULAN_ID, TAHUN_AJARAN_OPTIONS } from "../types/akademik";
import {
  computeStudentAttendanceStats,
  computeStudentGradeSummary,
  getMonthAttendanceDays,
  parseTahunAjaran,
} from "../lib/akademikEngine";
import {
  downloadCsvFile,
  exportPresensiToDocx,
  exportRekapNilaiToDocx,
} from "../lib/akademikDocxExport";
import {
  exportPresensiToPdf,
  exportRekapNilaiToPdf,
} from "../lib/akademikPdfExport";

interface PresensiNilaiViewProps {
  workspace: AkademikWorkspaceData;
  onChangeTahunAjaran: (tahun: string) => void;
  onUpdateClasses: (classes: AcademicClass[], selectedClassId: string) => void;
  onUpdatePresensi: (key: string, map: AttendanceMap) => void;
  onUpdateNilai: (key: string, map: GradeSheetMap) => void;
  onUpdateNilaiSettings: (kktpMinimal: number, bobotFormatif: number) => void;
  onUpdateMeta: (meta: AkademikSignatureMeta) => void;
  onSaveWorkspace: () => Promise<void>;
  saving: boolean;
}

const NEXT_ATTENDANCE_CODE: Record<AttendanceCode, AttendanceCode> = {
  "": "H",
  H: "S",
  S: "I",
  I: "A",
  A: "",
};

const ATTENDANCE_CELL_STYLE: Record<AttendanceCode, string> = {
  "": "bg-white text-slate-300 hover:bg-slate-50",
  H: "bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100",
  S: "bg-amber-50 text-amber-800 font-bold hover:bg-amber-100",
  I: "bg-sky-50 text-sky-800 font-bold hover:bg-sky-100",
  A: "bg-red-50 text-red-700 font-bold hover:bg-red-100",
};

export function PresensiNilaiView({
  workspace,
  onChangeTahunAjaran,
  onUpdateClasses,
  onUpdatePresensi,
  onUpdateNilai,
  onUpdateNilaiSettings,
  onSaveWorkspace,
  saving,
}: PresensiNilaiViewProps) {
  const [subTab, setSubTab] = useState<"presensi" | "nilai" | "kelas">("presensi");
  const activeClass =
    workspace.classes.find((c) => c.id === workspace.selectedClassId) ?? workspace.classes[0];

  const [mataPelajaran, setMataPelajaran] = useState<string>(
    activeClass?.mataPelajaranDefault ?? "IPA (Ilmu Pengetahuan Alam)"
  );
  const [month, setMonth] = useState<number>(7);
  const [semesterNilai, setSemesterNilai] = useState<1 | 2>(1);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Class & Student Management Form States
  const [newClassName, setNewClassName] = useState("");
  const [newClassJenjang, setNewClassJenjang] = useState<Jenjang>("SMP/MTs");
  const [newClassFase, setNewClassFase] = useState("Fase D");
  const [newClassTingkat, setNewClassTingkat] = useState("Kelas 8");
  const [newClassMapel, setNewClassMapel] = useState("IPA (Ilmu Pengetahuan Alam)");

  const [newStuNis, setNewStuNis] = useState("");
  const [newStuNama, setNewStuNama] = useState("");
  const [newStuGender, setNewStuGender] = useState<"L" | "P">("L");
  const [bulkText, setBulkText] = useState("");

  if (!activeClass) return null;

  const { startYear, endYear } = parseTahunAjaran(workspace.tahunAjaran);
  const calendarYear = month >= 7 ? startYear : endYear;
  const yearMonthKey = `${calendarYear}-${String(month).padStart(2, "0")}`;
  const presensiKey = `${workspace.tahunAjaran}|${yearMonthKey}|${activeClass.id}|${mataPelajaran}`;
  const nilaiKey = `${workspace.tahunAjaran}|${semesterNilai}|${activeClass.id}|${mataPelajaran}`;

  const attendanceMap: AttendanceMap = workspace.presensiRecords[presensiKey] ?? {};
  const gradeMap: GradeSheetMap = workspace.nilaiRecords[nilaiKey] ?? {};

  const days = getMonthAttendanceDays(
    calendarYear,
    month,
    workspace.tahunAjaran,
    workspace.hariSekolah,
    workspace.kaldikOverrides[workspace.tahunAjaran]
  );

  function handleSelectClass(classId: string) {
    const found = workspace.classes.find((c) => c.id === classId);
    onUpdateClasses(workspace.classes, classId);
    if (found) setMataPelajaran(found.mataPelajaranDefault);
  }

  // Attendance Handlers
  function handleToggleAttendanceCell(studentId: string, dateStr: string) {
    const k = `${studentId}|${dateStr}`;
    const curr = attendanceMap[k] ?? "";
    const next = NEXT_ATTENDANCE_CODE[curr];
    const updated = { ...attendanceMap };
    if (next === "") delete updated[k];
    else updated[k] = next;
    onUpdatePresensi(presensiKey, updated);
  }

  function handleMarkColumnPresent(dateStr: string) {
    const updated = { ...attendanceMap };
    const allAlreadyH = activeClass.students.every((s) => updated[`${s.id}|${dateStr}`] === "H");
    activeClass.students.forEach((s) => {
      const k = `${s.id}|${dateStr}`;
      if (allAlreadyH) delete updated[k];
      else updated[k] = "H";
    });
    onUpdatePresensi(presensiKey, updated);
  }

  function handleMarkAllMonthPresent() {
    const updated = { ...attendanceMap };
    activeClass.students.forEach((s) => {
      days.forEach((d) => {
        if (d.isEffective) {
          const k = `${s.id}|${d.dateStr}`;
          if (!updated[k]) updated[k] = "H";
        }
      });
    });
    onUpdatePresensi(presensiKey, updated);
  }

  function handleClearMonthAttendance() {
    onUpdatePresensi(presensiKey, {});
  }

  // Grade Handlers
  function handleUpdateGradeField(
    studentId: string,
    field: keyof StudentGradeEntry,
    rawVal: string
  ) {
    const existing: StudentGradeEntry = gradeMap[studentId] ?? {
      tp1: null,
      tp2: null,
      tp3: null,
      tp4: null,
      lm1: null,
      lm2: null,
      sts: null,
      sas: null,
    };
    const parsed = rawVal.trim() === "" ? null : Math.max(0, Math.min(100, Number(rawVal)));
    const safeVal = parsed !== null && Number.isFinite(parsed) ? parsed : null;
    onUpdateNilai(nilaiKey, {
      ...gradeMap,
      [studentId]: { ...existing, [field]: safeVal },
    });
  }

  function handleSeedSampleGrades() {
    const seeded: GradeSheetMap = {};
    activeClass.students.forEach((stu, i) => {
      const base = 70 + ((i * 7) % 24);
      seeded[stu.id] = {
        tp1: Math.min(98, base + 2),
        tp2: Math.min(98, base - 1),
        tp3: Math.min(98, base + 4),
        tp4: Math.min(98, base + 1),
        lm1: Math.min(98, base),
        lm2: Math.min(98, base + 3),
        sts: Math.min(98, base - 2),
        sas: Math.min(98, base + 2),
      };
    });
    onUpdateNilai(nilaiKey, seeded);
  }

  function handleClearGrades() {
    onUpdateNilai(nilaiKey, {});
  }

  // Class & Roster Handlers
  function handleCreateClass() {
    const name = newClassName.trim();
    if (!name) return;
    const created: AcademicClass = {
      id: `kelas-${Date.now()}`,
      namaKelas: name,
      jenjang: newClassJenjang,
      fase: newClassFase,
      kelasTingkat: newClassTingkat,
      mataPelajaranDefault: newClassMapel,
      students: [],
    };
    onUpdateClasses([...workspace.classes, created], created.id);
    setMataPelajaran(created.mataPelajaranDefault);
    setNewClassName("");
  }

  function handleDeleteClass(classId: string) {
    if (workspace.classes.length <= 1) return;
    const nextClasses = workspace.classes.filter((c) => c.id !== classId);
    onUpdateClasses(nextClasses, nextClasses[0].id);
    setMataPelajaran(nextClasses[0].mataPelajaranDefault);
  }

  function handleAddStudent() {
    const nama = newStuNama.trim();
    if (!nama) return;
    const nis =
      newStuNis.trim() || `${startYear}${String(activeClass.students.length + 1).padStart(3, "0")}`;
    const newStu: AcademicStudent = {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nis,
      nama,
      jenisKelamin: newStuGender,
    };
    const nextClasses = workspace.classes.map((c) =>
      c.id === activeClass.id ? { ...c, students: [...c.students, newStu] } : c
    );
    onUpdateClasses(nextClasses, activeClass.id);
    setNewStuNis("");
    setNewStuNama("");
  }

  function handleDeleteStudent(studentId: string) {
    const nextClasses = workspace.classes.map((c) =>
      c.id === activeClass.id
        ? { ...c, students: c.students.filter((s) => s.id !== studentId) }
        : c
    );
    onUpdateClasses(nextClasses, activeClass.id);
  }

  function handleBulkImport(replaceExisting: boolean) {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const baseOffset = replaceExisting ? 0 : activeClass.students.length;
    const parsed: AcademicStudent[] = lines.map((line, idx) => {
      const parts = line.split(/[;\t,]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const nis = parts[0] || `${startYear}${String(baseOffset + idx + 1).padStart(3, "0")}`;
        const nama = parts[1] || `Siswa ${baseOffset + idx + 1}`;
        const jkRaw = (parts[2] || "").toUpperCase();
        const jenisKelamin: "L" | "P" = jkRaw === "P" ? "P" : "L";
        return {
          id: `stu-${Date.now()}-${idx}`,
          nis,
          nama,
          jenisKelamin,
        };
      }
      return {
        id: `stu-${Date.now()}-${idx}`,
        nis: `${startYear}${String(baseOffset + idx + 1).padStart(3, "0")}`,
        nama: line,
        jenisKelamin: "L",
      };
    });

    const nextClasses = workspace.classes.map((c) =>
      c.id === activeClass.id
        ? { ...c, students: replaceExisting ? parsed : [...c.students, ...parsed] }
        : c
    );
    onUpdateClasses(nextClasses, activeClass.id);
    setBulkText("");
  }

  // Export Handlers
  async function handleExportPresensiDocx() {
    setExporting(true);
    try {
      await exportPresensiToDocx({
        academicClass: activeClass,
        mataPelajaran,
        tahunAjaran: workspace.tahunAjaran,
        month,
        year: calendarYear,
        days,
        attendanceMap,
        meta: workspace.meta,
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPresensiPdf() {
    setExportingPdf(true);
    try {
      await exportPresensiToPdf({
        academicClass: activeClass,
        mataPelajaran,
        tahunAjaran: workspace.tahunAjaran,
        month,
        year: calendarYear,
        days,
        attendanceMap,
        meta: workspace.meta,
      });
    } finally {
      setExportingPdf(false);
    }
  }

  function handleExportPresensiCsv() {
    const headers = ["No", "NIS", "Nama Siswa", ...days.map((d) => String(d.day)), "H", "S", "I", "A", "% Hadir"];
    const rows = activeClass.students.map((stu, idx) => {
      const stats = computeStudentAttendanceStats(stu.id, days, attendanceMap);
      return [
        idx + 1,
        stu.nis,
        stu.nama,
        ...days.map((d) => (d.isEffective ? attendanceMap[`${stu.id}|${d.dateStr}`] ?? "" : "L")),
        stats.hadir,
        stats.sakit,
        stats.izin,
        stats.alpa,
        `${stats.persenHadir}%`,
      ];
    });
    downloadCsvFile(
      headers,
      rows,
      `daftar-hadir-${activeClass.namaKelas.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${yearMonthKey}.csv`
    );
  }

  async function handleExportNilaiDocx() {
    setExporting(true);
    try {
      await exportRekapNilaiToDocx({
        academicClass: activeClass,
        mataPelajaran,
        tahunAjaran: workspace.tahunAjaran,
        semester: semesterNilai,
        kktpMinimal: workspace.kktpMinimal,
        bobotFormatif: workspace.bobotFormatif,
        gradeMap,
        meta: workspace.meta,
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleExportNilaiPdf() {
    setExportingPdf(true);
    try {
      await exportRekapNilaiToPdf({
        academicClass: activeClass,
        mataPelajaran,
        tahunAjaran: workspace.tahunAjaran,
        semester: semesterNilai,
        kktpMinimal: workspace.kktpMinimal,
        bobotFormatif: workspace.bobotFormatif,
        gradeMap,
        meta: workspace.meta,
      });
    } finally {
      setExportingPdf(false);
    }
  }

  function handleExportNilaiCsv() {
    const headers = [
      "No",
      "NIS",
      "Nama Siswa",
      "TP1",
      "TP2",
      "TP3",
      "TP4",
      "Avg Formatif",
      "LM1",
      "LM2",
      "STS",
      "SAS",
      "Avg Sumatif",
      "Nilai Akhir",
      "Predikat",
      "Tindak Lanjut",
    ];
    const rows = activeClass.students.map((stu, idx) => {
      const e = gradeMap[stu.id];
      const sum = computeStudentGradeSummary(e, workspace.kktpMinimal, workspace.bobotFormatif);
      return [
        idx + 1,
        stu.nis,
        stu.nama,
        e?.tp1 ?? "",
        e?.tp2 ?? "",
        e?.tp3 ?? "",
        e?.tp4 ?? "",
        sum.avgFormatif ?? "",
        e?.lm1 ?? "",
        e?.lm2 ?? "",
        e?.sts ?? "",
        e?.sas ?? "",
        sum.avgSumatif ?? "",
        sum.nilaiAkhir ?? "",
        sum.predikat,
        sum.tindakLanjut,
      ];
    });
    downloadCsvFile(
      headers,
      rows,
      `rekap-nilai-${activeClass.namaKelas.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-smt${semesterNilai}.csv`
    );
  }

  // Class Grade Analytics
  const computedGrades = activeClass.students.map((s) =>
    computeStudentGradeSummary(gradeMap[s.id], workspace.kktpMinimal, workspace.bobotFormatif)
  );
  const validScores = computedGrades
    .map((g) => g.nilaiAkhir)
    .filter((v): v is number => typeof v === "number");
  const classAvg =
    validScores.length > 0
      ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
      : null;
  const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;
  const minScore = validScores.length > 0 ? Math.min(...validScores) : null;
  const tuntasCount = computedGrades.filter((g) => g.tuntas === true).length;

  const mapelOptions = JENJANG_CONFIG[activeClass.jenjang]?.mapel ?? [];

  return (
    <div className="space-y-5">
      {/* Sub-Tabs & Actions Toolbar */}
      <div className="no-print space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                { id: "presensi", label: "Daftar Hadir Siswa Otomatis" },
                { id: "nilai", label: "Rekap Nilai Siswa Otomatis" },
                { id: "kelas", label: "Data Kelas & Siswa" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  subTab === t.id ? "bg-card text-ink shadow-xs" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSaveWorkspace}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>{saving ? "Menyimpan..." : "Simpan Data"}</span>
            </button>

            {subTab !== "kelas" && (
              <>
                <button
                  type="button"
                  onClick={subTab === "presensi" ? handleExportPresensiCsv : handleExportNilaiCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileSpreadsheet className="size-3.5" />
                  <span>Unduh CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={subTab === "presensi" ? handleExportPresensiPdf : handleExportNilaiPdf}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-emerald-100 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {exportingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
                  <span>{exportingPdf ? "Menyiapkan..." : "Unduh PDF (.pdf)"}</span>
                </button>
                <button
                  type="button"
                  onClick={subTab === "presensi" ? handleExportPresensiDocx : handleExportNilaiDocx}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:bg-primary disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>{exporting ? "Menyiapkan..." : "Unduh Word (.docx)"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Row */}
        {subTab !== "kelas" && (
          <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-5">
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
              <label className="block text-[11px] font-semibold text-muted-foreground">Kelas / Rombel</label>
              <select
                value={activeClass.id}
                onChange={(e) => handleSelectClass(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
              >
                {workspace.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.namaKelas} ({c.students.length} siswa)
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
                {Array.from(new Set([activeClass.mataPelajaranDefault, ...mapelOptions])).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {subTab === "presensi" ? (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground">Bulan</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
                  >
                    {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((mNum) => (
                      <option key={mNum} value={mNum}>
                        {NAMA_BULAN_ID[mNum - 1]} {mNum >= 7 ? startYear : endYear} (Smt{" "}
                        {mNum >= 7 ? 1 : 2})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleMarkAllMonthPresent}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10 whitespace-nowrap cursor-pointer"
                  >
                    <CheckSquare className="size-3.5" />
                    <span>Hadir Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMonthAttendance}
                    className="h-9 rounded-lg border border-border bg-canvas px-2.5 text-xs font-medium text-muted-foreground hover:text-red-700 cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground">Semester</label>
                  <select
                    value={semesterNilai}
                    onChange={(e) => setSemesterNilai(Number(e.target.value) as 1 | 2)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs font-semibold text-ink outline-none focus:border-primary"
                  >
                    <option value={1}>Semester I (Ganjil)</option>
                    <option value={2}>Semester II (Genap)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground">
                      KKTP Min
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={workspace.kktpMinimal}
                      onChange={(e) =>
                        onUpdateNilaiSettings(
                          Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                          workspace.bobotFormatif
                        )
                      }
                      className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 font-mono text-xs font-semibold text-ink outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground">
                      Bobot Fmt %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={workspace.bobotFormatif}
                      onChange={(e) =>
                        onUpdateNilaiSettings(
                          workspace.kktpMinimal,
                          Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        )
                      }
                      className="mt-1 h-9 w-full rounded-lg border border-border bg-canvas px-2.5 font-mono text-xs font-semibold text-ink outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: DAFTAR HADIR OTOMATIS */}
      {subTab === "presensi" && (
        <div className="print-container space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
          <header className="border-b-2 border-ink pb-4 text-center">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              {workspace.meta.sekolah}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              DAFTAR HADIR PESERTA DIDIK · {NAMA_BULAN_ID[month - 1].toUpperCase()} {calendarYear}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {activeClass.namaKelas} ({activeClass.jenjang} · {activeClass.fase}) · {mataPelajaran} · Tahun Ajaran{" "}
              {workspace.tahunAjaran}
            </p>
          </header>

          <div className="no-print flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>
              Klik tanggal pada header kolom untuk menandai seluruh siswa <strong>Hadir (H)</strong>, atau klik sel siswa untuk mengubah siklus{" "}
              <strong className="font-mono">H → S → I → A</strong>. Hari libur/akhir pekan otomatis bertanda <strong className="font-mono">L</strong> dari Kaldik.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-ink text-ink-foreground">
                  <th className="w-7 border border-ink px-1 py-1.5 text-center">No</th>
                  <th className="min-w-[165px] border border-ink px-2 py-1.5 text-left">
                    Nama Peserta Didik
                  </th>
                  {days.map((d) => (
                    <th
                      key={d.dateStr}
                      onClick={() => d.isEffective && handleMarkColumnPresent(d.dateStr)}
                      title={
                        d.isEffective
                          ? `${d.dayName}, ${d.dateStr} — Klik untuk tandai semua Hadir`
                          : `${d.dayName}, ${d.dateStr}: ${d.offReason}`
                      }
                      className={`w-6 border border-white/20 px-0.5 py-1 text-center font-mono ${
                        d.isEffective
                          ? "cursor-pointer bg-ink hover:bg-primary"
                          : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      <div>{d.day}</div>
                      <div className="text-[9px] font-normal opacity-80">{d.dayName.slice(0, 2)}</div>
                    </th>
                  ))}
                  <th className="w-7 border border-ink bg-primary px-1 py-1.5 text-center">H</th>
                  <th className="w-7 border border-ink bg-primary px-1 py-1.5 text-center">S</th>
                  <th className="w-7 border border-ink bg-primary px-1 py-1.5 text-center">I</th>
                  <th className="w-7 border border-ink bg-primary px-1 py-1.5 text-center">A</th>
                  <th className="w-10 border border-ink bg-primary px-1 py-1.5 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {activeClass.students.map((stu, idx) => {
                  const stats = computeStudentAttendanceStats(stu.id, days, attendanceMap);
                  return (
                    <tr key={stu.id} className="odd:bg-white even:bg-slate-50/50">
                      <td className="border border-border px-1 py-1 text-center font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="border border-border px-2 py-1 font-medium text-ink">
                        {stu.nama}
                      </td>
                      {days.map((d) => {
                        if (!d.isEffective) {
                          return (
                            <td
                              key={d.dateStr}
                              title={d.offReason}
                              className="border border-border bg-slate-100 text-center font-mono text-[10px] text-slate-400"
                            >
                              L
                            </td>
                          );
                        }
                        const code: AttendanceCode = attendanceMap[`${stu.id}|${d.dateStr}`] ?? "";
                        return (
                          <td key={d.dateStr} className="border border-border p-0 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendanceCell(stu.id, d.dateStr)}
                              className={`h-6 w-full font-mono text-[10px] transition-colors cursor-pointer ${ATTENDANCE_CELL_STYLE[code]}`}
                            >
                              {code || "·"}
                            </button>
                          </td>
                        );
                      })}
                      <td className="border border-border bg-emerald-50/50 px-1 py-1 text-center font-mono font-bold text-ink tabular-nums">
                        {stats.hadir}
                      </td>
                      <td className="border border-border px-1 py-1 text-center font-mono tabular-nums">
                        {stats.sakit}
                      </td>
                      <td className="border border-border px-1 py-1 text-center font-mono tabular-nums">
                        {stats.izin}
                      </td>
                      <td className="border border-border px-1 py-1 text-center font-mono text-red-700 tabular-nums">
                        {stats.alpa}
                      </td>
                      <td className="border border-border px-1 py-1 text-center font-mono font-bold text-primary tabular-nums">
                        {stats.persenHadir}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
      )}

      {/* TAB 2: REKAP NILAI OTOMATIS */}
      {subTab === "nilai" && (
        <div className="print-container space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
          <header className="border-b-2 border-ink pb-4 text-center">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              {workspace.meta.sekolah}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              REKAPITULASI NILAI & KETUNTASAN KKTP · SEMESTER{" "}
              {semesterNilai === 1 ? "I (GANJIL)" : "II (GENAP)"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {activeClass.namaKelas} ({activeClass.jenjang} · {activeClass.fase}) · {mataPelajaran} · KKTP Minimal{" "}
              {workspace.kktpMinimal} · Bobot {workspace.bobotFormatif}% Formatif /{" "}
              {100 - workspace.bobotFormatif}% Sumatif · TA {workspace.tahunAjaran}
            </p>
          </header>

          {/* Class Analytics Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-canvas px-4 py-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground">Rata-Rata Kelas</p>
              <p className="mt-0.5 font-mono text-xl font-bold text-ink tabular-nums">
                {classAvg ?? "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-canvas px-4 py-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground">Tertinggi / Terendah</p>
              <p className="mt-0.5 font-mono text-xl font-bold text-ink tabular-nums">
                {maxScore ?? "—"} / {minScore ?? "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-canvas px-4 py-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground">Tuntas KKTP</p>
              <p className="mt-0.5 font-mono text-xl font-bold text-primary tabular-nums">
                {tuntasCount} / {activeClass.students.length}
              </p>
            </div>
            <div className="no-print flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleSeedSampleGrades}
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
              >
                Isi Contoh Nilai
              </button>
              <button
                type="button"
                onClick={handleClearGrades}
                className="rounded-lg border border-border bg-canvas px-3 py-2 text-xs font-medium text-muted-foreground hover:text-red-700 cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-ink text-ink-foreground">
                  <th className="w-7 border border-ink px-1 py-2 text-center">No</th>
                  <th className="w-20 border border-ink px-2 py-2 text-left">NIS</th>
                  <th className="min-w-[160px] border border-ink px-2 py-2 text-left">
                    Nama Peserta Didik
                  </th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">TP1</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">TP2</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">TP3</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">TP4</th>
                  <th className="w-14 border border-ink bg-primary px-1 py-2 text-center">Avg Fmt</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">LM1</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">LM2</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">STS</th>
                  <th className="w-11 border border-ink px-1 py-2 text-center">SAS</th>
                  <th className="w-14 border border-ink bg-primary px-1 py-2 text-center">Avg Smt</th>
                  <th className="w-12 border border-ink px-1 py-2 text-center">NA</th>
                  <th className="w-24 border border-ink px-2 py-2 text-left">Predikat</th>
                  <th className="min-w-[150px] border border-ink px-2 py-2 text-left">
                    Tindak Lanjut
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeClass.students.map((stu, idx) => {
                  const entry = gradeMap[stu.id];
                  const sum = computeStudentGradeSummary(
                    entry,
                    workspace.kktpMinimal,
                    workspace.bobotFormatif
                  );
                  const numField = (field: keyof StudentGradeEntry, val: number | null | undefined) => (
                    <td key={field} className="border border-border p-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={typeof val === "number" ? val : ""}
                        placeholder="—"
                        onChange={(e) => handleUpdateGradeField(stu.id, field, e.target.value)}
                        className="h-7 w-full bg-transparent text-center font-mono text-[11px] text-ink outline-none focus:bg-emerald-50"
                      />
                    </td>
                  );

                  return (
                    <tr key={stu.id} className="odd:bg-white even:bg-slate-50/50">
                      <td className="border border-border px-1 py-1 text-center font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="border border-border px-2 py-1 font-mono text-muted-foreground tabular-nums">
                        {stu.nis}
                      </td>
                      <td className="border border-border px-2 py-1 font-medium text-ink">
                        {stu.nama}
                      </td>
                      {numField("tp1", entry?.tp1)}
                      {numField("tp2", entry?.tp2)}
                      {numField("tp3", entry?.tp3)}
                      {numField("tp4", entry?.tp4)}
                      <td className="border border-border bg-slate-100 px-1 py-1 text-center font-mono font-semibold text-ink tabular-nums">
                        {sum.avgFormatif ?? "—"}
                      </td>
                      {numField("lm1", entry?.lm1)}
                      {numField("lm2", entry?.lm2)}
                      {numField("sts", entry?.sts)}
                      {numField("sas", entry?.sas)}
                      <td className="border border-border bg-slate-100 px-1 py-1 text-center font-mono font-semibold text-ink tabular-nums">
                        {sum.avgSumatif ?? "—"}
                      </td>
                      <td
                        className={`border border-border px-1 py-1 text-center font-mono font-bold tabular-nums ${
                          sum.tuntas === false
                            ? "bg-red-50 text-red-700"
                            : sum.tuntas === true
                              ? "bg-emerald-50 text-primary"
                              : "text-muted-foreground"
                        }`}
                      >
                        {sum.nilaiAkhir ?? "—"}
                      </td>
                      <td
                        className={`border border-border px-2 py-1 font-semibold ${
                          sum.tuntas === false ? "text-red-700" : "text-ink"
                        }`}
                      >
                        {sum.predikat}
                      </td>
                      <td className="border border-border px-2 py-1 text-slate-700">
                        {sum.tindakLanjut}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
      )}

      {/* TAB 3: DATA KELAS & SISWA */}
      {subTab === "kelas" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Classes List & Create Class */}
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 lg:col-span-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-ink">Daftar Kelas / Rombel</h3>
            </div>

            <div className="space-y-2">
              {workspace.classes.map((c) => {
                const selected = c.id === activeClass.id;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-canvas hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectClass(c.id)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <p className="text-xs font-bold text-ink">{c.namaKelas}</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {c.jenjang} · {c.kelasTingkat} · {c.students.length} siswa
                      </p>
                    </button>
                    {workspace.classes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(c.id)}
                        title="Hapus Kelas"
                        className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5 border-t border-border pt-4">
              <p className="text-xs font-semibold text-primary">Tambah Kelas / Rombel Baru</p>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Nama Kelas (mis. Kelas 7B / X-IPA-1)"
                className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newClassJenjang}
                  onChange={(e) => {
                    const nextJ = e.target.value as Jenjang;
                    setNewClassJenjang(nextJ);
                    setNewClassFase(JENJANG_CONFIG[nextJ].fases[0].fase);
                    setNewClassTingkat(JENJANG_CONFIG[nextJ].fases[0].kelasList[0]);
                    setNewClassMapel(JENJANG_CONFIG[nextJ].mapel[0]);
                  }}
                  className="h-9 rounded-lg border border-border bg-canvas px-2 text-xs text-ink outline-none focus:border-primary"
                >
                  {(Object.keys(JENJANG_CONFIG) as Jenjang[]).map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                <select
                  value={newClassTingkat}
                  onChange={(e) => {
                    const k = e.target.value;
                    setNewClassTingkat(k);
                    const foundF = JENJANG_CONFIG[newClassJenjang].fases.find((f) =>
                      f.kelasList.includes(k)
                    );
                    if (foundF) setNewClassFase(foundF.fase);
                  }}
                  className="h-9 rounded-lg border border-border bg-canvas px-2 text-xs text-ink outline-none focus:border-primary"
                >
                  {JENJANG_CONFIG[newClassJenjang].fases.flatMap((f) =>
                    f.kelasList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <select
                value={newClassMapel}
                onChange={(e) => setNewClassMapel(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-canvas px-2.5 text-xs text-ink outline-none focus:border-primary"
              >
                {JENJANG_CONFIG[newClassJenjang].mapel.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateClass}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-ink text-xs font-semibold text-ink-foreground hover:bg-primary cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Buat Kelas Baru</span>
              </button>
            </div>
          </section>

          {/* Right: Active Class Students + Bulk Paste */}
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-ink">
                  Peserta Didik · {activeClass.namaKelas}
                </h3>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {activeClass.students.length} siswa terdaftar (sinkron otomatis ke Daftar Hadir & Rekap Nilai)
                </p>
              </div>
            </div>

            {/* Single Student Add */}
            <div className="grid gap-2 sm:grid-cols-12">
              <input
                type="text"
                value={newStuNis}
                onChange={(e) => setNewStuNis(e.target.value)}
                placeholder="NIS (Opsional)"
                className="h-9 rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary sm:col-span-3"
              />
              <input
                type="text"
                value={newStuNama}
                onChange={(e) => setNewStuNama(e.target.value)}
                placeholder="Nama Lengkap Peserta Didik"
                className="h-9 rounded-lg border border-border bg-canvas px-3 text-xs text-ink outline-none focus:border-primary sm:col-span-5"
              />
              <select
                value={newStuGender}
                onChange={(e) => setNewStuGender(e.target.value as "L" | "P")}
                className="h-9 rounded-lg border border-border bg-canvas px-2.5 text-xs text-ink outline-none focus:border-primary sm:col-span-2"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              <button
                type="button"
                onClick={handleAddStudent}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-ink sm:col-span-2 cursor-pointer"
              >
                <UserPlus className="size-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100">
                  <tr>
                    <th className="w-10 border-b border-border px-2 py-2 text-center">No</th>
                    <th className="w-28 border-b border-border px-2.5 py-2 text-left">NIS</th>
                    <th className="border-b border-border px-2.5 py-2 text-left">Nama Lengkap</th>
                    <th className="w-14 border-b border-border px-2 py-2 text-center">L/P</th>
                    <th className="w-14 border-b border-border px-2 py-2 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody>
                  {activeClass.students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        Belum ada peserta didik di kelas ini. Tambahkan manual atau tempel daftar nama di bawah.
                      </td>
                    </tr>
                  ) : (
                    activeClass.students.map((stu, idx) => (
                      <tr key={stu.id} className="odd:bg-white even:bg-slate-50/50">
                        <td className="border-b border-border px-2 py-1.5 text-center font-mono tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="border-b border-border px-2.5 py-1.5 font-mono text-muted-foreground tabular-nums">
                          {stu.nis}
                        </td>
                        <td className="border-b border-border px-2.5 py-1.5 font-medium text-ink">
                          {stu.nama}
                        </td>
                        <td className="border-b border-border px-2 py-1.5 text-center font-mono">
                          {stu.jenisKelamin}
                        </td>
                        <td className="border-b border-border px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(stu.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bulk Paste Import */}
            <div className="space-y-2 rounded-lg border border-border bg-canvas p-4">
              <p className="text-xs font-semibold text-primary">
                Tempel Daftar Nama Siswa Massal (dari Excel / Word)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tulis 1 siswa per baris. Format: <code className="font-mono">Nama Lengkap</code> atau{" "}
                <code className="font-mono">NIS; Nama Lengkap; L/P</code>.
              </p>
              <textarea
                rows={4}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"2026011; Andi Pratama; L\n2026012; Bella Safitri; P"}
                className="w-full rounded-lg border border-border bg-white p-2.5 font-mono text-xs text-ink outline-none focus:border-primary"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkImport(false)}
                  className="rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-ink-foreground hover:bg-primary cursor-pointer"
                >
                  Tambahkan ke Kelas Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkImport(true)}
                  className="rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:bg-slate-50 cursor-pointer"
                >
                  Ganti Seluruh Siswa Kelas Ini
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
