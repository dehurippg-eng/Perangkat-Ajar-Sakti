import { getMateriPokokOptions } from "../data/kurikulumMerdekaTopics";
import type {
  AcademicClass,
  AttendanceMap,
  CoverPerangkatConfig,
  HariSekolahMode,
  KaldikDayNote,
  KaldikDayStatus,
  ProsemDocument,
  ProsemRow,
  ProtaDocument,
  ProtaRow,
  StudentGradeEntry,
} from "../types/akademik";
import { HARI_SINGKAT_ID, NAMA_BULAN_ID } from "../types/akademik";
import type { Jenjang } from "../types/modul";

export interface KaldikDayCell {
  dateStr: string;
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  status: KaldikDayStatus;
  label: string;
  isOverride: boolean;
}

export interface KaldikWeekInfo {
  weekIndex: number;
  effectiveDays: number;
  isEffective: boolean;
  dominantNote?: string;
}

export interface KaldikMonthSummary {
  year: number;
  month: number;
  monthName: string;
  semester: 1 | 2;
  days: KaldikDayCell[];
  leadingEmptySlots: number;
  weeks: KaldikWeekInfo[];
  totalWeeks: number;
  effectiveWeeks: number;
  nonEffectiveWeeks: number;
  effectiveDays: number;
  holidayAndAgendaDays: number;
  agendaList: { dateStr: string; day: number; label: string; status: KaldikDayStatus }[];
}

export interface KaldikYearSummary {
  tahunAjaran: string;
  startYear: number;
  endYear: number;
  hariSekolah: HariSekolahMode;
  months: KaldikMonthSummary[];
  semester1: {
    effectiveDays: number;
    effectiveWeeks: number;
    nonEffectiveWeeks: number;
  };
  semester2: {
    effectiveDays: number;
    effectiveWeeks: number;
    nonEffectiveWeeks: number;
  };
  totalEffectiveDays: number;
  totalEffectiveWeeks: number;
}

