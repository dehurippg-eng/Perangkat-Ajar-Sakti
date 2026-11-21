import type { Jenjang } from "./modul";

export type HariSekolahMode = 5 | 6;

export type KaldikDayStatus =
  | "efektif"
  | "libur_akhir_pekan"
  | "libur_nasional"
  | "libur_semester"
  | "mpls"
  | "sts"
  | "sas"
  | "rapor"
  | "kegiatan";

export interface KaldikDayNote {
  status: KaldikDayStatus;
  label: string;
}

export interface AcademicStudent {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: "L" | "P";
}

export interface AcademicClass {
  id: string;
  namaKelas: string;
  jenjang: Jenjang;
  fase: string;
  kelasTingkat: string;
  mataPelajaranDefault: string;
  students: AcademicStudent[];
}

export interface ProtaRow {
  id: string;
  semester: 1 | 2;
  elemen: string;
  materiPokok: string;
  alokasiJp: number;
  keterangan: string;
}

export interface ProtaDocument {
  tahunAjaran: string;
  jenjang: Jenjang;
  fase: string;
  kelas: string;
  mataPelajaran: string;
  jpPerMinggu: number;
  rows: ProtaRow[];
}

export interface ProsemRow {
  id: string;
  semester: 1 | 2;
  materiPokok: string;
  alokasiJp: number;
  // Kunci: `${month}-${weekIndex}` (misal "7-1" s.d "12-5"), nilai = jumlah JP pada pekan tersebut
  pekanJp: Record<string, number>;
  keterangan: string;
}

export interface ProsemDocument {
  tahunAjaran: string;
  semester: 1 | 2;
  jenjang: Jenjang;
  fase: string;
  kelas: string;
  mataPelajaran: string;
  rows: ProsemRow[];
}

export type AttendanceCode = "H" | "S" | "I" | "A" | "";

// key: `${studentId}|${YYYY-MM-DD}`
export type AttendanceMap = Record<string, AttendanceCode>;

export interface StudentGradeEntry {
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  tp4: number | null;
  lm1: number | null;
  lm2: number | null;
  sts: number | null;
  sas: number | null;
}

// key: studentId
export type GradeSheetMap = Record<string, StudentGradeEntry>;

export interface AkademikSignatureMeta {
  sekolah: string;
  penyusun: string;
  nipGuru: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  kotaTanggal: string;
}

export type CoverThemeId = "zamrud-emas" | "minimalis-tegas" | "bingkai-akademik";
export type CoverLogoPreset = "tut-wuri" | "pelita" | "garuda-perisai" | "tanpa-logo";

export interface CoverPerangkatConfig {
  tema: CoverThemeId;
  instansiAtas: string;
  subInstansi: string;
  namaSekolah: string;
  alamatSekolah: string;
  judulUtama: string;
  subJudul: string;
  mataPelajaran: string;
  jenjangFaseKelas: string;
  semester: string;
  tahunAjaran: string;
  daftarBerkas: string[];
  namaGuru: string;
  nipGuru: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  kotaTahun: string;
  logoPreset: CoverLogoPreset;
  customLogoDataUrl?: string;
}

export interface AkademikWorkspaceData {
  tahunAjaran: string;
  hariSekolah: HariSekolahMode;
  kktpMinimal: number;
  bobotFormatif: number; // persentase 0-100, sisanya bobot sumatif
  meta: AkademikSignatureMeta;
  coverConfig: CoverPerangkatConfig;
  classes: AcademicClass[];
  selectedClassId: string;
  // key: tahunAjaran -> { "YYYY-MM-DD": KaldikDayNote }
  kaldikOverrides: Record<string, Record<string, KaldikDayNote>>;
  // key: `${tahunAjaran}|${jenjang}|${kelas}|${mataPelajaran}`
  protaRecords: Record<string, ProtaDocument>;
  // key: `${tahunAjaran}|${semester}|${jenjang}|${kelas}|${mataPelajaran}`
  prosemRecords: Record<string, ProsemDocument>;
  // key: `${tahunAjaran}|${yearMonth}|${classId}|${mataPelajaran}` (yearMonth = YYYY-MM)
  presensiRecords: Record<string, AttendanceMap>;
  // key: `${tahunAjaran}|${semester}|${classId}|${mataPelajaran}`
  nilaiRecords: Record<string, GradeSheetMap>;
}

export const TAHUN_AJARAN_OPTIONS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
] as const;

export const NAMA_BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export const HARI_SINGKAT_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
