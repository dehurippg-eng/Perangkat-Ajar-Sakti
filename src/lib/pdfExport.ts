import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DAFTAR_LAMPIRAN, type ModulAjar } from "../types/modul";
import { resolveLampiran } from "./lampiranHelper";

export interface ModulPdfOptions {
  includeCoverAndToc?: boolean;
  sectionView?: "all" | "modul" | "lampiran";
}

type RgbColor = [number, number, number];

const C_INK: RgbColor = [15, 41, 34]; // #0F2922
const C_PRIMARY: RgbColor = [20, 83, 60]; // #14533C
const C_TEXT: RgbColor = [30, 41, 59]; // #1E293B
const C_SLATE: RgbColor = [51, 65, 85]; // #334155
const C_MUTED: RgbColor = [100, 116, 139]; // #64748B
const C_BORDER: RgbColor = [226, 232, 240]; // #E2E8F0
const C_SUBTLE_BG: RgbColor = [248, 250, 252]; // #F8FAFC
const C_HEAD_ALT: RgbColor = [241, 245, 249]; // #F1F5F9
const C_GOLD: RgbColor = [202, 138, 4]; // #CA8A04

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 13;
const MARGIN_TOP = 11;
const MARGIN_BOTTOM = 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2; // 184mm
const MAX_Y = PAGE_H - MARGIN_BOTTOM;

/**
 * Normalizes Unicode symbols not covered by PDF WinAnsi built-in fonts
 * so Indonesian text & math notation never render garbled characters.
 */
export function cleanPdfText(input: unknown): string {
  const raw = String(input ?? "");
  return raw
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2192|\u2794|\u27A1/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2194/g, "<->")
    .replace(/\u2265/g, ">=")
    .replace(/\u2264/g, "<=")
    .replace(/\u2260/g, "!=")
    .replace(/\u2248/g, "~=")
    .replace(/\u221A/g, "akar ")
    .replace(/\u03C0/g, "pi")
    .replace(/\u2713|\u2714/g, "[v]")
    .replace(/\u2717|\u2718/g, "[x]")
    .replace(/\u2026/g, "...")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function getLastTableFinalY(doc: jsPDF, fallbackY: number): number {
  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
  return docWithTable.lastAutoTable?.finalY ?? fallbackY;
}

class PdfCursor {
  doc: jsPDF;
  y: number;
  hasCoverPage: boolean;

  constructor(doc: jsPDF, hasCoverPage: boolean) {
    this.doc = doc;
    this.y = MARGIN_TOP;
    this.hasCoverPage = hasCoverPage;
  }

  ensureSpace(neededHeight: number) {
    if (this.y + neededHeight > MAX_Y) {
      this.doc.addPage();
      this.y = MARGIN_TOP;
    }
  }

  newPage() {
    this.doc.addPage();
    this.y = MARGIN_TOP;
  }

  gap(mm = 2.5) {
    this.y += mm;
  }

  sectionHeading(title: string, accentLine = false) {
    this.ensureSpace(12);
    this.y += 3;
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(11.5);
    this.doc.setTextColor(...C_INK);
    const clean = cleanPdfText(title);
    const lines = this.doc.splitTextToSize(clean, CONTENT_W) as string[];
    this.doc.text(lines, MARGIN_X, this.y);
    this.y += lines.length * 4.6 + 1;
    this.doc.setDrawColor(...(accentLine ? C_INK : C_BORDER));
    this.doc.setLineWidth(accentLine ? 0.5 : 0.25);
    this.doc.line(MARGIN_X, this.y, PAGE_W - MARGIN_X, this.y);
    this.y += 3.5;
  }

