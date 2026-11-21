import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  AcademicClass,
  AkademikSignatureMeta,
  AttendanceMap,
  CoverPerangkatConfig,
  GradeSheetMap,
  ProsemDocument,
  ProtaDocument,
} from "../types/akademik";
import { NAMA_BULAN_ID } from "../types/akademik";
import {
  computeStudentAttendanceStats,
  computeStudentGradeSummary,
  type KaldikYearSummary,
  type MonthAttendanceDay,
} from "./akademikEngine";
import { cleanPdfText } from "./pdfExport";

type RgbColor = [number, number, number];

const C_INK: RgbColor = [15, 41, 34]; // #0F2922
const C_PRIMARY: RgbColor = [20, 83, 60]; // #14533C
const C_GOLD: RgbColor = [202, 138, 4]; // #CA8A04
const C_SLATE_DARK: RgbColor = [15, 23, 42]; // #0F172A
const C_TEXT: RgbColor = [30, 41, 59]; // #1E293B
const C_MUTED: RgbColor = [100, 116, 139]; // #64748B
const C_BORDER: RgbColor = [226, 232, 240]; // #E2E8F0
const C_SUBTLE_BG: RgbColor = [248, 250, 252]; // #F8FAFC
const C_EMERALD_SOFT: RgbColor = [236, 253, 245]; // #ECFDF5
const C_RED_TEXT: RgbColor = [220, 38, 38]; // #DC2626
const C_RED_SOFT: RgbColor = [254, 242, 242]; // #FEF2F2

function getFinalY(doc: jsPDF, fallback: number): number {
  const d = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
  return d.lastAutoTable?.finalY ?? fallback;
}

function drawHeader(
  doc: jsPDF,
  pageW: number,
  marginX: number,
  sekolah: string,
  title: string,
  subtitle: string
): number {
  let y = 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C_PRIMARY);
  doc.text(cleanPdfText(sekolah.toUpperCase()), pageW / 2, y, { align: "center" });
  y += 5.5;

  doc.setFont("times", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(...C_INK);
  doc.text(cleanPdfText(title), pageW / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(...C_MUTED);
  doc.text(cleanPdfText(subtitle), pageW / 2, y, { align: "center" });
  y += 3;

  doc.setDrawColor(...C_INK);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageW - marginX, y);
  return y + 4.5;
}

function drawSignature(
  doc: jsPDF,
  startY: number,
  marginX: number,
  pageW: number,
  pageH: number,
  meta: AkademikSignatureMeta
) {
  let y = startY;
  if (y + 34 > pageH - 12) {
    doc.addPage();
    y = 16;
  }

  const leftX = marginX + 6;
  const rightX = pageW / 2 + 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C_TEXT);
  doc.text("Mengetahui,", leftX, y);
  doc.text(cleanPdfText(meta.kotaTanggal || "...................., ...................... 2026"), rightX, y);
  y += 4.5;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C_INK);
  doc.text("Kepala Sekolah", leftX, y);
  doc.text("Guru Mata Pelajaran", rightX, y);
  y += 17;

  const kepsek = cleanPdfText(meta.namaKepalaSekolah || "....................................................");
  const guru = cleanPdfText(meta.penyusun || "....................................................");
  doc.text(kepsek, leftX, y);
  doc.text(guru, rightX, y);

  // Subtle underline for names
  doc.setDrawColor(...C_INK);
  doc.setLineWidth(0.25);
  doc.line(leftX, y + 0.8, leftX + doc.getTextWidth(kepsek), y + 0.8);
  doc.line(rightX, y + 0.8, rightX + doc.getTextWidth(guru), y + 0.8);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C_TEXT);
  doc.text(cleanPdfText(`NIP. ${meta.nipKepalaSekolah || "..........................................."}`), leftX, y);
  doc.text(cleanPdfText(`NIP. ${meta.nipGuru || "..........................................."}`), rightX, y);
}

