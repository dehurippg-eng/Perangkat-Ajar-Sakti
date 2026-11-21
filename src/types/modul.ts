export type Jenjang = "SD/MI" | "SMP/MTs" | "SMA/MA" | "SMK/MAK";

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  school: string;
  role: "admin" | "guru";
  jabatan?: string;
  createdAt?: string;
}

export interface LearningStep {
  phase: string;
  principle: string;
  durationMinutes: number;
  teacherActivities: string[];
  studentActivities: string[];
}

export interface RubricCriterion {
  criterion: string;
  excellent: string;
  good: string;
  developing: string;
  needsSupport: string;
}

export interface LkpdActivity {
  stepNumber: number;
  title: string;
  instruction: string;
  promptQuestions: string[];
  answerLines: number;
}

export interface SoalAsesmen {
  nomor: number;
  indikator: string;
  levelKognitif: string;
  pertanyaan: string;
  kunciJawaban: string;
}

export interface GlosariumItem {
  istilah: string;
  definisi: string;
}

export interface DiagnostikKognitifItem {
  nomor: number;
  pertanyaan: string;
  tujuanPemetaan: string;
  tindakLanjut: string;
}

export interface AspekSikapItem {
  dimensi: string;
  indikator: string;
  kriteriaTampak: string;
}

export interface IntervalKktpItem {
  rentang: string;
  predikat: string;
  interpretasi: string;
  tindakLanjut: string;
}

export interface MediaAjarData {
  mediaUtama: string[];
  alatDanBahanPendukung: string[];
  sumberDigital: string;
  panduanPenggunaan: string;
}

export interface LampiranModul {
  asesmenDiagnostik?: {
    tujuanDiagnostik: string;
    diagnostikNonKognitif: string[];
    diagnostikKognitif: DiagnostikKognitifItem[];
  };
  penilaianSikap?: {
    teknikPenilaian: string;
    skalaKeterangan: string;
    aspekSikap: AspekSikapItem[];
  };
  asesmenFormatif?: {
    petunjukPengerjaan: string;
    daftarSoal: SoalAsesmen[];
    pedomanPenskoran: {
      rumusNilai: string;
      kriteriaKetuntasan: string;
      catatanTindakLanjut: string;
    };
  };
  bahanAjar?: {
    judulBahanAjar: string;
    ringkasanMateri: string;
    poinKonsepKunci: string[];
    sumberReferensiGuru: string;
  };
  refleksiDanUmpanBalik?: {
    petunjukPengisian: string;
    refleksiPesertaDidik: string[];
    umpanBalikPesertaDidik: string[];
    tindakLanjutGuru: string[];
  };
  mediaAjar?: MediaAjarData;
  kktp?: {
    pendekatan: string;
    kriteriaKetuntasan: RubricCriterion[];
    intervalNilai: IntervalKktpItem[];
  };
  glosariumDanPustaka: {
    glosarium: GlosariumItem[];
    daftarPustaka: string[];
  };
  // Field warisan untuk kompatibilitas modul tersimpan sebelumnya
  bahanBacaan?: {
    ringkasanMateri: string;
    poinKonsepKunci: string[];
    sumberReferensiGuru: string;
  };
  mediaPembelajaran?: {
    daftarMediaAlat: string[];
    panduanPenggunaan: string;
  };
  instrumenAsesmen?: {
    petunjukPengerjaan: string;
    daftarSoal: SoalAsesmen[];
  };
  pedomanPenskoran?: {
    rumusNilai: string;
    kriteriaKetuntasan: string;
    catatanTindakLanjut: string;
  };
  pengayaanRemedial?: {
    programPengayaan: string[];
    programRemedial: string[];
  };
  lembarRefleksi?: {
    refleksiGuru: string[];
    refleksiPesertaDidik: string[];
  };
}

export const DAFTAR_LAMPIRAN = [
  { id: 1, title: "Lampiran 1: Asesmen Diagnostik" },
  { id: 2, title: "Lampiran 2: Penilaian Non Tes (Penilaian Sikap)" },
  { id: 3, title: "Lampiran 3: Asesmen Formatif" },
  { id: 4, title: "Lampiran 4: Bahan Ajar" },
  { id: 5, title: "Lampiran 5: Lembar Kerja Peserta Didik (LKPD)" },
  { id: 6, title: "Lampiran 6: Lembar Refleksi & Umpan Balik Peserta Didik" },
  { id: 7, title: "Lampiran 7: Media Ajar" },
  { id: 8, title: "Lampiran 8: KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)" },
] as const;