  subHeading(title: string) {
    this.ensureSpace(9);
    this.y += 1.5;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...C_PRIMARY);
    const lines = this.doc.splitTextToSize(cleanPdfText(title), CONTENT_W) as string[];
    this.doc.text(lines, MARGIN_X, this.y);
    this.y += lines.length * 4.1 + 1.5;
  }

  paragraphJustified(text: string, opts?: { fontSize?: number; color?: RgbColor; afterMm?: number; x?: number; width?: number }) {
    const fontSize = opts?.fontSize ?? 9.5;
    const color = opts?.color ?? C_TEXT;
    const afterMm = opts?.afterMm ?? 2.2;
    const x = opts?.x ?? MARGIN_X;
    const width = opts?.width ?? CONTENT_W;
    const lineH = fontSize * 0.42;

    const clean = cleanPdfText(text);
    if (!clean) return;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...color);

    const paragraphs = clean.split(/\n+/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      const allLines = this.doc.splitTextToSize(trimmed, width) as string[];
      const blockH = allLines.length * lineH;

      if (this.y + blockH <= MAX_Y) {
        this.doc.text(trimmed, x, this.y, { align: "justify", maxWidth: width });
        this.y += blockH + 1.2;
      } else {
        // Page-aware splitting while keeping lines tidy
        let idx = 0;
        while (idx < allLines.length) {
          const availLines = Math.max(1, Math.floor((MAX_Y - this.y) / lineH));
          if (availLines < 2 && this.y > MARGIN_TOP + 10) {
            this.newPage();
            continue;
          }
          const chunk = allLines.slice(idx, idx + availLines);
          const isFinalChunk = idx + chunk.length >= allLines.length;
          if (isFinalChunk && chunk.length > 1) {
            this.doc.text(chunk.join(" "), x, this.y, { align: "justify", maxWidth: width });
          } else if (!isFinalChunk && chunk.length > 1) {
            // Draw justified lines except handle line spacing explicitly
            chunk.forEach((ln, li) => {
              this.doc.text(ln, x, this.y + li * lineH);
            });
          } else {
            this.doc.text(chunk, x, this.y);
          }
          this.y += chunk.length * lineH;
          idx += chunk.length;
          if (idx < allLines.length) {
            this.newPage();
          }
        }
        this.y += 1.2;
      }
    }
    this.y += Math.max(0, afterMm - 1.2);
  }

  labelValue(label: string, value: string, fontSize = 9.5) {
    const cleanLabel = cleanPdfText(label);
    const cleanVal = cleanPdfText(value);
    const lineH = fontSize * 0.42;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(fontSize);
    const labelW = this.doc.getTextWidth(cleanLabel + " ");

    // If short or fits nicely on one paragraph flow, render bold label + justified body
    const combined = `${cleanLabel} ${cleanVal}`;
    const lines = this.doc.splitTextToSize(combined, CONTENT_W) as string[];
    this.ensureSpace(Math.min(lines.length * lineH + 2, 24));

    if (lines.length === 1) {
      this.doc.setTextColor(...C_INK);
      this.doc.text(cleanLabel, MARGIN_X, this.y);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...C_TEXT);
      this.doc.text(cleanVal, MARGIN_X + labelW, this.y);
      this.y += lineH + 1.8;
    } else {
      this.doc.setTextColor(...C_INK);
      this.doc.text(cleanLabel, MARGIN_X, this.y);
      this.y += lineH + 0.5;
      this.paragraphJustified(cleanVal, { fontSize, color: C_TEXT, afterMm: 2 });
    }
  }

  listItems(items: string[], ordered = false, fontSize = 9.3) {
    const lineH = fontSize * 0.42;
    const prefixW = ordered ? 6 : 4.5;
    const textW = CONTENT_W - prefixW;

    items.forEach((rawItem, idx) => {
      const clean = cleanPdfText(rawItem);
      if (!clean) return;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(fontSize);
      const lines = this.doc.splitTextToSize(clean, textW) as string[];
      this.ensureSpace(Math.min(lines.length * lineH + 1.5, 22));

      const marker = ordered ? `${idx + 1}.` : "•";
      this.doc.setTextColor(...C_PRIMARY);
      this.doc.setFont("helvetica", ordered ? "bold" : "normal");
      this.doc.text(marker, MARGIN_X, this.y);

      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...C_TEXT);
      if (this.y + lines.length * lineH <= MAX_Y) {
        this.doc.text(clean, MARGIN_X + prefixW, this.y, { align: "justify", maxWidth: textW });
        this.y += lines.length * lineH + 1.2;
      } else {
        this.paragraphJustified(clean, { fontSize, x: MARGIN_X + prefixW, width: textW, afterMm: 1.2 });
      }
    });
    this.y += 0.8;
  }

  runTable(options: Parameters<typeof autoTable>[1]) {
    autoTable(this.doc, {
      startY: this.y,
      margin: { left: MARGIN_X, right: MARGIN_X, top: MARGIN_TOP, bottom: MARGIN_BOTTOM },
      rowPageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: 8.8,
        cellPadding: { top: 2.2, right: 2.6, bottom: 2.2, left: 2.6 },
        valign: "top",
        textColor: C_TEXT,
        lineColor: C_BORDER,
        lineWidth: 0.2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: C_INK,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        valign: "top",
        lineColor: C_INK,
        lineWidth: 0.2,
      },
      ...options,
    });
    this.y = getLastTableFinalY(this.doc, this.y) + 3.5;
  }
}