function addPageFooters(doc: jsPDF, marginX: number, label: string) {
  const total = doc.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...C_MUTED);
    doc.text(cleanPdfText(label), marginX, pageH - 5.5);
    doc.text(`Halaman ${p} dari ${total}`, pageW - marginX, pageH - 5.5, { align: "right" });
  }
}

export async function exportCoverToPdf(cover: CoverPerangkatConfig): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;

  const frameColor: RgbColor =
    cover.tema === "zamrud-emas"
      ? C_INK
      : cover.tema === "bingkai-akademik"
        ? C_PRIMARY
        : C_SLATE_DARK;
  const accentColor: RgbColor = cover.tema === "zamrud-emas" ? C_GOLD : frameColor;

  // Outer Frame
  if (cover.tema === "zamrud-emas") {
    doc.setDrawColor(...frameColor);
    doc.setLineWidth(1.2);
    doc.rect(11, 11, pageW - 22, pageH - 22);
    doc.setLineWidth(0.35);
    doc.rect(12.8, 12.8, pageW - 25.6, pageH - 25.6);

    // Gold corner ornaments
    doc.setDrawColor(...C_GOLD);
    doc.setLineWidth(0.6);
    // Top-left
    doc.line(15, 15, 22, 15);
    doc.line(15, 15, 15, 22);
    // Top-right
    doc.line(pageW - 15, 15, pageW - 22, 15);
    doc.line(pageW - 15, 15, pageW - 15, 22);
    // Bottom-left
    doc.line(15, pageH - 15, 22, pageH - 15);
    doc.line(15, pageH - 15, 15, pageH - 22);
    // Bottom-right
    doc.line(pageW - 15, pageH - 15, pageW - 22, pageH - 15);
    doc.line(pageW - 15, pageH - 15, pageW - 15, pageH - 22);
  } else if (cover.tema === "bingkai-akademik") {
    doc.setDrawColor(...C_PRIMARY);
    doc.setLineWidth(1.6);
    doc.rect(11, 11, pageW - 22, pageH - 22);
    doc.setLineWidth(0.3);
    doc.rect(13.5, 13.5, pageW - 27, pageH - 27);
  } else {
    doc.setDrawColor(...C_SLATE_DARK);
    doc.setLineWidth(0.8);
    doc.rect(12, 12, pageW - 24, pageH - 24);
  }

  // Kop Instansi
  let y = 25;
  const alignKop = cover.tema === "minimalis-tegas" ? "left" : "center";
  const kopX = cover.tema === "minimalis-tegas" ? 20 : pageW / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C_TEXT);
  doc.text(cleanPdfText(cover.instansiAtas.toUpperCase()), kopX, y, { align: alignKop });
  y += 5;

  if (cover.subInstansi.trim()) {
    doc.setFontSize(9.5);
    doc.setTextColor(...C_PRIMARY);
    doc.text(cleanPdfText(cover.subInstansi.toUpperCase()), kopX, y, { align: alignKop });
    y += 6;
  }

  doc.setFont("times", "bold");
  doc.setFontSize(16.5);
  doc.setTextColor(...frameColor);
  doc.text(cleanPdfText(cover.namaSekolah.toUpperCase()), kopX, y, { align: alignKop });
  y += 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(...C_MUTED);
  doc.text(cleanPdfText(cover.alamatSekolah), kopX, y, { align: alignKop });
  y += 4;

  doc.setDrawColor(...frameColor);
  doc.setLineWidth(0.7);
  doc.line(20, y, pageW - 20, y);

  // Logo Sekolah / Emblem
  y += 14;
  if (cover.customLogoDataUrl) {
    try {
      const match = cover.customLogoDataUrl.match(/^data:image\/(png|jpeg|jpg);base64,/i);
      const format = match && match[1].toLowerCase() === "png" ? "PNG" : "JPEG";
      doc.addImage(cover.customLogoDataUrl, format, pageW / 2 - 14, y, 28, 28);
      y += 36;
    } catch {
      y += 8;
    }
  } else if (cover.logoPreset !== "tanpa-logo") {
    const cx = pageW / 2;
    const cy = y + 12;
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.circle(cx, cy, 12);
    doc.setLineWidth(0.3);
    doc.circle(cx, cy, 9.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...frameColor);
    const badgeLabel =
      cover.logoPreset === "tut-wuri"
        ? "TUT WURI HANDAYANI"
        : cover.logoPreset === "garuda-perisai"
          ? "PENDIDIKAN NASIONAL"
          : "KURIKULUM MERDEKA";
    doc.text(badgeLabel, cx, cy + 16, { align: "center" });
    y += 32;
  } else {
    y += 10;
  }

  // Judul Utama Cover
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.4);
  doc.line(35, y, pageW - 35, y);
  y += 9;

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...frameColor);
  const judulLines = doc.splitTextToSize(cleanPdfText(cover.judulUtama.toUpperCase()), pageW - 50) as string[];
  doc.text(judulLines, pageW / 2, y, { align: "center" });
  y += judulLines.length * 8.5;

  doc.line(35, y, pageW - 35, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C_PRIMARY);
  doc.text(cleanPdfText(cover.subJudul.toUpperCase()), pageW / 2, y, { align: "center" });
  y += 10;

  // Identity Table
  autoTable(doc, {
    startY: y,
    margin: { left: 32, right: 32 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9.8,
      cellPadding: 3,
      valign: "top",
      textColor: C_INK,
      lineColor: C_BORDER,
      lineWidth: 0.25,
    },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: "bold", fillColor: C_SUBTLE_BG },
      1: { cellWidth: 94, fontStyle: "bold" },
    },
    body: [
      ["Mata Pelajaran", cleanPdfText(cover.mataPelajaran)],
      ["Jenjang / Fase / Kelas", cleanPdfText(cover.jenjangFaseKelas)],
      ["Semester", cleanPdfText(cover.semester)],
      ["Tahun Ajaran", cleanPdfText(cover.tahunAjaran)],
    ],
  });

  y = getFinalY(doc, y + 36) + 7;

  // Kelengkapan Berkas Box
  if (cover.daftarBerkas.length > 0) {
    const items = cover.daftarBerkas.map((b, i) => `${i + 1}. ${cleanPdfText(b)}`);
    autoTable(doc, {
      startY: y,
      margin: { left: 32, right: 32 },
      head: [
        [
          {
            content: "KELENGKAPAN PERANGKAT AJAR",
            styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold", fontSize: 8.8 },
          },
        ],
      ],
      body: [[items.join("\n")]],
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        fillColor: C_SUBTLE_BG,
        textColor: C_TEXT,
        lineColor: C_BORDER,
        lineWidth: 0.25,
      },
    });
    y = getFinalY(doc, y + 25) + 6;
  }

  // Pengesahan di bawah Cover
  const sigY = Math.max(y + 4, 224);
  drawSignature(doc, sigY, 20, pageW, pageH, {
    sekolah: cover.namaSekolah,
    penyusun: cover.namaGuru,
    nipGuru: cover.nipGuru,
    namaKepalaSekolah: cover.namaKepalaSekolah,
    nipKepalaSekolah: cover.nipKepalaSekolah,
    kotaTanggal: cover.kotaTahun,
  });

  doc.setDrawColor(...frameColor);
  doc.setLineWidth(0.5);
  doc.line(20, 270, pageW - 20, 270);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...frameColor);
  doc.text(
    cleanPdfText(`${cover.namaSekolah.toUpperCase()} · TAHUN AJARAN ${cover.tahunAjaran}`),
    pageW / 2,
    277,
    { align: "center" }
  );

  doc.save(`cover-perangkat-ajar-${cover.tahunAjaran.replace("/", "-")}.pdf`);
}

