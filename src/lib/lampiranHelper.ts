import { getRecommendedMediaAjar } from "../data/kurikulumMerdekaTopics";
import type {
  AspekSikapItem,
  DiagnostikKognitifItem,
  GlosariumItem,
  IntervalKktpItem,
  MediaAjarData,
  ModulAjar,
  RubricCriterion,
  SoalAsesmen,
} from "../types/modul";

export interface ResolvedLampiran {
  asesmenDiagnostik: {
    tujuanDiagnostik: string;
    diagnostikNonKognitif: string[];
    diagnostikKognitif: DiagnostikKognitifItem[];
  };
  penilaianSikap: {
    teknikPenilaian: string;
    skalaKeterangan: string;
    aspekSikap: AspekSikapItem[];
  };
  asesmenFormatif: {
    petunjukPengerjaan: string;
    daftarSoal: SoalAsesmen[];
    pedomanPenskoran: {
      rumusNilai: string;
      kriteriaKetuntasan: string;
      catatanTindakLanjut: string;
    };
  };
  bahanAjar: {
    judulBahanAjar: string;
    ringkasanMateri: string;
    poinKonsepKunci: string[];
    sumberReferensiGuru: string;
  };
  refleksiDanUmpanBalik: {
    petunjukPengisian: string;
    refleksiPesertaDidik: string[];
    umpanBalikPesertaDidik: string[];
    tindakLanjutGuru: string[];
  };
  mediaAjar: MediaAjarData;
  kktp: {
    pendekatan: string;
    kriteriaKetuntasan: RubricCriterion[];
    intervalNilai: IntervalKktpItem[];
  };
  glosariumDanPustaka: {
    glosarium: GlosariumItem[];
    daftarPustaka: string[];
  };
}