const NATIONAL_HOLIDAYS_BY_YEAR: Record<number, Record<string, string>> = {
  2024: {
    "2024-01-01": "Tahun Baru Masehi",
    "2024-02-08": "Isra Mikraj Nabi Muhammad SAW",
    "2024-02-10": "Tahun Baru Imlek 2575",
    "2024-03-11": "Hari Suci Nyepi Tahun Baru Saka 1946",
    "2024-03-29": "Wafat Yesus Kristus",
    "2024-04-10": "Hari Raya Idul Fitri 1445 H",
    "2024-04-11": "Hari Raya Idul Fitri 1445 H",
    "2024-05-01": "Hari Buruh Internasional",
    "2024-05-09": "Kenaikan Yesus Kristus",
    "2024-05-23": "Hari Raya Waisak 2568 BE",
    "2024-06-01": "Hari Lahir Pancasila",
    "2024-06-17": "Hari Raya Idul Adha 1445 H",
    "2024-07-07": "Tahun Baru Islam 1446 H",
    "2024-08-17": "Hari Kemerdekaan RI",
    "2024-09-16": "Maulid Nabi Muhammad SAW",
    "2024-12-25": "Hari Raya Natal",
  },
  2025: {
    "2025-01-01": "Tahun Baru Masehi",
    "2025-01-27": "Isra Mikraj Nabi Muhammad SAW",
    "2025-01-29": "Tahun Baru Imlek 2576",
    "2025-03-29": "Hari Suci Nyepi Tahun Baru Saka 1947",
    "2025-03-31": "Hari Raya Idul Fitri 1446 H",
    "2025-04-01": "Hari Raya Idul Fitri 1446 H",
    "2025-04-18": "Wafat Yesus Kristus",
    "2025-05-01": "Hari Buruh Internasional",
    "2025-05-12": "Hari Raya Waisak 2569 BE",
    "2025-05-29": "Kenaikan Yesus Kristus",
    "2025-06-01": "Hari Lahir Pancasila",
    "2025-06-06": "Hari Raya Idul Adha 1446 H",
    "2025-06-27": "Tahun Baru Islam 1447 H",
    "2025-08-17": "Hari Kemerdekaan RI",
    "2025-09-05": "Maulid Nabi Muhammad SAW",
    "2025-12-25": "Hari Raya Natal",
  },
  2026: {
    "2026-01-01": "Tahun Baru Masehi",
    "2026-01-16": "Isra Mikraj Nabi Muhammad SAW",
    "2026-02-17": "Tahun Baru Imlek 2577",
    "2026-03-19": "Hari Suci Nyepi Tahun Baru Saka 1948",
    "2026-03-20": "Hari Raya Idul Fitri 1447 H",
    "2026-03-21": "Hari Raya Idul Fitri 1447 H",
    "2026-04-03": "Wafat Yesus Kristus",
    "2026-05-01": "Hari Buruh Internasional",
    "2026-05-14": "Kenaikan Yesus Kristus",
    "2026-05-27": "Hari Raya Idul Adha 1447 H",
    "2026-05-31": "Hari Raya Waisak 2570 BE",
    "2026-06-01": "Hari Lahir Pancasila",
    "2026-06-16": "Tahun Baru Islam 1448 H",
    "2026-08-17": "Hari Kemerdekaan RI",
    "2026-08-25": "Maulid Nabi Muhammad SAW",
    "2026-12-25": "Hari Raya Natal",
  },
  2027: {
    "2027-01-01": "Tahun Baru Masehi",
    "2027-01-05": "Isra Mikraj Nabi Muhammad SAW",
    "2027-02-06": "Tahun Baru Imlek 2578",
    "2027-03-09": "Hari Suci Nyepi Tahun Baru Saka 1949",
    "2027-03-10": "Hari Raya Idul Fitri 1448 H",
    "2027-03-11": "Hari Raya Idul Fitri 1448 H",
    "2027-03-26": "Wafat Yesus Kristus",
    "2027-05-01": "Hari Buruh Internasional",
    "2027-05-06": "Kenaikan Yesus Kristus",
    "2027-05-17": "Hari Raya Idul Adha 1448 H",
    "2027-05-20": "Hari Raya Waisak 2571 BE",
    "2027-06-01": "Hari Lahir Pancasila",
    "2027-06-06": "Tahun Baru Islam 1449 H",
    "2027-08-14": "Maulid Nabi Muhammad SAW",
    "2027-08-17": "Hari Kemerdekaan RI",
    "2027-12-25": "Hari Raya Natal",
  },
  2028: {
    "2028-01-01": "Tahun Baru Masehi",
    "2028-01-26": "Tahun Baru Imlek 2579",
    "2028-02-27": "Hari Raya Idul Fitri 1449 H",
    "2028-02-28": "Hari Raya Idul Fitri 1449 H",
    "2028-03-26": "Hari Suci Nyepi Tahun Baru Saka 1950",
    "2028-04-14": "Wafat Yesus Kristus",
    "2028-05-01": "Hari Buruh Internasional",
    "2028-05-05": "Hari Raya Idul Adha 1449 H",
    "2028-05-09": "Hari Raya Waisak 2572 BE",
    "2028-05-25": "Kenaikan Yesus Kristus & Tahun Baru Islam 1450 H",
    "2028-06-01": "Hari Lahir Pancasila",
    "2028-08-03": "Maulid Nabi Muhammad SAW",
    "2028-08-17": "Hari Kemerdekaan RI",
    "2028-12-14": "Isra Mikraj Nabi Muhammad SAW",
    "2028-12-25": "Hari Raya Natal",
  },
  2029: {
    "2029-01-01": "Tahun Baru Masehi",
    "2029-02-13": "Tahun Baru Imlek 2580",
    "2029-02-15": "Hari Raya Idul Fitri 1450 H",
    "2029-02-16": "Hari Raya Idul Fitri 1450 H",
    "2029-03-15": "Hari Suci Nyepi Tahun Baru Saka 1951",
    "2029-03-30": "Wafat Yesus Kristus",
    "2029-04-24": "Hari Raya Idul Adha 1450 H",
    "2029-05-01": "Hari Buruh Internasional",
    "2029-05-10": "Kenaikan Yesus Kristus",
    "2029-05-14": "Tahun Baru Islam 1451 H",
    "2029-05-27": "Hari Raya Waisak 2573 BE",
    "2029-06-01": "Hari Lahir Pancasila",
    "2029-07-24": "Maulid Nabi Muhammad SAW",
    "2029-08-17": "Hari Kemerdekaan RI",
    "2029-12-03": "Isra Mikraj Nabi Muhammad SAW",
    "2029-12-25": "Hari Raya Natal",
  },
};