export async function exportKaldikToPdf(
  kaldik: KaldikYearSummary,
  meta: AkademikSignatureMeta
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const marginX = 13;

  let y = drawHeader(
    doc,
    pageW,
    marginX,
    meta.sekolah,
    `KALENDER PENDIDIKAN & ANALISIS MINGGU EFEKTIF · ${kaldik.tahunAjaran}`,
    `Pola ${kaldik.hariSekolah} Hari Sekolah · Total ${kaldik.totalEffectiveWeeks} Minggu Efektif (${kaldik.totalEffectiveDays} Hari Belajar Efektif)`
  );

  // KPI Summary Boxes
  const kpis = [
    ["Total Minggu Efektif", `${kaldik.totalEffectiveWeeks} Pekan`],
    ["Semester 1 (Ganjil)", `${kaldik.semester1.effectiveWeeks} ME · ${kaldik.semester1.effectiveDays} HBE`],
    ["Semester 2 (Genap)", `${kaldik.semester2.effectiveWeeks} ME · ${kaldik.semester2.effectiveDays} HBE`],
    ["Hari Belajar Efektif", `${kaldik.totalEffectiveDays} Hari/Tahun`],
  ];
  const boxW = (pageW - marginX * 2 - 9) / 4;
  kpis.forEach(([lbl, val], i) => {
    const bx = marginX + i * (boxW + 3);
    doc.setFillColor(...C_SUBTLE_BG);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.25);
    doc.rect(bx, y, boxW, 14, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...C_MUTED);
    doc.text(lbl, bx + 2.5, y + 4.8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.8);
    doc.setTextColor(...C_INK);
    doc.text(val, bx + 2.5, y + 10.5);
  });
  y += 19;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX, top: 12, bottom: 14 },
    rowPageBreak: "avoid",
    head: [
      ["No", "Bulan / Tahun", "Smt", "Jml Pekan", "Pekan Efektif", "Tdk Efektif", "Hari Efektif", "Agenda & Libur Penting"],
    ],
    body: [
      ...kaldik.months.map((m, idx) => [
        String(idx + 1),
        `${m.monthName} ${m.year}`,
        String(m.semester),
        String(m.totalWeeks),
        String(m.effectiveWeeks),
        String(m.nonEffectiveWeeks),
        String(m.effectiveDays),
        m.agendaList.length
          ? cleanPdfText(m.agendaList.slice(0, 3).map((a) => `${a.day}: ${a.label}`).join("; "))
          : "Kegiatan belajar efektif reguler",
      ]),
      [
        "",
        "TOTAL TAHUN AJARAN",
        "1 & 2",
        String(kaldik.months.reduce((s, m) => s + m.totalWeeks, 0)),
        String(kaldik.totalEffectiveWeeks),
        String(kaldik.semester1.nonEffectiveWeeks + kaldik.semester2.nonEffectiveWeeks),
        String(kaldik.totalEffectiveDays),
        `Ganjil: ${kaldik.semester1.effectiveWeeks} ME · Genap: ${kaldik.semester2.effectiveWeeks} ME`,
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.3,
      valign: "top",
      textColor: C_TEXT,
      lineColor: C_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C_INK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fillColor: C_SUBTLE_BG, fontStyle: "bold" },
      1: { cellWidth: 32, fontStyle: "bold", textColor: C_INK },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 17, halign: "center" },
      4: { cellWidth: 19, halign: "center", fontStyle: "bold", textColor: C_PRIMARY },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 19, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 57, halign: "justify" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === kaldik.months.length) {
        data.cell.styles.fillColor = C_SUBTLE_BG;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = C_INK;
      }
    },
  });

  drawSignature(doc, getFinalY(doc, y) + 8, marginX, pageW, pageH, meta);
  addPageFooters(doc, marginX, `Kalender Pendidikan ${kaldik.tahunAjaran} · ${meta.sekolah}`);
  doc.save(`kaldik-${kaldik.tahunAjaran.replace("/", "-")}.pdf`);
}