export async function exportModulToPdf(
  modul: ModulAjar,
  includedLampiran: number[] = [1, 2, 3, 4, 5, 6, 7, 8],
  options?: ModulPdfOptions
): Promise<void> {
  const { identitas, identifikasi, desainPembelajaran, pengalamanBelajar, asesmen, lkpd } = modul;
  const lampiran = resolveLampiran(modul);
  const sectionView = options?.sectionView ?? "all";
  const showModul = sectionView === "all" || sectionView === "modul";
  const showLampiran = sectionView === "all" || sectionView === "lampiran";
  const validLampiran = showLampiran
    ? includedLampiran.filter((id) => id >= 1 && id <= 8)
    : [];
  const hasLampiran = (id: number) => validLampiran.includes(id);
  const includeCoverAndToc = options?.includeCoverAndToc ?? true;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const cursor = new PdfCursor(doc, includeCoverAndToc);

  // =========================================================================
  // 1. SAMPUL PENJILIDAN & DAFTAR ISI
  // =========================================================================
  if (includeCoverAndToc) {
    // Double Emerald & Gold Frame on Cover
    doc.setDrawColor(...C_INK);
    doc.setLineWidth(0.9);
    doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20);
    doc.setDrawColor(...C_GOLD);
    doc.setLineWidth(0.3);
    doc.rect(12, 12, PAGE_W - 24, PAGE_H - 24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C_PRIMARY);
    doc.text("PERANGKAT PEMBELAJARAN KURIKULUM MERDEKA", PAGE_W / 2, 27, { align: "center" });

    doc.setFontSize(9.5);
    doc.setTextColor(...C_MUTED);
    doc.text("PENDEKATAN PEMBELAJARAN MENDALAM (DEEP LEARNING)", PAGE_W / 2, 33, { align: "center" });

    // Title Banner Box
    doc.setFillColor(...C_SUBTLE_BG);
    doc.setDrawColor(...C_INK);
    doc.setLineWidth(0.6);
    doc.rect(18, 44, PAGE_W - 36, 52, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C_PRIMARY);
    doc.text("MODUL AJAR LENGKAP & LAMPIRAN PERANGKAT", PAGE_W / 2, 54, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...C_INK);
    const titleLines = doc.splitTextToSize(cleanPdfText(identitas.judulModul), PAGE_W - 48) as string[];
    doc.text(titleLines.slice(0, 3), PAGE_W / 2, 65, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C_TEXT);
    const subtitle = cleanPdfText(
      `Mata Pelajaran: ${identitas.mataPelajaran}  |  ${identitas.jenjang} (${identitas.fase} / ${identitas.kelas})`
    );
    doc.text(subtitle, PAGE_W / 2, 89, { align: "center" });

    // Cover Identity Table
    autoTable(doc, {
      startY: 108,
      margin: { left: 18, right: 18 },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9.5,
        cellPadding: 3,
        valign: "top",
        textColor: C_TEXT,
        lineColor: C_BORDER,
        lineWidth: 0.25,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
        1: { cellWidth: 119, halign: "justify" },
      },
      body: [
        ["Satuan Pendidikan", cleanPdfText(identitas.sekolah)],
        ["Tahun Ajaran", cleanPdfText(identitas.tahunAjaran)],
        ["Topik / Materi Pokok", cleanPdfText(identitas.topik)],
        ["Alokasi Waktu", cleanPdfText(`${identitas.alokasiWaktu} (${identitas.jumlahPertemuan} Pertemuan)`)],
        ["Model Pembelajaran", cleanPdfText(identitas.modelPembelajaran)],
        [
          "Guru Penyusun",
          cleanPdfText(`${identitas.penyusun}${identitas.nipGuru ? ` (NIP. ${identitas.nipGuru})` : ""}`),
        ],
        [
          "Kepala Sekolah",
          cleanPdfText(
            `${identitas.namaKepalaSekolah || "........................................"}${
              identitas.nipKepalaSekolah ? ` (NIP. ${identitas.nipKepalaSekolah})` : ""
            }`
          ),
        ],
      ],
    });

    // Bottom Stamp on Cover
    doc.setDrawColor(...C_INK);
    doc.setLineWidth(0.5);
    doc.line(24, 266, PAGE_W - 24, 266);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C_INK);
    doc.text(
      cleanPdfText(`${identitas.sekolah.toUpperCase()} · TAHUN AJARAN ${identitas.tahunAjaran}`),
      PAGE_W / 2,
      274,
      { align: "center" }
    );

    // Page 2: Daftar Isi
    cursor.newPage();
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...C_INK);
    doc.text("DAFTAR ISI", PAGE_W / 2, cursor.y + 4, { align: "center" });
    cursor.y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C_MUTED);
    doc.text(cleanPdfText(`Kelengkapan Berkas Penjilidan · ${identitas.judulModul}`), PAGE_W / 2, cursor.y, {
      align: "center",
    });
    cursor.y += 3.5;
    doc.setDrawColor(...C_INK);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, cursor.y, PAGE_W - MARGIN_X, cursor.y);
    cursor.y += 5;

    const tocEntries: [string, string, string][] = [
      ["Bagian I", "Halaman Sampul / Identitas Penjilidan", "Hal. i"],
      ["Bagian II", "Daftar Isi Modul Ajar Lengkap", "Hal. ii"],
    ];
    if (showModul) {
      tocEntries.push(
        ["A", "Identitas Modul Ajar", "Modul Inti"],
        ["B", "Identifikasi Kesiapan Murid & Dimensi Profil Lulusan", "Modul Inti"],
        ["C", "Desain Pembelajaran (CP, TP, Pemahaman Bermakna & Kerangka PM)", "Modul Inti"],
        ["D", "Pengalaman Belajar (Memahami, Mengaplikasi, Merefleksi)", "Modul Inti"],
        ["E", "Asesmen Pembelajaran (Awal, Formatif, Sumatif)", "Modul Inti"],
        ["F", "Glosarium & Daftar Pustaka", "Penutup Modul"],
        ["TTD", "Lembar Pengesahan Kepala Sekolah & Guru Mata Pelajaran", "Pengesahan"]
      );
    }
    DAFTAR_LAMPIRAN.filter((item) => hasLampiran(item.id)).forEach((item) => {
      const colonIdx = item.title.indexOf(":");
      const kode = colonIdx > -1 ? item.title.slice(0, colonIdx) : `Lampiran ${item.id}`;
      const judul = colonIdx > -1 ? item.title.slice(colonIdx + 1).trim() : item.title;
      tocEntries.push([kode, cleanPdfText(judul), "Lampiran Terpadu"]);
    });

    cursor.runTable({
      head: [["Bagian", "Uraian Komponen Modul Ajar & Lampiran", "Keterangan"]],
      body: tocEntries,
      columnStyles: {
        0: { cellWidth: 32, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
        1: { cellWidth: 116, halign: "justify" },
        2: { cellWidth: 36, halign: "center", textColor: C_MUTED },
      },
    });

    cursor.paragraphJustified(
      `Catatan Penjilidan: Berkas ini memuat ${showModul ? "1 berkas Modul Ajar lengkap (Bagian A-F + Pengesahan) dan " : ""}${validLampiran.length} Lampiran terintegrasi siap cetak/jilid ukuran A4.`,
      { fontSize: 8.8, color: C_MUTED }
    );

    cursor.newPage();
  }

  // =========================================================================
  // 2. MODUL AJAR INTI (BAGIAN A - F + PENGESAHAN)
  // =========================================================================
  if (showModul) {
    // Document Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C_PRIMARY);
    doc.text("MODUL AJAR KURIKULUM MERDEKA · PENDEKATAN PEMBELAJARAN MENDALAM", PAGE_W / 2, cursor.y + 2, {
      align: "center",
    });
    cursor.y += 6.5;

    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C_INK);
    const modTitleLines = doc.splitTextToSize(cleanPdfText(identitas.judulModul), CONTENT_W) as string[];
    doc.text(modTitleLines, PAGE_W / 2, cursor.y, { align: "center" });
    cursor.y += modTitleLines.length * 5.6 + 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...C_MUTED);
    doc.text(
      cleanPdfText(
        `${identitas.jenjang} · ${identitas.fase} · ${identitas.kelas} · ${identitas.mataPelajaran} · ${identitas.alokasiWaktu}`
      ),
      PAGE_W / 2,
      cursor.y,
      { align: "center" }
    );
    cursor.y += 2.5;
    doc.setDrawColor(...C_INK);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, cursor.y, PAGE_W - MARGIN_X, cursor.y);
    cursor.y += 4;

    // A. Identitas Modul
    cursor.sectionHeading("A. Identitas Modul");
    cursor.runTable({
      showHead: "never",
      body: [
        ["Nama Penyusun", cleanPdfText(identitas.penyusun)],
        ["Satuan Pendidikan", cleanPdfText(identitas.sekolah)],
        ["Tahun Ajaran", cleanPdfText(identitas.tahunAjaran)],
        ["Jenjang / Fase / Kelas", cleanPdfText(`${identitas.jenjang} / ${identitas.fase} / ${identitas.kelas}`)],
        ["Mata Pelajaran", cleanPdfText(identitas.mataPelajaran)],
        ["Topik / Materi Pokok", cleanPdfText(identitas.topik)],
        ["Alokasi Waktu", cleanPdfText(`${identitas.alokasiWaktu} (${identitas.jumlahPertemuan} Pertemuan)`)],
        ["Model Pembelajaran", cleanPdfText(identitas.modelPembelajaran)],
      ],
      columnStyles: {
        0: { cellWidth: 56, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
        1: { cellWidth: 128, halign: "justify" },
      },
    });

    // B. Identifikasi
    cursor.sectionHeading("B. Identifikasi Kesiapan & Dimensi Profil Lulusan");
    cursor.subHeading("Kesiapan Belajar Murid");
    cursor.paragraphJustified(identifikasi.kesiapanMurid);
    cursor.subHeading("Karakteristik Materi");
    cursor.paragraphJustified(identifikasi.karakteristikMateri);
    cursor.subHeading("Dimensi Profil Lulusan");
    cursor.paragraphJustified(identifikasi.dimensiProfilLulusan.join(" · "));

    // C. Desain Pembelajaran
    cursor.sectionHeading("C. Desain Pembelajaran");
    cursor.subHeading("Capaian Pembelajaran (CP)");
    cursor.paragraphJustified(desainPembelajaran.capaianPembelajaran);
    cursor.subHeading("Tujuan Pembelajaran (TP)");
    cursor.listItems(desainPembelajaran.tujuanPembelajaran, true);

    cursor.runTable({
      showHead: "never",
      body: [
        [
          {
            content: `Pemahaman Bermakna\n${cleanPdfText(desainPembelajaran.pemahamanBermakna)}`,
            styles: { fillColor: C_SUBTLE_BG, halign: "justify" },
          },
        ],
      ],
      didParseCell: (data) => {
        if (data.section === "body") {
          data.cell.styles.textColor = C_TEXT;
        }
      },
    });

    cursor.subHeading("Pertanyaan Pemantik");
    cursor.listItems(desainPembelajaran.pertanyaanPemantik, false);

    // Grid 2x2 Kerangka Pembelajaran Mendalam
    cursor.runTable({
      showHead: "never",
      body: [
        [
          `Praktik Pedagogis:\n${cleanPdfText(desainPembelajaran.praktikPedagogis)}`,
          `Kemitraan Pembelajaran:\n${cleanPdfText(desainPembelajaran.kemitraanPembelajaran)}`,
        ],
        [
          `Lingkungan Belajar:\n${cleanPdfText(desainPembelajaran.lingkunganBelajar)}`,
          `Pemanfaatan Digital:\n${cleanPdfText(desainPembelajaran.pemanfaatanDigital)}`,
        ],
      ],
      columnStyles: {
        0: { cellWidth: 92, halign: "justify" },
        1: { cellWidth: 92, halign: "justify" },
      },
    });

    // D. Pengalaman Belajar
    cursor.sectionHeading("D. Pengalaman Belajar (Langkah Pembelajaran Mendalam)");
    cursor.subHeading("1. Kegiatan Awal");
    cursor.listItems(pengalamanBelajar.kegiatanAwal, false);

    cursor.subHeading("2. Kegiatan Inti");
    pengalamanBelajar.kegiatanInti.forEach((step, idx) => {
      const guruText = step.teacherActivities.map((a) => `• ${cleanPdfText(a)}`).join("\n");
      const muridText = step.studentActivities.map((a) => `• ${cleanPdfText(a)}`).join("\n");
      cursor.runTable({
        head: [
          [
            {
              content: cleanPdfText(
                `Tahap ${idx + 1}: ${step.phase}   ·   Prinsip ${step.principle} · ${step.durationMinutes} menit`
              ),
              colSpan: 2,
              styles: { fillColor: C_SUBTLE_BG, textColor: C_INK, fontStyle: "bold" },
            },
          ],
          [
            {
              content: "Aktivitas Guru",
              styles: { fillColor: C_HEAD_ALT, textColor: C_SLATE, fontStyle: "bold" },
            },
            {
              content: "Aktivitas Murid",
              styles: { fillColor: C_HEAD_ALT, textColor: C_SLATE, fontStyle: "bold" },
            },
          ],
        ],
        body: [[guruText, muridText]],
        columnStyles: {
          0: { cellWidth: 92, halign: "justify" },
          1: { cellWidth: 92, halign: "justify" },
        },
        headStyles: {
          lineColor: C_BORDER,
          lineWidth: 0.2,
          valign: "top",
        },
      });
    });

    cursor.subHeading("3. Kegiatan Penutup");
    cursor.listItems(pengalamanBelajar.kegiatanPenutup, false);

    // E. Asesmen Pembelajaran
    cursor.sectionHeading("E. Asesmen Pembelajaran");
    cursor.labelValue("Asesmen Awal:", asesmen.asesmenAwal);
    cursor.labelValue("Asesmen Formatif:", asesmen.asesmenFormatif);
    cursor.labelValue("Asesmen Sumatif:", asesmen.asesmenSumatif);

    // F. Glosarium & Daftar Pustaka
    cursor.sectionHeading("F. Glosarium & Daftar Pustaka");
    cursor.runTable({
      head: [["Istilah", "Definisi"]],
      body: lampiran.glosariumDanPustaka.glosarium.map((g) => [
        cleanPdfText(g.istilah),
        cleanPdfText(g.definisi),
      ]),
      columnStyles: {
        0: { cellWidth: 52, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
        1: { cellWidth: 132, halign: "justify" },
      },
    });

    cursor.subHeading("Daftar Pustaka");
    cursor.listItems(lampiran.glosariumDanPustaka.daftarPustaka, false, 8.8);

    // Lembar Pengesahan
    cursor.ensureSpace(36);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, cursor.y, PAGE_W - MARGIN_X, cursor.y);
    cursor.y += 4;

    cursor.runTable({
      theme: "plain",
      showHead: "never",
      styles: {
        font: "helvetica",
        fontSize: 9.2,
        cellPadding: 1.5,
        valign: "top",
        textColor: C_TEXT,
        lineWidth: 0,
      },
      body: [
        [
          cleanPdfText(
            `Mengetahui,\nKepala Sekolah\n\n\n\n${
              identitas.namaKepalaSekolah || "...................................................."
            }\nNIP. ${identitas.nipKepalaSekolah || "..........................................."}`
          ),
          cleanPdfText(
            `${identitas.kotaTanggal || "...................., ...................... 2026"}\nGuru Mata Pelajaran\n\n\n\n${
              identitas.penyusun
            }\nNIP. ${identitas.nipGuru || "..........................................."}`
          ),
        ],
      ],
      columnStyles: {
        0: { cellWidth: 92 },
        1: { cellWidth: 92 },
      },
    });
  }

  // =========================================================================
  // 3. LAMPIRAN 1 - 8 TERPADU
  // =========================================================================
  if (validLampiran.length > 0) {
    if (showModul) {
      cursor.newPage();
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C_PRIMARY);
    doc.text(`LAMPIRAN PERANGKAT AJAR (${validLampiran.length} LAMPIRAN TERPADU)`, PAGE_W / 2, cursor.y + 2, {
      align: "center",
    });
    cursor.y += 6.5;

    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C_INK);
    const lTitle = doc.splitTextToSize(cleanPdfText(identitas.judulModul), CONTENT_W) as string[];
    doc.text(lTitle, PAGE_W / 2, cursor.y, { align: "center" });
    cursor.y += lTitle.length * 5.2 + 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...C_MUTED);
    doc.text(
      cleanPdfText(`${identitas.jenjang} · ${identitas.mataPelajaran} · ${identitas.kelas} (${identitas.fase})`),
      PAGE_W / 2,
      cursor.y,
      { align: "center" }
    );
    cursor.y += 2.5;
    doc.setDrawColor(...C_INK);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, cursor.y, PAGE_W - MARGIN_X, cursor.y);
    cursor.y += 4;

    // Lampiran 1: Asesmen Diagnostik
    if (hasLampiran(1)) {
      cursor.sectionHeading("Lampiran 1: Asesmen Diagnostik", true);
      cursor.labelValue("Tujuan Pemetaan Awal:", lampiran.asesmenDiagnostik.tujuanDiagnostik);
      cursor.subHeading("A. Asesmen Diagnostik Non-Kognitif (Kesiapan & Gaya Belajar)");
      cursor.listItems(lampiran.asesmenDiagnostik.diagnostikNonKognitif, true);
      cursor.subHeading("B. Asesmen Diagnostik Kognitif (Pemetaan Prasyarat Materi)");
      cursor.runTable({
        head: [["No", "Pertanyaan Diagnostik", "Tujuan Pemetaan", "Tindak Lanjut Diferensiasi"]],
        body: lampiran.asesmenDiagnostik.diagnostikKognitif.map((item) => [
          String(item.nomor),
          cleanPdfText(item.pertanyaan),
          cleanPdfText(item.tujuanPemetaan),
          cleanPdfText(item.tindakLanjut),
        ]),
        columnStyles: {
          0: { cellWidth: 11, fontStyle: "bold", fillColor: C_SUBTLE_BG, halign: "center" },
          1: { cellWidth: 63, halign: "justify" },
          2: { cellWidth: 48, halign: "justify" },
          3: { cellWidth: 62, halign: "justify" },
        },
      });
    }

    // Lampiran 2: Penilaian Non Tes (Sikap)
    if (hasLampiran(2)) {
      cursor.sectionHeading("Lampiran 2: Penilaian Non Tes (Penilaian Sikap)", true);
      cursor.labelValue("Teknik & Instrumen:", lampiran.penilaianSikap.teknikPenilaian);
      cursor.labelValue("Skala Penilaian:", lampiran.penilaianSikap.skalaKeterangan);
      cursor.runTable({
        head: [["No", "Dimensi Profil Lulusan", "Indikator Sikap yang Diamati", "Kriteria Teramati (SB/B)"]],
        body: lampiran.penilaianSikap.aspekSikap.map((a, idx) => [
          String(idx + 1),
          cleanPdfText(a.dimensi),
          cleanPdfText(a.indikator),
          cleanPdfText(a.kriteriaTampak),
        ]),
        columnStyles: {
          0: { cellWidth: 11, fontStyle: "bold", fillColor: C_SUBTLE_BG, halign: "center" },
          1: { cellWidth: 42, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
          2: { cellWidth: 65, halign: "justify" },
          3: { cellWidth: 66, halign: "justify" },
        },
      });

      cursor.subHeading("Lembar Observasi Sikap Peserta Didik (Siap Cetak)");
      const aspekCols = lampiran.penilaianSikap.aspekSikap;
      const obsHead = [
        "No",
        "Nama Peserta Didik",
        ...aspekCols.map((a) => `${cleanPdfText(a.dimensi.split(" ")[0])} (SB/B/C/PB)`),
        "Catatan Guru",
      ];
      const obsRows = [1, 2, 3, 4, 5].map((n) => [
        String(n),
        ".............................................",
        ...aspekCols.map(() => ""),
        "",
      ]);
      cursor.runTable({
        head: [obsHead],
        body: obsRows,
        headStyles: {
          fillColor: C_HEAD_ALT,
          textColor: C_INK,
          fontStyle: "bold",
          lineColor: C_BORDER,
          lineWidth: 0.2,
          fontSize: 8.2,
        },
        styles: {
          font: "helvetica",
          fontSize: 8.2,
          cellPadding: 2.2,
          valign: "top",
          lineColor: C_BORDER,
          lineWidth: 0.2,
        },
      });
    }

    // Lampiran 3: Asesmen Formatif
    if (hasLampiran(3)) {
      cursor.sectionHeading("Lampiran 3: Asesmen Formatif", true);
      cursor.paragraphJustified(lampiran.asesmenFormatif.petunjukPengerjaan);
      cursor.runTable({
        head: [["No", "Indikator & Level", "Butir Pertanyaan", "Kunci / Kriteria Jawaban"]],
        body: lampiran.asesmenFormatif.daftarSoal.map((s) => [
          String(s.nomor),
          cleanPdfText(`${s.levelKognitif}\n${s.indikator}`),
          cleanPdfText(s.pertanyaan),
          cleanPdfText(s.kunciJawaban),
        ]),
        columnStyles: {
          0: { cellWidth: 11, fontStyle: "bold", fillColor: C_SUBTLE_BG, halign: "center" },
          1: { cellWidth: 45, halign: "justify" },
          2: { cellWidth: 64, halign: "justify" },
          3: { cellWidth: 64, halign: "justify" },
        },
      });
      cursor.runTable({
        showHead: "never",
        body: [
          [
            cleanPdfText(
              `Rumus Skor: ${lampiran.asesmenFormatif.pedomanPenskoran.rumusNilai}\nKriteria Ketuntasan: ${lampiran.asesmenFormatif.pedomanPenskoran.kriteriaKetuntasan}\nTindak Lanjut: ${lampiran.asesmenFormatif.pedomanPenskoran.catatanTindakLanjut}`
            ),
          ],
        ],
        styles: {
          fillColor: C_SUBTLE_BG,
          halign: "justify",
          fontSize: 8.8,
          cellPadding: 2.8,
          valign: "top",
          lineColor: C_BORDER,
          lineWidth: 0.2,
        },
      });
    }

    // Lampiran 4: Bahan Ajar
    if (hasLampiran(4)) {
      cursor.sectionHeading("Lampiran 4: Bahan Ajar", true);
      cursor.subHeading(lampiran.bahanAjar.judulBahanAjar);
      cursor.paragraphJustified(lampiran.bahanAjar.ringkasanMateri);
      cursor.subHeading("Poin Konsep Kunci");
      cursor.listItems(lampiran.bahanAjar.poinKonsepKunci, false);
      cursor.labelValue("Referensi Bahan Ajar:", lampiran.bahanAjar.sumberReferensiGuru);
    }

    // Lampiran 5: LKPD
    if (hasLampiran(5)) {
      cursor.sectionHeading("Lampiran 5: Lembar Kerja Peserta Didik (LKPD)", true);
      cursor.subHeading(lkpd.judulLkpd);
      cursor.runTable({
        showHead: "never",
        body: [
          ["Nama / Kelompok", "...................................................................................."],
          ["Kelas / Tanggal", cleanPdfText(`${identitas.kelas} / ..........................................`)],
        ],
        columnStyles: {
          0: { cellWidth: 45, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
          1: { cellWidth: 139, textColor: C_SLATE },
        },
      });

      cursor.subHeading("Tujuan Kegiatan");
      cursor.paragraphJustified(lkpd.tujuanLkpd);

      cursor.runTable({
        head: [
          [
            {
              content: "Petunjuk Belajar",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
            {
              content: "Alat, Bahan & Sumber",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
          ],
        ],
        body: [
          [
            lkpd.petunjukBelajar.map((p) => `• ${cleanPdfText(p)}`).join("\n"),
            lkpd.alatDanBahan.map((a) => `• ${cleanPdfText(a)}`).join("\n"),
          ],
        ],
        columnStyles: {
          0: { cellWidth: 92, halign: "justify" },
          1: { cellWidth: 92, halign: "justify" },
        },
      });

      lkpd.aktivitas.forEach((act) => {
        const qBlock = act.promptQuestions
          .map((q, qi) => {
            const dots = Array.from({ length: Math.max(2, act.answerLines) })
              .map(() => "....................................................................................................")
              .join("\n");
            return `${qi + 1}. ${cleanPdfText(q)}\n${dots}`;
          })
          .join("\n\n");

        cursor.runTable({
          head: [
            [
              {
                content: cleanPdfText(`Aktivitas ${act.stepNumber}: ${act.title}`),
                styles: { fillColor: C_SUBTLE_BG, textColor: C_INK, fontStyle: "bold" },
              },
            ],
          ],
          body: [[`${cleanPdfText(act.instruction)}\n\n${qBlock}`]],
          styles: {
            font: "helvetica",
            fontSize: 8.8,
            cellPadding: 2.8,
            valign: "top",
            halign: "justify",
            lineColor: C_BORDER,
            lineWidth: 0.2,
          },
        });
      });
    }

    // Lampiran 6: Lembar Refleksi & Umpan Balik
    if (hasLampiran(6)) {
      cursor.sectionHeading("Lampiran 6: Lembar Refleksi & Umpan Balik Peserta Didik", true);
      cursor.paragraphJustified(lampiran.refleksiDanUmpanBalik.petunjukPengisian);

      const leftText = lampiran.refleksiDanUmpanBalik.refleksiPesertaDidik
        .map(
          (q, idx) =>
            `${idx + 1}. ${cleanPdfText(q)}\n....................................................`
        )
        .join("\n\n");
      const rightText = lampiran.refleksiDanUmpanBalik.umpanBalikPesertaDidik
        .map(
          (q, idx) =>
            `${idx + 1}. ${cleanPdfText(q)}\n....................................................`
        )
        .join("\n\n");

      cursor.runTable({
        head: [
          [
            {
              content: "Refleksi Peserta Didik",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
            {
              content: "Umpan Balik Peserta Didik",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
          ],
        ],
        body: [[leftText, rightText]],
        columnStyles: {
          0: { cellWidth: 92, halign: "justify" },
          1: { cellWidth: 92, halign: "justify" },
        },
      });

      cursor.runTable({
        head: [
          [
            {
              content: "Rencana Tindak Lanjut Guru",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
          ],
        ],
        body: [
          [
            lampiran.refleksiDanUmpanBalik.tindakLanjutGuru
              .map((t) => `• ${cleanPdfText(t)}`)
              .join("\n"),
          ],
        ],
        styles: { halign: "justify" },
      });
    }

    // Lampiran 7: Media Ajar
    if (hasLampiran(7)) {
      cursor.sectionHeading("Lampiran 7: Media Ajar", true);
      cursor.runTable({
        head: [
          [
            {
              content: "Media Ajar Utama",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
            {
              content: "Alat & Bahan Pendukung",
              styles: { fillColor: C_SUBTLE_BG, textColor: C_PRIMARY, fontStyle: "bold" },
            },
          ],
        ],
        body: [
          [
            lampiran.mediaAjar.mediaUtama.map((m) => `• ${cleanPdfText(m)}`).join("\n"),
            lampiran.mediaAjar.alatDanBahanPendukung.map((a) => `• ${cleanPdfText(a)}`).join("\n"),
          ],
        ],
        columnStyles: {
          0: { cellWidth: 92, halign: "justify" },
          1: { cellWidth: 92, halign: "justify" },
        },
      });
      cursor.labelValue("Sumber Belajar Digital:", lampiran.mediaAjar.sumberDigital);
      cursor.labelValue("Panduan Penggunaan:", lampiran.mediaAjar.panduanPenggunaan);
    }

    // Lampiran 8: KKTP
    if (hasLampiran(8)) {
      cursor.sectionHeading("Lampiran 8: KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)", true);
      cursor.labelValue("Pendekatan KKTP:", lampiran.kktp.pendekatan);
      cursor.runTable({
        head: [["Kriteria", "Mahir (4)", "Cakap (3)", "Layak (2)", "Perlu Bimbingan (1)"]],
        body: lampiran.kktp.kriteriaKetuntasan.map((r) => [
          cleanPdfText(r.criterion),
          cleanPdfText(r.excellent),
          cleanPdfText(r.good),
          cleanPdfText(r.developing),
          cleanPdfText(r.needsSupport),
        ]),
        columnStyles: {
          0: { cellWidth: 32, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
          1: { cellWidth: 38, halign: "justify" },
          2: { cellWidth: 38, halign: "justify" },
          3: { cellWidth: 38, halign: "justify" },
          4: { cellWidth: 38, halign: "justify" },
        },
      });

      cursor.subHeading("Interval Nilai & Tindak Lanjut Ketercapaian");
      cursor.runTable({
        head: [["Rentang Nilai", "Predikat", "Interpretasi Penguasaan", "Tindak Lanjut Guru"]],
        body: lampiran.kktp.intervalNilai.map((iv) => [
          cleanPdfText(iv.rentang),
          cleanPdfText(iv.predikat),
          cleanPdfText(iv.interpretasi),
          cleanPdfText(iv.tindakLanjut),
        ]),
        headStyles: {
          fillColor: C_HEAD_ALT,
          textColor: C_INK,
          fontStyle: "bold",
          lineColor: C_BORDER,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 28, fontStyle: "bold", fillColor: C_SUBTLE_BG, textColor: C_INK },
          1: { cellWidth: 32, fontStyle: "bold", textColor: C_INK },
          2: { cellWidth: 62, halign: "justify" },
          3: { cellWidth: 62, halign: "justify" },
        },
      });
    }
  }

  // Stamp clean page numbers across pages (skipping cover page 1 if cover is enabled)
  const totalPages = doc.getNumberOfPages();
  const startPageForNumbers = includeCoverAndToc ? 2 : 1;
  for (let p = startPageForNumbers; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C_MUTED);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, PAGE_H - 9.5, PAGE_W - MARGIN_X, PAGE_H - 9.5);
    doc.text(cleanPdfText(`${identitas.judulModul} · ${identitas.sekolah}`), MARGIN_X, PAGE_H - 5.5);
    doc.text(`Halaman ${p} dari ${totalPages}`, PAGE_W - MARGIN_X, PAGE_H - 5.5, { align: "right" });
  }

  const safeTitle = identitas.judulModul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix =
    sectionView === "modul"
      ? "modul"
      : sectionView === "lampiran"
        ? "lampiran"
        : "lengkap";
  doc.save(`modul-ajar-${suffix}-${safeTitle || "guru-pintar"}.pdf`);
}