export function parseTahunAjaran(tahunAjaran: string): { startYear: number; endYear: number } {
  const parts = tahunAjaran.split("/").map((p) => Number(p.trim()));
  const startYear = Number.isFinite(parts[0]) && parts[0] >= 2020 ? parts[0] : 2026;
  const endYear = Number.isFinite(parts[1]) && parts[1] >= startYear ? parts[1] : startYear + 1;
  return { startYear, endYear };
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getDefaultAcademicAgenda(
  year: number,
  month: number,
  day: number,
  dayOfWeek: number,
  startYear: number,
  endYear: number,
  hariSekolah: HariSekolahMode
): KaldikDayNote {
  const dateStr = formatDateKey(year, month, day);
  const yearHolidays = NATIONAL_HOLIDAYS_BY_YEAR[year] ?? {};

  if (yearHolidays[dateStr]) {
    return { status: "libur_nasional", label: yearHolidays[dateStr] };
  }

  if (dayOfWeek === 0 || (hariSekolah === 5 && dayOfWeek === 6)) {
    return { status: "libur_akhir_pekan", label: dayOfWeek === 0 ? "Minggu" : "Sabtu" };
  }

  if (year === startYear) {
    if (month === 7) {
      if (day <= 12) return { status: "libur_semester", label: "Libur Akhir Tahun Ajaran" };
      if (day >= 13 && day <= 17) return { status: "mpls", label: "MPLS & Pengenalan Lingkungan" };
    }
    if (month === 10 && day >= 5 && day <= 10) {
      return { status: "sts", label: "Sumatif Tengah Semester (STS)" };
    }
    if (month === 12) {
      if (day >= 1 && day <= 8) return { status: "sas", label: "Sumatif Akhir Semester (SAS)" };
      if (day >= 14 && day <= 19) return { status: "rapor", label: "Pengolahan & Pembagian Rapor Ganjil" };
      if (day >= 21) return { status: "libur_semester", label: "Libur Semester Ganjil" };
    }
  }

  if (year === endYear) {
    if (month === 1 && day <= 3) {
      return { status: "libur_semester", label: "Libur Awal Tahun / Semester" };
    }
    if (month === 3 && day >= 8 && day <= 13) {
      return { status: "sts", label: "Sumatif Tengah Semester (STS) Genap" };
    }
    if (month === 6) {
      if (day >= 2 && day <= 9) return { status: "sas", label: "Sumatif Akhir Tahun (SAT)" };
      if (day >= 15 && day <= 19) return { status: "rapor", label: "Pengolahan & Pembagian Rapor Genap" };
      if (day >= 21) return { status: "libur_semester", label: "Libur Kenaikan Kelas" };
    }
  }

  return { status: "efektif", label: "Hari Belajar Efektif" };
}

export function buildKaldikYear(
  tahunAjaran: string,
  hariSekolah: HariSekolahMode,
  overrides: Record<string, KaldikDayNote> = {}
): KaldikYearSummary {
  const { startYear, endYear } = parseTahunAjaran(tahunAjaran);

  const monthPairs: { year: number; month: number; semester: 1 | 2 }[] = [
    { year: startYear, month: 7, semester: 1 },
    { year: startYear, month: 8, semester: 1 },
    { year: startYear, month: 9, semester: 1 },
    { year: startYear, month: 10, semester: 1 },
    { year: startYear, month: 11, semester: 1 },
    { year: startYear, month: 12, semester: 1 },
    { year: endYear, month: 1, semester: 2 },
    { year: endYear, month: 2, semester: 2 },
    { year: endYear, month: 3, semester: 2 },
    { year: endYear, month: 4, semester: 2 },
    { year: endYear, month: 5, semester: 2 },
    { year: endYear, month: 6, semester: 2 },
  ];

  const months: KaldikMonthSummary[] = monthPairs.map(({ year, month, semester }) => {
    const numDays = getDaysInMonth(year, month);
    const firstDow = new Date(year, month - 1, 1).getDay();
    const leadingEmptySlots = (firstDow + 6) % 7;

    const days: KaldikDayCell[] = [];
    const agendaList: { dateStr: string; day: number; label: string; status: KaldikDayStatus }[] = [];

    for (let d = 1; d <= numDays; d++) {
      const dow = new Date(year, month - 1, d).getDay();
      const dateStr = formatDateKey(year, month, d);
      const custom = overrides[dateStr];
      const base = getDefaultAcademicAgenda(year, month, d, dow, startYear, endYear, hariSekolah);
      const finalNote = custom ?? base;

      days.push({
        dateStr,
        year,
        month,
        day: d,
        dayOfWeek: dow,
        status: finalNote.status,
        label: finalNote.label,
        isOverride: Boolean(custom),
      });

      if (finalNote.status !== "efektif" && finalNote.status !== "libur_akhir_pekan") {
        agendaList.push({
          dateStr,
          day: d,
          label: finalNote.label,
          status: finalNote.status,
        });
      }
    }

    const weeksMap = new Map<number, KaldikDayCell[]>();
    days.forEach((cell, idx) => {
      const weekIdx = Math.floor((leadingEmptySlots + idx) / 7) + 1;
      const clampedWeek = Math.min(5, weekIdx);
      const list = weeksMap.get(clampedWeek) ?? [];
      list.push(cell);
      weeksMap.set(clampedWeek, list);
    });

    const weeks: KaldikWeekInfo[] = Array.from(weeksMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([weekIndex, cells]) => {
        const effDays = cells.filter((c) => c.status === "efektif").length;
        const special = cells.find(
          (c) => c.status !== "efektif" && c.status !== "libur_akhir_pekan"
        );
        const isEffective = effDays >= 3;
        return {
          weekIndex,
          effectiveDays: effDays,
          isEffective,
          dominantNote: special?.label,
        };
      });

    const effectiveDays = days.filter((d) => d.status === "efektif").length;
    const holidayAndAgendaDays = days.filter(
      (d) => d.status !== "efektif" && d.status !== "libur_akhir_pekan"
    ).length;
    const effectiveWeeks = weeks.filter((w) => w.isEffective).length;

    return {
      year,
      month,
      monthName: NAMA_BULAN_ID[month - 1],
      semester,
      days,
      leadingEmptySlots,
      weeks,
      totalWeeks: weeks.length,
      effectiveWeeks,
      nonEffectiveWeeks: weeks.length - effectiveWeeks,
      effectiveDays,
      holidayAndAgendaDays,
      agendaList,
    };
  });

  const sem1Months = months.filter((m) => m.semester === 1);
  const sem2Months = months.filter((m) => m.semester === 2);

  const sem1EffDays = sem1Months.reduce((s, m) => s + m.effectiveDays, 0);
  const sem1EffWeeks = sem1Months.reduce((s, m) => s + m.effectiveWeeks, 0);
  const sem1NonEffWeeks = sem1Months.reduce((s, m) => s + m.nonEffectiveWeeks, 0);

  const sem2EffDays = sem2Months.reduce((s, m) => s + m.effectiveDays, 0);
  const sem2EffWeeks = sem2Months.reduce((s, m) => s + m.effectiveWeeks, 0);
  const sem2NonEffWeeks = sem2Months.reduce((s, m) => s + m.nonEffectiveWeeks, 0);

  return {
    tahunAjaran,
    startYear,
    endYear,
    hariSekolah,
    months,
    semester1: {
      effectiveDays: sem1EffDays,
      effectiveWeeks: sem1EffWeeks,
      nonEffectiveWeeks: sem1NonEffWeeks,
    },
    semester2: {
      effectiveDays: sem2EffDays,
      effectiveWeeks: sem2EffWeeks,
      nonEffectiveWeeks: sem2NonEffWeeks,
    },
    totalEffectiveDays: sem1EffDays + sem2EffDays,
    totalEffectiveWeeks: sem1EffWeeks + sem2EffWeeks,
  };
}

export function getDefaultJpPerWeek(jenjang: Jenjang, mataPelajaran: string): number {
  const m = mataPelajaran.toLowerCase();
  if (jenjang === "SD/MI") {
    if (m.includes("bahasa indonesia")) return 6;
    if (m.includes("matematika")) return 5;
    if (m.includes("ipas")) return 5;
    if (m.includes("pancasila")) return 4;
    if (m.includes("pjok")) return 3;
    if (m.includes("seni")) return 3;
    return 2;
  }
  if (jenjang === "SMP/MTs") {
    if (m.includes("bahasa indonesia") || m.includes("matematika") || m.includes("ipa")) return 5;
    if (m.includes("bahasa inggris") || m.includes("ips")) return 4;
    if (m.includes("pancasila") || m.includes("pjok") || m.includes("informatika")) return 3;
    return 2;
  }
  if (jenjang === "SMK/MAK") {
    if (m.includes("konsentrasi keahlian")) return 12;
    if (m.includes("dasar-dasar")) return 6;
    if (m.includes("projek ipas") || m.includes("kewirausahaan")) return 5;
    if (m.includes("matematika") || m.includes("bahasa indonesia") || m.includes("bahasa inggris")) return 4;
    return 2;
  }
  if (m.includes("matematika") || m.includes("bahasa indonesia") || m.includes("bahasa inggris")) return 4;
  if (m.includes("fisika") || m.includes("kimia") || m.includes("biologi") || m.includes("ekonomi")) return 3;
  return 2;
}

function distributeTotalJp(targetTotalJp: number, topicCount: number): number[] {
  if (topicCount <= 0) return [];
  const base = Math.floor(targetTotalJp / topicCount);
  const remainder = targetTotalJp - base * topicCount;
  return Array.from({ length: topicCount }, (_, idx) => base + (idx < remainder ? 1 : 0));
}

export function generateAutoProta(params: {
  tahunAjaran: string;
  jenjang: Jenjang;
  fase: string;
  kelas: string;
  mataPelajaran: string;
  jpPerMinggu?: number;
  kaldik: KaldikYearSummary;
}): ProtaDocument {
  const { tahunAjaran, jenjang, fase, kelas, mataPelajaran, kaldik } = params;
  const jpPerMinggu = params.jpPerMinggu ?? getDefaultJpPerWeek(jenjang, mataPelajaran);

  const rawTopics = getMateriPokokOptions(jenjang, fase, kelas, mataPelajaran);
  const topics =
    rawTopics.length >= 2
      ? rawTopics
      : [
          `Konsep Dasar & Pemahaman Bermakna ${mataPelajaran} (${kelas})`,
          `Analisis Kontekstual & Pemecahan Masalah ${mataPelajaran}`,
          `Proyek Penerapan Konsep ${mataPelajaran} di Lingkungan Nyata`,
          `Evaluasi & Refleksi Penguasaan Kompetensi ${mataPelajaran}`,
        ];

  const mid = Math.ceil(topics.length / 2);
  const sem1Topics = topics.slice(0, mid);
  const sem2Topics = topics.slice(mid);

  const sem1TotalJp = Math.max(jpPerMinggu * 12, kaldik.semester1.effectiveWeeks * jpPerMinggu);
  const sem2TotalJp = Math.max(jpPerMinggu * 12, kaldik.semester2.effectiveWeeks * jpPerMinggu);

  const sem1Cadangan = Math.min(jpPerMinggu * 2, Math.floor(sem1TotalJp * 0.12));
  const sem2Cadangan = Math.min(jpPerMinggu * 2, Math.floor(sem2TotalJp * 0.12));

  const sem1Dist = distributeTotalJp(sem1TotalJp - sem1Cadangan, sem1Topics.length);
  const sem2Dist = distributeTotalJp(sem2TotalJp - sem2Cadangan, sem2Topics.length);

  const rows: ProtaRow[] = [
    ...sem1Topics.map((topic, idx) => ({
      id: `prota-s1-${idx + 1}`,
      semester: 1 as const,
      elemen: `Elemen ${idx + 1} (${fase})`,
      materiPokok: topic,
      alokasiJp: sem1Dist[idx] ?? jpPerMinggu * 2,
      keterangan: "Pembelajaran Inti + Asesmen Formatif",
    })),
    {
      id: "prota-s1-cadangan",
      semester: 1 as const,
      elemen: "Asesmen & Kokurikuler",
      materiPokok: "Asesmen Sumatif Lingkup Materi, STS & Penguatan Projek",
      alokasiJp: sem1Cadangan,
      keterangan: `${kaldik.semester1.effectiveWeeks} Minggu Efektif Ganjil`,
    },
    ...sem2Topics.map((topic, idx) => ({
      id: `prota-s2-${idx + 1}`,
      semester: 2 as const,
      elemen: `Elemen ${mid + idx + 1} (${fase})`,
      materiPokok: topic,
      alokasiJp: sem2Dist[idx] ?? jpPerMinggu * 2,
      keterangan: "Pembelajaran Inti + Asesmen Formatif",
    })),
    {
      id: "prota-s2-cadangan",
      semester: 2 as const,
      elemen: "Asesmen & Kokurikuler",
      materiPokok: "Asesmen Sumatif Lingkup Materi, Remedial & Pengayaan",
      alokasiJp: sem2Cadangan,
      keterangan: `${kaldik.semester2.effectiveWeeks} Minggu Efektif Genap`,
    },
  ];

  return {
    tahunAjaran,
    jenjang,
    fase,
    kelas,
    mataPelajaran,
    jpPerMinggu,
    rows,
  };
}

export function generateAutoProsem(params: {
  prota: ProtaDocument;
  semester: 1 | 2;
  kaldik: KaldikYearSummary;
}): ProsemDocument {
  const { prota, semester, kaldik } = params;
  const semMonths = kaldik.months.filter((m) => m.semester === semester);
  const semProtaRows = prota.rows.filter((r) => r.semester === semester);

  const effectiveSlots: { key: string; capacityJp: number }[] = [];
  semMonths.forEach((m) => {
    m.weeks.forEach((w) => {
      if (w.isEffective) {
        effectiveSlots.push({
          key: `${m.month}-${w.weekIndex}`,
          capacityJp: prota.jpPerMinggu,
        });
      }
    });
  });

  let slotCursor = 0;
  let slotRemaining = effectiveSlots[0]?.capacityJp ?? prota.jpPerMinggu;

  const rows: ProsemRow[] = semProtaRows.map((pRow, idx) => {
    const pekanJp: Record<string, number> = {};
    let jpLeft = pRow.alokasiJp;

    while (jpLeft > 0 && slotCursor < effectiveSlots.length) {
      const currentSlot = effectiveSlots[slotCursor];
      const take = Math.min(jpLeft, slotRemaining);
      if (take > 0) {
        pekanJp[currentSlot.key] = (pekanJp[currentSlot.key] ?? 0) + take;
        jpLeft -= take;
        slotRemaining -= take;
      }
      if (slotRemaining <= 0) {
        slotCursor++;
        slotRemaining = effectiveSlots[slotCursor]?.capacityJp ?? prota.jpPerMinggu;
      }
    }

    return {
      id: `prosem-s${semester}-${idx + 1}`,
      semester,
      materiPokok: pRow.materiPokok,
      alokasiJp: pRow.alokasiJp,
      pekanJp,
      keterangan: pRow.keterangan,
    };
  });

  return {
    tahunAjaran: prota.tahunAjaran,
    semester,
    jenjang: prota.jenjang,
    fase: prota.fase,
    kelas: prota.kelas,
    mataPelajaran: prota.mataPelajaran,
    rows,
  };
}

export interface MonthAttendanceDay {
  day: number;
  dateStr: string;
  dayName: string;
  isEffective: boolean;
  offReason: string;
}

export function getMonthAttendanceDays(
  year: number,
  month: number,
  tahunAjaran: string,
  hariSekolah: HariSekolahMode,
  overrides: Record<string, KaldikDayNote> = {}
): MonthAttendanceDay[] {
  const { startYear, endYear } = parseTahunAjaran(tahunAjaran);
  const numDays = getDaysInMonth(year, month);
  const days: MonthAttendanceDay[] = [];

  for (let d = 1; d <= numDays; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    const dateStr = formatDateKey(year, month, d);
    const custom = overrides[dateStr];
    const base = getDefaultAcademicAgenda(year, month, d, dow, startYear, endYear, hariSekolah);
    const resolved = custom ?? base;
    const isEffective =
      resolved.status === "efektif" ||
      resolved.status === "mpls" ||
      resolved.status === "sts" ||
      resolved.status === "sas" ||
      resolved.status === "kegiatan";

    days.push({
      day: d,
      dateStr,
      dayName: HARI_SINGKAT_ID[dow],
      isEffective,
      offReason: resolved.label,
    });
  }
  return days;
}

export function computeStudentAttendanceStats(
  studentId: string,
  days: MonthAttendanceDay[],
  attendanceMap: AttendanceMap
) {
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;
  let recordedDays = 0;

  days.forEach((d) => {
    if (!d.isEffective) return;
    const code = attendanceMap[`${studentId}|${d.dateStr}`] ?? "";
    if (code === "H") {
      hadir++;
      recordedDays++;
    } else if (code === "S") {
      sakit++;
      recordedDays++;
    } else if (code === "I") {
      izin++;
      recordedDays++;
    } else if (code === "A") {
      alpa++;
      recordedDays++;
    }
  });

  const persenHadir = recordedDays > 0 ? Math.round((hadir / recordedDays) * 100) : 0;
  return { hadir, sakit, izin, alpa, recordedDays, persenHadir };
}

export interface ComputedGradeSummary {
  avgFormatif: number | null;
  avgSumatif: number | null;
  nilaiAkhir: number | null;
  predikat: "Mahir" | "Cakap" | "Layak" | "Perlu Bimbingan" | "Belum Dinilai";
  tuntas: boolean | null;
  tindakLanjut: string;
}

export function computeStudentGradeSummary(
  entry: StudentGradeEntry | undefined,
  kktpMinimal: number,
  bobotFormatif: number
): ComputedGradeSummary {
  if (!entry) {
    return {
      avgFormatif: null,
      avgSumatif: null,
      nilaiAkhir: null,
      predikat: "Belum Dinilai",
      tuntas: null,
      tindakLanjut: "Isi skor formatif atau sumatif",
    };
  }

  const formatifVals = [entry.tp1, entry.tp2, entry.tp3, entry.tp4].filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v)
  );
  const sumatifVals = [entry.lm1, entry.lm2, entry.sts, entry.sas].filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v)
  );

  const avgFormatif =
    formatifVals.length > 0
      ? Math.round((formatifVals.reduce((a, b) => a + b, 0) / formatifVals.length) * 10) / 10
      : null;
  const avgSumatif =
    sumatifVals.length > 0
      ? Math.round((sumatifVals.reduce((a, b) => a + b, 0) / sumatifVals.length) * 10) / 10
      : null;

  let nilaiAkhir: number | null = null;
  if (avgFormatif !== null && avgSumatif !== null) {
    const wF = Math.max(0, Math.min(100, bobotFormatif)) / 100;
    const wS = 1 - wF;
    nilaiAkhir = Math.round(avgFormatif * wF + avgSumatif * wS);
  } else if (avgFormatif !== null) {
    nilaiAkhir = Math.round(avgFormatif);
  } else if (avgSumatif !== null) {
    nilaiAkhir = Math.round(avgSumatif);
  }

  if (nilaiAkhir === null) {
    return {
      avgFormatif,
      avgSumatif,
      nilaiAkhir: null,
      predikat: "Belum Dinilai",
      tuntas: null,
      tindakLanjut: "Isi skor formatif atau sumatif",
    };
  }

  let predikat: ComputedGradeSummary["predikat"] = "Perlu Bimbingan";
  if (nilaiAkhir >= 86) predikat = "Mahir";
  else if (nilaiAkhir >= kktpMinimal) predikat = "Cakap";
  else if (nilaiAkhir >= 56) predikat = "Layak";

  const tuntas = nilaiAkhir >= kktpMinimal;
  let tindakLanjut = "Remedial terarah pada TP yang belum tuntas";
  if (nilaiAkhir >= 86) tindakLanjut = "Tuntas · Program Pengayaan";
  else if (tuntas) tindakLanjut = "Tuntas · Lanjut Materi Berikutnya";

  return {
    avgFormatif,
    avgSumatif,
    nilaiAkhir,
    predikat,
    tuntas,
    tindakLanjut,
  };
}