export async function exportProtaToPdf(
  prota: ProtaDocument,
  kaldik: KaldikYearSummary,
  meta: AkademikSignatureMeta
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const marginX = 13;

  const totalJp = prota.rows.reduce((s, r) => s + r.alokasiJp, 0);

  let y = drawHeader(
    doc,
    pageW,
    marginX,
    meta.sekolah,
    "PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA",
    `${prota.mataPelajaran} · ${prota.jenjang} (${prota.fase} / ${prota.kelas}) · Tahun Ajaran ${prota.tahunAjaran}`
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(...C_TEXT);
  doc.text(
    cleanPdfText(
      `Basis Perhitungan Kaldik: ${kaldik.totalEffectiveWeeks} Minggu Efektif (Ganjil ${kaldik.semester1.effectiveWeeks} ME + Genap ${kaldik.semester2.effectiveWeeks} ME) × ${prota.jpPerMinggu} JP/Minggu = ${totalJp} JP Total.`
    ),
    marginX,
    y
  );
  y += 5;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX, top: 12, bottom: 14 },
    rowPageBreak: "avoid",
    head: [["No", "Smt", "Elemen / Lingkup", "Topik / Materi Pokok Kurikulum Merdeka", "Alokasi JP", "Keterangan"]],
    body: [
      ...prota.rows.map((r, idx) => [
        String(idx + 1),
        `Smt ${r.semester}`,
        cleanPdfText(r.elemen),
        cleanPdfText(r.materiPokok),
        `${r.alokasiJp} JP`,
        cleanPdfText(r.keterangan),
      ]),
      ["", "", "", "TOTAL ALOKASI JAM PELAJARAN SETAHUN", `${totalJp} JP`, `${kaldik.totalEffectiveWeeks} Minggu Efektif`],
    ],
    styles: {
      font: "helvetica",
      fontSize: 8.6,
      cellPadding: 2.4,
      valign: "top",
      textColor: C_TEXT,
      lineColor: C_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C_INK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fillColor: C_SUBTLE_BG },
      1: { cellWidth: 14, halign: "center" },
      2: { cellWidth: 34 },
      3: { cellWidth: 68, fontStyle: "bold", textColor: C_INK, halign: "justify" },
      4: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: C_PRIMARY },
      5: { cellWidth: 38, halign: "justify" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === prota.rows.length) {
        data.cell.styles.fillColor = C_SUBTLE_BG;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = C_INK;
      }
    },
  });

  drawSignature(doc, getFinalY(doc, y) + 8, marginX, pageW, pageH, meta);
  addPageFooters(doc, marginX, `Prota ${prota.mataPelajaran} · ${prota.tahunAjaran}`);
  doc.save(
    `prota-${prota.mataPelajaran.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${prota.tahunAjaran.replace("/", "-")}.pdf`
  );
}