export interface ModulAjar {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  identitas: {
    judulModul: string;
    penyusun: string;
    sekolah: string;
    tahunAjaran: string;
    jenjang: Jenjang;
    fase: string;
    kelas: string;
    mataPelajaran: string;
    topik: string;
    alokasiWaktu: string;
    jumlahPertemuan: number;
    modelPembelajaran: string;
    kotaTanggal?: string;
    namaKepalaSekolah?: string;
    nipKepalaSekolah?: string;
    nipGuru?: string;
  };
  identifikasi: {
    kesiapanMurid: string;
    karakteristikMateri: string;
    dimensiProfilLulusan: string[];
  };
  desainPembelajaran: {
    capaianPembelajaran: string;
    tujuanPembelajaran: string[];
    pemahamanBermakna: string;
    pertanyaanPemantik: string[];
    praktikPedagogis: string;
    kemitraanPembelajaran: string;
    lingkunganBelajar: string;
    pemanfaatanDigital: string;
  };
  pengalamanBelajar: {
    kegiatanAwal: string[];
    kegiatanInti: LearningStep[];
    kegiatanPenutup: string[];
  };
  asesmen: {
    asesmenAwal: string;
    asesmenFormatif: string;
    asesmenSumatif: string;
    rubrikPenilaian: RubricCriterion[];
  };
  lkpd: {
    judulLkpd: string;
    tujuanLkpd: string;
    petunjukBelajar: string[];
    alatDanBahan: string[];
    aktivitas: LkpdActivity[];
    refleksiSiswa: string[];
  };
  lampiran?: LampiranModul;
}

export interface GenerateModulInput {
  penyusun: string;
  sekolah: string;
  tahunAjaran: string;
  jenjang: Jenjang;
  fase: string;
  kelas: string;
  mataPelajaran: string;
  topik: string;
  jp: number;
  jumlahPertemuan: number;
  modelPembelajaran: string;
  dimensiProfilLulusan: string[];
  catatanKonteks: string;
  mediaAjarRekomendasi?: MediaAjarData;
  kotaTanggal?: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  nipGuru?: string;
}

export const JENJANG_CONFIG: Record<
  Jenjang,
  {
    fases: { fase: string; kelasList: string[]; label: string }[];
    mapel: string[];
  }
> = {
  "SD/MI": {
    fases: [
      { fase: "Fase A", kelasList: ["Kelas 1", "Kelas 2"], label: "Fase A (Kelas 1–2)" },
      { fase: "Fase B", kelasList: ["Kelas 3", "Kelas 4"], label: "Fase B (Kelas 3–4)" },
      { fase: "Fase C", kelasList: ["Kelas 5", "Kelas 6"], label: "Fase C (Kelas 5–6)" },
    ],
    mapel: [
      "Pendidikan Pancasila",
      "Bahasa Indonesia",
      "Matematika",
      "IPAS (Ilmu Pengetahuan Alam dan Sosial)",
      "Bahasa Inggris",
      "Seni Rupa",
      "Seni Musik",
      "PJOK",
    ],
  },
  "SMP/MTs": {
    fases: [
      { fase: "Fase D", kelasList: ["Kelas 7", "Kelas 8", "Kelas 9"], label: "Fase D (Kelas 7–9)" },
    ],
    mapel: [
      "Pendidikan Pancasila",
      "Bahasa Indonesia",
      "Matematika",
      "IPA (Ilmu Pengetahuan Alam)",
      "IPS (Ilmu Pengetahuan Sosial)",
      "Bahasa Inggris",
      "Informatika",
      "Seni Budaya",
      "PJOK",
    ],
  },
  "SMA/MA": {
    fases: [
      { fase: "Fase E", kelasList: ["Kelas 10"], label: "Fase E (Kelas 10)" },
      { fase: "Fase F", kelasList: ["Kelas 11", "Kelas 12"], label: "Fase F (Kelas 11–12)" },
    ],
    mapel: [
      "Pendidikan Pancasila",
      "Bahasa Indonesia",
      "Matematika",
      "Bahasa Inggris",
      "Fisika",
      "Kimia",
      "Biologi",
      "Ekonomi",
      "Sosiologi",
      "Geografi",
      "Sejarah",
      "Informatika",
      "Seni Budaya",
      "PJOK",
    ],
  },
  "SMK/MAK": {
    fases: [
      { fase: "Fase E", kelasList: ["Kelas 10"], label: "Fase E (Kelas 10)" },
      { fase: "Fase F", kelasList: ["Kelas 11", "Kelas 12"], label: "Fase F (Kelas 11–12)" },
    ],
    mapel: [
      "Pendidikan Pancasila",
      "Bahasa Indonesia",
      "Matematika",
      "Bahasa Inggris",
      "Projek IPAS",
      "Informatika",
      "Sejarah",
      "Seni Budaya",
      "PJOK",
      "Dasar-Dasar Program Keahlian",
      "Konsentrasi Keahlian",
      "Projek Kreatif dan Kewirausahaan (PKK)",
    ],
  },
};

export const DIMENSI_PROFIL_LULUSAN = [
  "Keimanan dan Ketakwaan terhadap Tuhan YME",
  "Kewargaan",
  "Penalaran Kritis",
  "Kreativitas",
  "Kolaborasi",
  "Kemandirian",
  "Kesehatan",
  "Komunikasi",
];

export const MODEL_PEMBELAJARAN_OPTIONS = [
  "Problem Based Learning (PBL)",
  "Project Based Learning (PjBL)",
  "Inquiry Learning",
  "Discovery Learning",
  "Cooperative Learning (Think-Pair-Share)",
  "Contextual Teaching and Learning (CTL)",
];