export function createStarterClasses(): AcademicClass[] {
  return [
    {
      id: "kelas-8a-default",
      namaKelas: "Kelas 8A",
      jenjang: "SMP/MTs",
      fase: "Fase D",
      kelasTingkat: "Kelas 8",
      mataPelajaranDefault: "IPA (Ilmu Pengetahuan Alam)",
      students: [
        { id: "s-1", nis: "2026001", nama: "Ahmad Fauzan Pratama", jenisKelamin: "L" },
        { id: "s-2", nis: "2026002", nama: "Aisyah Putri Ramadhani", jenisKelamin: "P" },
        { id: "s-3", nis: "2026003", nama: "Bagas Adi Nugroho", jenisKelamin: "L" },
        { id: "s-4", nis: "2026004", nama: "Citra Dewi Lestari", jenisKelamin: "P" },
        { id: "s-5", nis: "2026005", nama: "Dimas Arya Saputra", jenisKelamin: "L" },
        { id: "s-6", nis: "2026006", nama: "Fadia Nur Azizah", jenisKelamin: "P" },
        { id: "s-7", nis: "2026007", nama: "Gilang Ramadhan", jenisKelamin: "L" },
        { id: "s-8", nis: "2026008", nama: "Hana Salsabila", jenisKelamin: "P" },
        { id: "s-9", nis: "2026009", nama: "Irfan Maulana Hakim", jenisKelamin: "L" },
        { id: "s-10", nis: "2026010", nama: "Nadia Kusuma Wardani", jenisKelamin: "P" },
      ],
    },
  ];
}