export async function exportProsemToPdf(
  prosem: ProsemDocument,
  kaldik: KaldikYearSummary,
  meta: AkademikSignatureMeta
): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const marginX = 11;

  const semMonths = kaldik.months.filter((m) => m.semester === prosem.semester);
  const weekCols: { key: string; label: string; isEffective: boolean }[] = [];
  semMonths.forEach((m) => {
    m.weeks.forEach((w) => {
      weekCols.push({
        key: `${m.month}-${w.weekIndex}`,
        label: String(w.weekIndex),
        isEffective: w.isEffective,
      });
    });
  });

  const y = drawHeader(
    doc,
    pageW,
    marginX,
    meta.sekolah,
    `PROGRAM SEMESTER (PROSEM) · SEMESTER ${prosem.semester === 1 ? "I (GANJIL)" : "II (GENAP)"}`,
    `${prosem.mataPelajaran} · ${prosem.jenjang} (${prosem.fase} / ${prosem.kelas}) · Tahun Ajaran ${prosem.tahunAjaran}`
  );

  const monthHeaderRow = [
    { content: "No", rowSpan: 2 },
    { content: "Materi Pokok / Topik", rowSpan: 2 },
    { content: "JP", rowSpan: 2 },
    ...semMonths.map((m) => ({
      content: m.monthName.slice(0, 3),
      colSpan: m.weeks.length,
      styles: { halign: "center" as const },
    })),
  ];

  const weekHeaderRow = weekCols.map((wc) => ({
    content: wc.label,
    styles: {
      fillColor: wc.isEffective ? C_PRIMARY : C_MUTED,
      textColor: [255, 255, 255] as RgbColor,
      halign: "center" as const,
    },
  }));

  const weekAreaW = pageW - marginX * 2 - (9 + 72 + 12);
  const perWeekW = Math.max(5.5, weekAreaW / Math.max(1, weekCols.length));

  const columnStyles: Record<number, { cellWidth: number; halign?: "left" | "center" | "right" | "justify"; fontStyle?: "normal" | "bold"; fillColor?: RgbColor; textColor?: RgbColor }> = {
    0: { cellWidth: 9, halign: "center", fillColor: C_SUBTLE_BG },
    1: { cellWidth: 72, fontStyle: "bold", textColor: C_INK },
    2: { cellWidth: 12, halign: "center", fontStyle: "bold", textColor: C_PRIMARY },
  };
  weekCols.forEach((_, idx) => {
    columnStyles[3 + idx] = { cellWidth: perWeekW, halign: "center" };
  });

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX, top: 10, bottom: 13 },
    rowPageBreak: "avoid",
    head: [monthHeaderRow, weekHeaderRow],
    body: prosem.rows.map((r, idx) => {
      const rowDist = Object.values(r.pekanJp).reduce((s, v) => s + (Number(v) || 0), 0);
      return [
        String(idx + 1),
        cleanPdfText(r.materiPokok),
        String(rowDist || r.alokasiJp),
        ...weekCols.map((wc) => {
          if (!wc.isEffective) return "×";
          const val = r.pekanJp[wc.key] ?? 0;
          return val > 0 ? String(val) : "";
        }),
      ];
    }),
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      cellPadding: 1.6,
      valign: "top",
      textColor: C_TEXT,
      lineColor: C_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C_INK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      valign: "middle",
    },
    columnStyles,
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index >= 3) {
        const wc = weekCols[data.column.index - 3];
        if (!wc) return;
        if (!wc.isEffective) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [148, 163, 184];
        } else if (data.cell.raw && String(data.cell.raw).trim() !== "") {
          data.cell.styles.fillColor = C_EMERALD_SOFT;
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = C_INK;
        }
      }
    },
  });

  drawSignature(doc, getFinalY(doc, y) + 7, marginX, pageW, pageH, meta);
  addPageFooters(doc, marginX, `Prosem Smt ${prosem.semester} · ${prosem.mataPelajaran} · ${prosem.tahunAjaran}`);
  doc.save(`prosem-smt${prosem.semester}-${prosem.tahunAjaran.replace("/", "-")}.pdf`);
}