export function resolveLampiran(modul: ModulAjar): ResolvedLampiran {
  const { identitas, identifikasi, desainPembelajaran, asesmen, lkpd, lampiran } = modul;
  const autoMedia = getRecommendedMediaAjar(
    identitas.jenjang,
    identitas.mataPelajaran,
    identitas.topik,
    identitas.modelPembelajaran
  );

  const dimensiFokus = identifikasi.dimensiProfilLulusan.length
    ? identifikasi.dimensiProfilLulusan
    : ["Penalaran Kritis", "Kolaborasi", "Komunikasi"];

  const defaultDiagnostik = {
    tujuanDiagnostik: `Memetakan kesiapan belajar awal, minat, dan penguasaan konsep prasyarat peserta didik sebelum mempelajari materi "${identitas.topik}".`,
    diagnostikNonKognitif: [
      "Bagaimana perasaan dan kesiapanmu mengikuti pembelajaran hari ini? (Sangat Siap / Cukup Siap / Butuh Pendampingan)",
      `Cara belajar apa yang paling membantumu memahami materi ${identitas.mataPelajaran}? (Mengamati gambar/video, membaca ringkasan, diskusi kelompok, atau praktik langsung)`,
      "Kendala atau hal apa yang ingin kamu sampaikan kepada guru agar belajar hari ini terasa nyaman?",
    ],
    diagnostikKognitif: [
      {
        nomor: 1,
        pertanyaan: `Apa yang sudah kamu ketahui tentang istilah atau pengalaman sehari-hari yang berkaitan dengan "${identitas.topik}"?`,
        tujuanPemetaan: "Mengidentifikasi pengetahuan awal (prior knowledge) peserta didik.",
        tindakLanjut:
          "Murid yang belum mengenal konsep dasar diberikan pengantar visual konkret di awal kegiatan inti.",
      },
      {
        nomor: 2,
        pertanyaan:
          desainPembelajaran.pertanyaanPemantik[0] ||
          `Menurutmu, mengapa kita perlu mempelajari ${identitas.topik} pada ${identitas.mataPelajaran}?`,
        tujuanPemetaan: "Mengukur penalaran awal dan keterkaitan materi dengan konteks nyata.",
        tindakLanjut:
          "Kelompok heterogen dibentuk berdasarkan hasil pemetaan kesiapan untuk saling mendukung (peer tutoring).",
      },
    ],
  };

  const defaultSikap = {
    teknikPenilaian:
      "Penilaian Non-Tes melalui observasi perilaku selama kegiatan awal, diskusi kelompok, pengerjaan LKPD, dan presentasi kelas.",
    skalaKeterangan: "SB = Sangat Baik (4) · B = Baik (3) · C = Cukup (2) · PB = Perlu Bimbingan (1)",
    aspekSikap: dimensiFokus.map((dim) => ({
      dimensi: dim,
      indikator: `Menunjukkan sikap ${dim.toLowerCase()} selama mempelajari ${identitas.topik}`,
      kriteriaTampak: `Konsisten menerapkan perilaku positif terkait ${dim} dalam kerja individu maupun kolaborasi kelompok.`,
    })),
  };

  const legacySoal = lampiran?.instrumenAsesmen?.daftarSoal;
  const legacySkor = lampiran?.pedomanPenskoran;
  const defaultFormatif = {
    petunjukPengerjaan:
      lampiran?.instrumenAsesmen?.petunjukPengerjaan ||
      "Kerjakan soal formatif berikut secara runtut untuk mengukur pencapaian tujuan pembelajaran hari ini.",
    daftarSoal:
      legacySoal && legacySoal.length
        ? legacySoal
        : [
            {
              nomor: 1,
              indikator: desainPembelajaran.tujuanPembelajaran[0] || `Memahami konsep ${identitas.topik}`,
              levelKognitif: "C2–C3 (Memahami & Menerapkan)",
              pertanyaan: `Jelaskan dengan bahasamu sendiri konsep utama pada materi ${identitas.topik} beserta satu contoh nyatanya!`,
              kunciJawaban: `Peserta didik menguraikan konsep inti ${identitas.topik} secara runtut dan memberikan minimal satu contoh kontekstual.`,
            },
            {
              nomor: 2,
              indikator:
                desainPembelajaran.tujuanPembelajaran[1] || `Menganalisis penerapan ${identitas.topik}`,
              levelKognitif: "C4 (Menganalisis)",
              pertanyaan:
                desainPembelajaran.pertanyaanPemantik[0] ||
                `Bagaimana dampak yang terjadi apabila prinsip dalam ${identitas.topik} tidak diterapkan dengan tepat?`,
              kunciJawaban:
                "Peserta didik menguraikan hubungan sebab-akibat berbasis bukti dan penalaran kritis sesuai hasil pembelajaran.",
            },
          ],
    pedomanPenskoran: {
      rumusNilai: legacySkor?.rumusNilai || "Nilai Akhir = (Jumlah Skor Perolehan / Skor Maksimal) × 100",
      kriteriaKetuntasan:
        legacySkor?.kriteriaKetuntasan ||
        "Peserta didik mencapai ketuntasan tujuan pembelajaran apabila memperoleh nilai minimal 71 (predikat Cakap).",
      catatanTindakLanjut:
        legacySkor?.catatanTindakLanjut ||
        "Nilai < 71 mengikuti pendampingan remedial terarah; nilai ≥ 86 diberikan tantangan pengayaan.",
    },
  };

  const legacyBacaan = lampiran?.bahanBacaan;
  const defaultBahanAjar = {
    judulBahanAjar: `Ringkasan Materi & Bahan Ajar: ${identitas.topik}`,
    ringkasanMateri:
      legacyBacaan?.ringkasanMateri ||
      `${desainPembelajaran.pemahamanBermakna} Materi "${identitas.topik}" pada mata pelajaran ${identitas.mataPelajaran} (${identitas.fase} / ${identitas.kelas}) membantu peserta didik menghubungkan konsep inti dengan penerapannya secara bermakna dalam kehidupan nyata.`,
    poinKonsepKunci:
      legacyBacaan?.poinKonsepKunci?.length
        ? legacyBacaan.poinKonsepKunci
        : desainPembelajaran.tujuanPembelajaran.length
          ? desainPembelajaran.tujuanPembelajaran
          : [`Konsep dasar ${identitas.topik}`, `Penerapan ${identitas.topik} dalam kehidupan sehari-hari`],
    sumberReferensiGuru:
      legacyBacaan?.sumberReferensiGuru ||
      `Buku Panduan Guru dan Buku Siswa ${identitas.mataPelajaran} ${identitas.jenjang} ${identitas.kelas} Kurikulum Merdeka (Kemendikbudristek).`,
  };

  const legacyRefleksi = lampiran?.lembarRefleksi;
  const defaultRefleksiUmpanBalik = {
    petunjukPengisian:
      "Isilah lembar refleksi dan umpan balik berikut dengan jujur di akhir pembelajaran untuk membantu guru meningkatkan kualitas belajar berikutnya.",
    refleksiPesertaDidik:
      legacyRefleksi?.refleksiPesertaDidik?.length
        ? legacyRefleksi.refleksiPesertaDidik
        : lkpd.refleksiSiswa.length
          ? lkpd.refleksiSiswa
          : [
              `Apa konsep paling penting yang kamu pelajari hari ini tentang ${identitas.topik}?`,
              "Bagian mana yang sudah kamu kuasai dengan baik dan bagian mana yang masih perlu latihan?",
            ],
    umpanBalikPesertaDidik: [
      `Apakah media ajar dan aktivitas pada materi ${identitas.topik} membantumu memahami pelajaran? Jelaskan alasannya!`,
      "Bagaimana suasana belajar di kelas hari ini? Saran apa yang ingin kamu berikan untuk pertemuan selanjutnya?",
    ],
    tindakLanjutGuru:
      legacyRefleksi?.refleksiGuru?.length
        ? legacyRefleksi.refleksiGuru
        : [
            "Meninjau kecocokan alokasi waktu pada tahap Memahami, Mengaplikasi, dan Merefleksi.",
            "Menyesuaikan media ajar dan strategi pendampingan berdasarkan umpan balik tertulis peserta didik.",
          ],
  };

  const legacyMedia = lampiran?.mediaPembelajaran;
  const defaultMediaAjar: MediaAjarData = {
    mediaUtama:
      legacyMedia?.daftarMediaAlat?.length ? legacyMedia.daftarMediaAlat : autoMedia.mediaUtama,
    alatDanBahanPendukung: lkpd.alatDanBahan.length
      ? lkpd.alatDanBahan
      : autoMedia.alatDanBahanPendukung,
    sumberDigital: autoMedia.sumberDigital,
    panduanPenggunaan: legacyMedia?.panduanPenggunaan || autoMedia.panduanPenggunaan,
  };

  const defaultKktp = {
    pendekatan:
      "Menggunakan kombinasi Deskripsi Kriteria Rubrik dan Interval Nilai (4 Tingkat Penguasaan Kurikulum Merdeka).",
    kriteriaKetuntasan: asesmen.rubrikPenilaian,
    intervalNilai: [
      {
        rentang: "0 – 55%",
        predikat: "Perlu Bimbingan",
        interpretasi: "Belum mencapai ketuntasan tujuan pembelajaran.",
        tindakLanjut: "Remedial di seluruh bagian melalui bimbingan langsung & media konkret.",
      },
      {
        rentang: "56 – 70%",
        predikat: "Layak",
        interpretasi: "Belum mencapai ketuntasan; baru menguasai konsep dasar sebagian.",
        tindakLanjut: "Remedial pada indikator tertentu yang belum tuntas.",
      },
      {
        rentang: "71 – 85%",
        predikat: "Cakap",
        interpretasi: "Sudah mencapai ketuntasan tujuan pembelajaran.",
        tindakLanjut: "Lanjut ke materi berikutnya dan penguatan praktik.",
      },
      {
        rentang: "86 – 100%",
        predikat: "Mahir",
        interpretasi: "Melampaui ketuntasan tujuan pembelajaran secara mandiri & mendalam.",
        tindakLanjut: "Diberikan pengayaan proyek studi kasus lanjutan atau tutor sebaya.",
      },
    ],
  };

  const defaultGlosarium = {
    glosarium: [
      {
        istilah: "Pembelajaran Mendalam",
        definisi:
          "Pendekatan pembelajaran yang memuliakan proses belajar berkesadaran, bermakna, dan menggembirakan untuk membangun pemahaman konseptual yang mendalam.",
      },
      {
        istilah: "KKTP",
        definisi:
          "Kriteria Ketercapaian Tujuan Pembelajaran sebagai acuan guru menilai tingkat penguasaan kompetensi peserta didik pada Kurikulum Merdeka.",
      },
    ],
    daftarPustaka: [
      `Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. Buku Panduan Guru ${identitas.mataPelajaran} ${identitas.jenjang} ${identitas.kelas}. Jakarta: Kemendikbudristek.`,
      "Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP). Panduan Pembelajaran dan Asesmen Kurikulum Merdeka.",
    ],
  };

  return {
    asesmenDiagnostik: lampiran?.asesmenDiagnostik ?? defaultDiagnostik,
    penilaianSikap: lampiran?.penilaianSikap ?? defaultSikap,
    asesmenFormatif: lampiran?.asesmenFormatif ?? defaultFormatif,
    bahanAjar: lampiran?.bahanAjar ?? defaultBahanAjar,
    refleksiDanUmpanBalik: lampiran?.refleksiDanUmpanBalik ?? defaultRefleksiUmpanBalik,
    mediaAjar: lampiran?.mediaAjar ?? defaultMediaAjar,
    kktp: lampiran?.kktp ?? defaultKktp,
    glosariumDanPustaka: lampiran?.glosariumDanPustaka ?? defaultGlosarium,
  };
}