export function createDefaultCoverConfig(params: {
  sekolah: string;
  namaGuru: string;
  tahunAjaran: string;
  mataPelajaran?: string;
  jenjangFaseKelas?: string;
}): CoverPerangkatConfig {
  return {
    tema: "zamrud-emas",
    instansiAtas: "PEMERINTAH DAERAH · DINAS PENDIDIKAN",
    subInstansi: "KOORDINATOR WILAYAH SATUAN PENDIDIKAN",
    namaSekolah: params.sekolah || "SMP NEGERI 1 YOGYAKARTA",
    alamatSekolah: "Jl. Pendidikan No. 1, Indonesia · Kurikulum Merdeka",
    judulUtama: "PERANGKAT PEMBELAJARAN",
    subJudul: "KURIKULUM MERDEKA · PENDEKATAN PEMBELAJARAN MENDALAM",
    mataPelajaran: params.mataPelajaran || "Ilmu Pengetahuan Alam (IPA)",
    jenjangFaseKelas: params.jenjangFaseKelas || "SMP/MTs · Fase D · Kelas 8",
    semester: "Semester I & II (Ganjil & Genap)",
    tahunAjaran: params.tahunAjaran || "2026/2027",
    daftarBerkas: [
      "Kalender Pendidikan (Kaldik) Efektif",
      "Program Tahunan (Prota)",
      "Program Semester (Prosem)",
      "Modul Ajar & LKPD (8 Lampiran Terpadu)",
      "Daftar Hadir Peserta Didik",
      "Rekap Nilai & KKTP Kurikulum Merdeka",
    ],
    namaGuru: params.namaGuru || "Guru Mata Pelajaran",
    nipGuru: "",
    namaKepalaSekolah: "",
    nipKepalaSekolah: "",
    kotaTahun: `Yogyakarta, ${new Date().getFullYear()}`,
    logoPreset: "tut-wuri",
  };
}