export async function exportPresensiToPdf(params: {
  academicClass: AcademicClass;
  mataPelajaran: string;
  tahunAjaran: string;
  month: number;
  year: number;
  days: MonthAttendanceDay[];
  attendanceMap: AttendanceMap;
  meta: AkademikSignatureMeta;
}): Promise<void> {
  const { academicClass, mataPelajaran, tahunAjaran, month, year, days, attendanceMap, meta } = params;
  const monthName = NAMA_BULAN_ID[month - 1];

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const marginX = 10;

  const y = drawHeader(
    doc,
    pageW,
    marginX,
    meta.sekolah,
    `DAFTAR HADIR PESERTA DIDIK · ${monthName.toUpperCase()} ${year}`,
    `${academicClass.namaKelas} (${academicClass.jenjang} · ${academicClass.fase}) · ${mataPelajaran} · Tahun Ajaran ${tahunAjaran}`
  );

  const fixedW = 8 + 46 + 5 * 7.5; // No + Nama + H,S,I,A,%
  const dayColW = Math.max(5.2, (pageW - marginX * 2 - fixedW) / Math.max(1, days.length));

  const columnStyles: Record<number, { cellWidth: number; halign?: "left" | "center" | "right"; fontStyle?: "normal" | "bold"; fillColor?: RgbColor; textColor?: RgbColor }> = {
    0: { cellWidth: 8, halign: "center", fillColor: C_SUBTLE_BG },
    1: { cellWidth: 46, fontStyle: "bold", textColor: C_INK },
  };
  days.forEach((_, i) => {
    columnStyles[2 + i] = { cellWidth: dayColW, halign: "center" };
  });
  const sumStart = 2 + days.length;
  columnStyles[sumStart] = { cellWidth: 7.5, halign: "center", fontStyle: "bold" };
  columnStyles[sumStart + 1] = { cellWidth: 7.5, halign: "center" };
  columnStyles[sumStart + 2] = { cellWidth: 7.5, halign: "center" };
  columnStyles[sumStart + 3] = { cellWidth: 7.5, halign: "center", textColor: C_RED_TEXT };
  columnStyles[sumStart + 4] = { cellWidth: 9.5, halign: "center", fontStyle: "bold", textColor: C_PRIMARY };

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX, top: 10, bottom: 13 },
    rowPageBreak: "avoid",
    head: [
      [
        "No",
        "Nama Peserta Didik",
        ...days.map((d) => ({
          content: String(d.day),
          styles: {
            fillColor: d.isEffective ? C_INK : C_MUTED,
            halign: "center" as const,
          },
        })),
        { content: "H", styles: { fillColor: C_PRIMARY, halign: "center" as const } },
        { content: "S", styles: { fillColor: C_PRIMARY, halign: "center" as const } },
        { content: "I", styles: { fillColor: C_PRIMARY, halign: "center" as const } },
        { content: "A", styles: { fillColor: C_PRIMARY, halign: "center" as const } },
        { content: "%", styles: { fillColor: C_PRIMARY, halign: "center" as const } },
      ],
    ],
    body: academicClass.students.map((stu, idx) => {
      const stats = computeStudentAttendanceStats(stu.id, days, attendanceMap);
      return [
        String(idx + 1),
        cleanPdfText(stu.nama),
        ...days.map((d) => (d.isEffective ? attendanceMap[`${stu.id}|${d.dateStr}`] ?? "" : "L")),
        String(stats.hadir),
        String(stats.sakit),
        String(stats.izin),
        String(stats.alpa),
        `${stats.persenHadir}%`,
      ];
    }),
    styles: {
      font: "helvetica",
      fontSize: 7.4,
      cellPadding: 1.4,
      valign: "top",
      textColor: C_TEXT,
      lineColor: C_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C_INK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles,
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index >= 2 && data.column.index < sumStart) {
        const d = days[data.column.index - 2];
        if (!d) return;
        if (!d.isEffective) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [148, 163, 184];
        } else if (data.cell.raw === "A") {
          data.cell.styles.fillColor = C_RED_SOFT;
          data.cell.styles.textColor = C_RED_TEXT;
          data.cell.styles.fontStyle = "bold";
        } else if (data.cell.raw === "H") {
          data.cell.styles.fillColor = C_EMERALD_SOFT;
          data.cell.styles.textColor = C_PRIMARY;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  drawSignature(doc, getFinalY(doc, y) + 7, marginX, pageW, pageH, meta);
  addPageFooters(doc, marginX, `Daftar Hadir ${academicClass.namaKelas} · ${monthName} ${year}`);
  doc.save(
    `daftar-hadir-${academicClass.namaKelas.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}-${String(month).padStart(2, "0")}.pdf`
  );
}

export async function exportRekapNilaiToPdf(params: {
  academicClass: AcademicClass;
  mataPelajaran: string;
  tahunAjaran: string;
  semester: 1 | 2;
  kktpMinimal: number;
  bobotFormatif: number;
  gradeMap: GradeSheetMap;
  meta: AkademikSignatureMeta;
}): Promise<void> {
  const { academicClass, mataPelajaran, tahunAjaran, semester, kktpMinimal, bobotFormatif, gradeMap, meta } =
    params;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const marginX = 10;

  const y = drawHeader(
    doc,
    pageW,
    marginX,
    meta.sekolah,
    `REKAPITULASI NILAI & KETUNTASAN KKTP · SEMESTER ${semester === 1 ? "I (GANJIL)" : "II (GENAP)"}`,
    `${academicClass.namaKelas} (${academicClass.jenjang} · ${academicClass.fase}) · ${mataPelajaran} · KKTP Minimal: ${kktpMinimal} · Bobot ${bobotFormatif}% Fmt / ${100 - bobotFormatif}% Smt · TA ${tahunAjaran}`
  );

  const fmtVal = (n: number | null | undefined) => (typeof n === "number" ? String(n) : "-");
  const studentRows = academicClass.students.map((stu, idx) => {
    const entry = gradeMap[stu.id];
    const sum = computeStudentGradeSummary(entry, kktpMinimal, bobotFormatif);
    return {
      sum,
      cells: [
        String(idx + 1),
        cleanPdfText(stu.nis),
        cleanPdfText(stu.nama),
        fmtVal(entry?.tp1),
        fmtVal(entry?.tp2),
        fmtVal(entry?.tp3),
        fmtVal(entry?.tp4),
        fmtVal(sum.avgFormatif),
        fmtVal(entry?.lm1),
        fmtVal(entry?.lm2),
        fmtVal(entry?.sts),
        fmtVal(entry?.sas),
        fmtVal(sum.avgSumatif),
        fmtVal(sum.nilaiAkhir),
        cleanPdfText(sum.predikat),
        cleanPdfText(sum.tindakLanjut),
      ],
    };
  });

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX, top: 10, bottom: 13 },
    rowPageBreak: "avoid",
    head: [
      [
        "No",
        "NIS",
        "Nama Peserta Didik",
        "TP1",
        "TP2",
        "TP3",
        "TP4",
        { content: "Avg Fmt", styles: { fillColor: C_PRIMARY } },
        "LM1",
        "LM2",
        "STS",
        "SAS",
        { content: "Avg Smt", styles: { fillColor: C_PRIMARY } },
        "NA",
        "Predikat",
        "Tindak Lanjut KKTP",
      ],
    ],
    body: studentRows.map((r) => r.cells),
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      cellPadding: 1.7,
      valign: "top",
      textColor: C_TEXT,
      lineColor: C_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C_INK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fillColor: C_SUBTLE_BG },
      1: { cellWidth: 20 },
      2: { cellWidth: 44, fontStyle: "bold", textColor: C_INK },
      3: { cellWidth: 11, halign: "center" },
      4: { cellWidth: 11, halign: "center" },
      5: { cellWidth: 11, halign: "center" },
      6: { cellWidth: 11, halign: "center" },
      7: { cellWidth: 14, halign: "center", fontStyle: "bold", fillColor: C_SUBTLE_BG },
      8: { cellWidth: 11, halign: "center" },
      9: { cellWidth: 11, halign: "center" },
      10: { cellWidth: 11, halign: "center" },
      11: { cellWidth: 11, halign: "center" },
      12: { cellWidth: 14, halign: "center", fontStyle: "bold", fillColor: C_SUBTLE_BG },
      13: { cellWidth: 12, halign: "center", fontStyle: "bold" },
      14: { cellWidth: 26, fontStyle: "bold" },
      15: { cellWidth: 51, halign: "justify" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && (data.column.index === 13 || data.column.index === 14)) {
        const info = studentRows[data.row.index]?.sum;
        if (!info) return;
        if (info.tuntas === false) {
          data.cell.styles.fillColor = C_RED_SOFT;
          data.cell.styles.textColor = C_RED_TEXT;
        } else if (info.tuntas === true) {
          data.cell.styles.fillColor = C_EMERALD_SOFT;
          data.cell.styles.textColor = C_PRIMARY;
        }
      }
    },
  });

  drawSignature(doc, getFinalY(doc, y) + 7, marginX, pageW, pageH, meta);
  addPageFooters(doc, marginX, `Rekap Nilai ${academicClass.namaKelas} · Smt ${semester} · ${tahunAjaran}`);
  doc.save(
    `rekap-nilai-${academicClass.namaKelas.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-smt${semester}-${tahunAjaran.replace("/", "-")}.pdf`
  );
}
