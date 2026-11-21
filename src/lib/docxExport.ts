import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { DAFTAR_LAMPIRAN, type ModulAjar } from "../types/modul";
import { resolveLampiran } from "./lampiranHelper";

// Palet & Tipografi disamakan 1:1 dengan tampilan A4 ModulDocumentView
const COLOR_INK = "0F2922";
const COLOR_PRIMARY = "14533C";
const COLOR_TEXT = "1E293B";
const COLOR_MUTED = "64748B";
const COLOR_BORDER = "E2E8F0";
const COLOR_SUBTLE_BG = "F8FAFC";
const COLOR_TABLE_HEAD_BORDER = "0F2922";

const FONT_DISPLAY = "Georgia";
const FONT_BODY = "Calibri";

const A4_WIDTH_TWIPS = 11906; // 210mm
const A4_HEIGHT_TWIPS = 16838; // 297mm

const cardBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function makeCell(
  text: string,
  options?: {
    bold?: boolean;
    fill?: string;
    color?: string;
    widthPct?: number;
    borderColor?: string;
    size?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  }
) {
  const bColor = options?.borderColor ?? COLOR_BORDER;
  return new TableCell({
    width: options?.widthPct ? { size: options.widthPct, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.TOP,
    shading: options?.fill ? { type: ShadingType.CLEAR, fill: options.fill, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: bColor },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: bColor },
      left: { style: BorderStyle.SINGLE, size: 4, color: bColor },
      right: { style: BorderStyle.SINGLE, size: 4, color: bColor },
    },
    children: [
      new Paragraph({
        alignment: options?.align ?? AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 244 },
        children: [
          new TextRun({
            text,
            bold: options?.bold ?? false,
            color: options?.color ?? COLOR_TEXT,
            size: options?.size ?? 19,
            font: FONT_BODY,
          }),
        ],
      }),
    ],
  });
}

function sectionHeading(text: string, borderColor = COLOR_BORDER) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 110, after: 45 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 23,
        color: COLOR_INK,
        font: FONT_DISPLAY,
      }),
    ],
  });
}

function subHeading(text: string) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 65, after: 20 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 19,
        color: COLOR_PRIMARY,
        font: FONT_BODY,
      }),
    ],
  });
}

function bodyParagraph(text: string, after = 40) {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { before: 0, after, line: 248 },
    children: [
      new TextRun({
        text,
        size: 20,
        color: COLOR_TEXT,
        font: FONT_BODY,
      }),
    ],
  });
}

function labelValueParagraph(label: string, value: string) {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { before: 0, after: 35, line: 248 },
    children: [
      new TextRun({
        text: `${label} `,
        bold: true,
        size: 20,
        color: COLOR_INK,
        font: FONT_BODY,
      }),
      new TextRun({
        text: value,
        size: 20,
        color: COLOR_TEXT,
        font: FONT_BODY,
      }),
    ],
  });
}

function bulletItem(text: string, size = 20) {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    bullet: { level: 0 },
    indent: { left: 240, hanging: 180 },
    spacing: { before: 0, after: 25, line: 244 },
    children: [
      new TextRun({
        text,
        size,
        color: COLOR_TEXT,
        font: FONT_BODY,
      }),
    ],
  });
}

function numberedItem(num: number, text: string) {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { before: 0, after: 25, line: 244 },
    indent: { left: 240, hanging: 180 },
    children: [
      new TextRun({
        text: `${num}. `,
        size: 20,
        color: COLOR_TEXT,
        font: FONT_BODY,
      }),
      new TextRun({
        text,
        size: 20,
        color: COLOR_TEXT,
        font: FONT_BODY,
      }),
    ],
  });
}

function compactGap() {
  return new Paragraph({
    spacing: { before: 0, after: 0, line: 70 },
    children: [new TextRun({ text: "", size: 4 })],
  });
}

function dottedLine() {
  return new Paragraph({
    spacing: { before: 15, after: 60 },
    border: {
      bottom: { style: BorderStyle.DOTTED, size: 6, color: "CBD5E1" },
    },
    children: [new TextRun({ text: " ", size: 16 })],
  });
}

function makeInfoBoxCell(title: string, text: string, fill?: string) {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.TOP,
    shading: fill ? { type: ShadingType.CLEAR, fill, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    borders: cardBorders,
    children: [
      new Paragraph({
        keepNext: true,
        spacing: { before: 0, after: 30 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 18,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text,
            size: 18,
            color: COLOR_TEXT,
            font: FONT_BODY,
          }),
        ],
      }),
    ],
  });
}

function makeListBoxCell(title: string, items: string[], widthPct = 50) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    borders: cardBorders,
    children: [
      new Paragraph({
        keepNext: true,
        spacing: { before: 0, after: 35 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 18,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      }),
      ...items.map((item) => bulletItem(item, 18)),
    ],
  });
}

export async function exportModulToDocx(
  modul: ModulAjar,
  includedLampiran: number[] = [1, 2, 3, 4, 5, 6, 7, 8],
  options?: { includeCoverAndToc?: boolean }
): Promise<void> {
  const { identitas, identifikasi, desainPembelajaran, pengalamanBelajar, asesmen, lkpd } = modul;
  const lampiran = resolveLampiran(modul);
  const validLampiran = includedLampiran.filter((id) => id >= 1 && id <= 8);
  const hasLampiran = (id: number) => validLampiran.includes(id);
  const includeCoverAndToc = options?.includeCoverAndToc ?? true;

  // Halaman Sampul & Daftar Isi Modul Ajar Lengkap untuk Dijilid
  const coverAndTocBlocks: (Paragraph | Table)[] = [];
  if (includeCoverAndToc) {
    coverAndTocBlocks.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 50 },
        children: [
          new TextRun({
            text: "PERANGKAT PEMBELAJARAN KURIKULUM MERDEKA",
            bold: true,
            size: 24,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 140 },
        children: [
          new TextRun({
            text: "PENDEKATAN PEMBELAJARAN MENDALAM (DEEP LEARNING)",
            bold: true,
            size: 20,
            color: COLOR_MUTED,
            font: FONT_BODY,
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.TOP,
                shading: { type: ShadingType.CLEAR, fill: COLOR_SUBTLE_BG, color: "auto" },
                margins: { top: 180, bottom: 180, left: 200, right: 200 },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK },
                  bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK },
                  left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
                  right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 80 },
                    children: [
                      new TextRun({
                        text: "MODUL AJAR LENGKAP & LAMPIRAN PERANGKAT",
                        bold: true,
                        size: 22,
                        color: COLOR_PRIMARY,
                        font: FONT_BODY,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 100 },
                    children: [
                      new TextRun({
                        text: identitas.judulModul,
                        bold: true,
                        size: 34,
                        color: COLOR_INK,
                        font: FONT_DISPLAY,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 0 },
                    children: [
                      new TextRun({
                        text: `Mata Pelajaran: ${identitas.mataPelajaran}  ·  ${identitas.jenjang} (${identitas.fase} / ${identitas.kelas})`,
                        size: 21,
                        color: COLOR_TEXT,
                        font: FONT_BODY,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      compactGap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          ["Satuan Pendidikan", identitas.sekolah],
          ["Tahun Ajaran", identitas.tahunAjaran],
          ["Topik / Materi Pokok", identitas.topik],
          ["Alokasi Waktu", `${identitas.alokasiWaktu} (${identitas.jumlahPertemuan} Pertemuan)`],
          ["Model Pembelajaran", identitas.modelPembelajaran],
          ["Guru Penyusun", `${identitas.penyusun}${identitas.nipGuru ? ` (NIP. ${identitas.nipGuru})` : ""}`],
          [
            "Kepala Sekolah",
            `${identitas.namaKepalaSekolah || "........................................"}${
              identitas.nipKepalaSekolah ? ` (NIP. ${identitas.nipKepalaSekolah})` : ""
            }`,
          ],
        ].map(
          ([label, val]) =>
            new TableRow({
              cantSplit: true,
              children: [
                makeCell(label, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 35, size: 20 }),
                makeCell(val, { widthPct: 65, size: 20, align: AlignmentType.BOTH }),
              ],
            })
        ),
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 0 },
        children: [
          new TextRun({
            text: `${identitas.sekolah} · Tahun Ajaran ${identitas.tahunAjaran}`,
            bold: true,
            size: 20,
            color: COLOR_INK,
            font: FONT_BODY,
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Halaman Daftar Isi Lengkap untuk Dijilid
    const tocEntries: { kode: string; judul: string; ket: string }[] = [
      { kode: "Bagian I", judul: "Halaman Sampul / Identitas Penjilidan", ket: "Hal. i" },
      { kode: "Bagian II", judul: "Daftar Isi Modul Ajar Lengkap", ket: "Hal. ii" },
      { kode: "A", judul: "Identitas Modul Ajar", ket: "Modul Inti" },
      { kode: "B", judul: "Identifikasi Kesiapan Murid & Dimensi Profil Lulusan", ket: "Modul Inti" },
      { kode: "C", judul: "Desain Pembelajaran (CP, TP, Pemahaman Bermakna & Kerangka PM)", ket: "Modul Inti" },
      { kode: "D", judul: "Pengalaman Belajar (Memahami, Mengaplikasi, Merefleksi)", ket: "Modul Inti" },
      { kode: "E", judul: "Asesmen Pembelajaran (Awal, Formatif, Sumatif)", ket: "Modul Inti" },
      { kode: "F", judul: "Glosarium & Daftar Pustaka", ket: "Penutup Modul" },
      { kode: "TTD", judul: "Lembar Pengesahan Kepala Sekolah & Guru Mata Pelajaran", ket: "Pengesahan" },
    ];

    DAFTAR_LAMPIRAN.filter((item) => hasLampiran(item.id)).forEach((item) => {
      const colonIdx = item.title.indexOf(":");
      const kode = colonIdx > -1 ? item.title.slice(0, colonIdx) : `Lampiran ${item.id}`;
      const judul = colonIdx > -1 ? item.title.slice(colonIdx + 1).trim() : item.title;
      tocEntries.push({
        kode,
        judul,
        ket: "Lampiran Terpadu",
      });
    });

    coverAndTocBlocks.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: "DAFTAR ISI",
            bold: true,
            size: 28,
            color: COLOR_INK,
            font: FONT_DISPLAY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK },
        },
        children: [
          new TextRun({
            text: `Kelengkapan Berkas Penjilidan · ${identitas.judulModul}`,
            size: 19,
            color: COLOR_MUTED,
            font: FONT_BODY,
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("Bagian", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 18,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 19,
              }),
              makeCell("Uraian Komponen Modul Ajar & Lampiran", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 62,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 19,
              }),
              makeCell("Keterangan", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 20,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 19,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          ...tocEntries.map(
            (row) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(row.kode, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 18, size: 19 }),
                  makeCell(row.judul, { widthPct: 62, size: 19, align: AlignmentType.BOTH }),
                  makeCell(row.ket, { widthPct: 20, size: 18, color: COLOR_MUTED, align: AlignmentType.CENTER }),
                ],
              })
          ),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 100, after: 0 },
        children: [
          new TextRun({
            text: `Catatan Penjilidan: Berkas ini memuat 1 berkas Modul Ajar lengkap (Bagian A–F + Pengesahan) dan ${validLampiran.length} Lampiran terintegrasi siap cetak/jilid ukuran A4.`,
            italics: true,
            size: 18,
            color: COLOR_MUTED,
            font: FONT_BODY,
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Tabel A. Identitas Modul (2 kolom sesuai tampilan app)
  const identitasRows = [
    ["Nama Penyusun", identitas.penyusun],
    ["Satuan Pendidikan", identitas.sekolah],
    ["Tahun Ajaran", identitas.tahunAjaran],
    ["Jenjang / Fase / Kelas", `${identitas.jenjang} / ${identitas.fase} / ${identitas.kelas}`],
    ["Mata Pelajaran", identitas.mataPelajaran],
    ["Topik / Materi Pokok", identitas.topik],
    ["Alokasi Waktu", `${identitas.alokasiWaktu} (${identitas.jumlahPertemuan} Pertemuan)`],
    ["Model Pembelajaran", identitas.modelPembelajaran],
  ].map(
    ([label, value]) =>
      new TableRow({
        cantSplit: true,
        children: [
          makeCell(label, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 32, size: 19 }),
          makeCell(value, { widthPct: 68, size: 19, align: AlignmentType.BOTH }),
        ],
      })
  );

  // Grid 2x2 Kerangka Pembelajaran Mendalam
  const kerangkaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          makeInfoBoxCell("Praktik Pedagogis", desainPembelajaran.praktikPedagogis),
          makeInfoBoxCell("Kemitraan Pembelajaran", desainPembelajaran.kemitraanPembelajaran),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          makeInfoBoxCell("Lingkungan Belajar", desainPembelajaran.lingkunganBelajar),
          makeInfoBoxCell("Pemanfaatan Digital", desainPembelajaran.pemanfaatanDigital),
        ],
      }),
    ],
  });

  // Kartu Kegiatan Inti
  const kegiatanIntiBlocks: (Paragraph | Table)[] = [];
  pengalamanBelajar.kegiatanInti.forEach((step, idx) => {
    if (idx > 0) {
      kegiatanIntiBlocks.push(compactGap());
    }
    kegiatanIntiBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                columnSpan: 2,
                verticalAlign: VerticalAlign.TOP,
                margins: { top: 60, bottom: 55, left: 100, right: 100 },
                shading: { type: ShadingType.CLEAR, fill: COLOR_SUBTLE_BG, color: "auto" },
                borders: cardBorders,
                children: [
                  new Paragraph({
                    keepNext: true,
                    spacing: { before: 0, after: 0 },
                    children: [
                      new TextRun({
                        text: `Tahap ${idx + 1}: ${step.phase}`,
                        bold: true,
                        size: 20,
                        color: COLOR_INK,
                        font: FONT_BODY,
                      }),
                      new TextRun({
                        text: `   ·   Prinsip ${step.principle} · ${step.durationMinutes} menit`,
                        size: 18,
                        color: COLOR_MUTED,
                        font: FONT_BODY,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                margins: { top: 70, bottom: 70, left: 100, right: 100 },
                borders: cardBorders,
                children: [
                  new Paragraph({
                    keepNext: true,
                    spacing: { before: 0, after: 35 },
                    children: [
                      new TextRun({
                        text: "Aktivitas Guru",
                        bold: true,
                        size: 18,
                        color: "475569",
                        font: FONT_BODY,
                      }),
                    ],
                  }),
                  ...step.teacherActivities.map((a) => bulletItem(a, 19)),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                margins: { top: 70, bottom: 70, left: 100, right: 100 },
                borders: cardBorders,
                children: [
                  new Paragraph({
                    keepNext: true,
                    spacing: { before: 0, after: 35 },
                    children: [
                      new TextRun({
                        text: "Aktivitas Murid",
                        bold: true,
                        size: 18,
                        color: "475569",
                        font: FONT_BODY,
                      }),
                    ],
                  }),
                  ...step.studentActivities.map((a) => bulletItem(a, 19)),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  // Tabel Glosarium (Bagian F)
  const glosariumTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          makeCell("Istilah", {
            bold: true,
            fill: COLOR_INK,
            color: "FFFFFF",
            widthPct: 30,
            borderColor: COLOR_TABLE_HEAD_BORDER,
            size: 18,
          }),
          makeCell("Definisi", {
            bold: true,
            fill: COLOR_INK,
            color: "FFFFFF",
            widthPct: 70,
            borderColor: COLOR_TABLE_HEAD_BORDER,
            size: 18,
          }),
        ],
      }),
      ...lampiran.glosariumDanPustaka.glosarium.map(
        (g) =>
          new TableRow({
            cantSplit: true,
            children: [
              makeCell(g.istilah, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
              makeCell(g.definisi, { size: 18, align: AlignmentType.BOTH }),
            ],
          })
      ),
    ],
  });

  // Blok Pengesahan TTD Kepsek & Guru Mapel
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            borders: noBorders,
            margins: { top: 60, bottom: 0, left: 0, right: 120 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [new TextRun({ text: "Mengetahui,", size: 19, color: COLOR_TEXT, font: FONT_BODY })],
              }),
              new Paragraph({
                spacing: { before: 0, after: 520 },
                children: [
                  new TextRun({
                    text: "Kepala Sekolah",
                    bold: true,
                    size: 19,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text:
                      identitas.namaKepalaSekolah ||
                      "....................................................",
                    bold: true,
                    underline: {},
                    size: 19,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: `NIP. ${identitas.nipKepalaSekolah || "..........................................."}`,
                    size: 19,
                    color: COLOR_TEXT,
                    font: FONT_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            borders: noBorders,
            margins: { top: 60, bottom: 0, left: 120, right: 0 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text: identitas.kotaTanggal || "...................., ...................... 2026",
                    size: 19,
                    color: COLOR_TEXT,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 520 },
                children: [
                  new TextRun({
                    text: "Guru Mata Pelajaran",
                    bold: true,
                    size: 19,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text: identitas.penyusun,
                    bold: true,
                    underline: {},
                    size: 19,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: `NIP. ${identitas.nipGuru || "..........................................."}`,
                    size: 19,
                    color: COLOR_TEXT,
                    font: FONT_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Bagian 8 Lampiran Terintegrasi (1:1 dengan ModulDocumentView)
  const lampiranBlocks: (Paragraph | Table)[] = [];
  if (validLampiran.length > 0) {
    lampiranBlocks.push(new Paragraph({ children: [new PageBreak()] }));
    lampiranBlocks.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: `LAMPIRAN PERANGKAT AJAR (${validLampiran.length} LAMPIRAN TERPADU)`,
            bold: true,
            size: 18,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: identitas.judulModul,
            bold: true,
            size: 26,
            color: COLOR_INK,
            font: FONT_DISPLAY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 140 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK },
        },
        children: [
          new TextRun({
            text: `${identitas.jenjang} · ${identitas.mataPelajaran} · ${identitas.kelas} (${identitas.fase})`,
            size: 18,
            color: COLOR_MUTED,
            font: FONT_BODY,
          }),
        ],
      })
    );
  }

  // Lampiran 1: Asesmen Diagnostik
  if (hasLampiran(1)) {
    lampiranBlocks.push(sectionHeading("Lampiran 1: Asesmen Diagnostik", COLOR_INK));
    lampiranBlocks.push(
      labelValueParagraph("Tujuan Pemetaan Awal:", lampiran.asesmenDiagnostik.tujuanDiagnostik)
    );
    lampiranBlocks.push(subHeading("A. Asesmen Diagnostik Non-Kognitif (Kesiapan & Gaya Belajar)"));
    lampiran.asesmenDiagnostik.diagnostikNonKognitif.forEach((item, idx) =>
      lampiranBlocks.push(numberedItem(idx + 1, item))
    );
    lampiranBlocks.push(subHeading("B. Asesmen Diagnostik Kognitif (Pemetaan Prasyarat Materi)"));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("No", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 7,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Pertanyaan Diagnostik", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 35,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Tujuan Pemetaan", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 26,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Tindak Lanjut Diferensiasi", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 32,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
            ],
          }),
          ...lampiran.asesmenDiagnostik.diagnostikKognitif.map(
            (item) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(String(item.nomor), { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
                  makeCell(item.pertanyaan, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(item.tujuanPemetaan, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(item.tindakLanjut, { size: 18, align: AlignmentType.BOTH }),
                ],
              })
          ),
        ],
      })
    );
  }

  // Lampiran 2: Penilaian Non Tes (Penilaian Sikap)
  if (hasLampiran(2)) {
    lampiranBlocks.push(sectionHeading("Lampiran 2: Penilaian Non Tes (Penilaian Sikap)", COLOR_INK));
    lampiranBlocks.push(labelValueParagraph("Teknik & Instrumen:", lampiran.penilaianSikap.teknikPenilaian));
    lampiranBlocks.push(labelValueParagraph("Skala Penilaian:", lampiran.penilaianSikap.skalaKeterangan));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("No", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 7,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Dimensi Profil Lulusan", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 25,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Indikator Sikap yang Diamati", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 34,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Kriteria Teramati (SB/B)", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 34,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
            ],
          }),
          ...lampiran.penilaianSikap.aspekSikap.map(
            (aspek, idx) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(String(idx + 1), { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
                  makeCell(aspek.dimensi, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
                  makeCell(aspek.indikator, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(aspek.kriteriaTampak, { size: 18, align: AlignmentType.BOTH }),
                ],
              })
          ),
        ],
      })
    );

    lampiranBlocks.push(subHeading("Lembar Observasi Sikap Peserta Didik (Siap Cetak)"));
    const aspekCols = lampiran.penilaianSikap.aspekSikap;
    const colDimPct = aspekCols.length > 0 ? Math.floor(42 / aspekCols.length) : 14;
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("No", { bold: true, fill: "F1F5F9", color: COLOR_INK, widthPct: 6, size: 17 }),
              makeCell("Nama Peserta Didik", { bold: true, fill: "F1F5F9", color: COLOR_INK, widthPct: 30, size: 17 }),
              ...aspekCols.map((a) =>
                makeCell(`${a.dimensi.split(" ")[0]} (SB/B/C/PB)`, {
                  bold: true,
                  fill: "F1F5F9",
                  color: COLOR_INK,
                  widthPct: colDimPct,
                  size: 17,
                  align: AlignmentType.CENTER,
                })
              ),
              makeCell("Catatan Guru", { bold: true, fill: "F1F5F9", color: COLOR_INK, widthPct: 22, size: 17 }),
            ],
          }),
          ...[1, 2, 3, 4, 5].map(
            (n) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(String(n), { size: 17, align: AlignmentType.CENTER }),
                  makeCell(".............................................", { color: "94A3B8", size: 17 }),
                  ...aspekCols.map(() => makeCell(" ", { size: 17 })),
                  makeCell(" ", { size: 17 }),
                ],
              })
          ),
        ],
      })
    );
  }

  // Lampiran 3: Asesmen Formatif
  if (hasLampiran(3)) {
    lampiranBlocks.push(sectionHeading("Lampiran 3: Asesmen Formatif", COLOR_INK));
    lampiranBlocks.push(bodyParagraph(lampiran.asesmenFormatif.petunjukPengerjaan));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("No", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 7,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Indikator & Level", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 25,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Butir Pertanyaan", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 34,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Kunci / Kriteria Jawaban", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 34,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
            ],
          }),
          ...lampiran.asesmenFormatif.daftarSoal.map(
            (s) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(String(s.nomor), { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
                  new TableCell({
                    verticalAlign: VerticalAlign.TOP,
                    margins: { top: 60, bottom: 60, left: 100, right: 100 },
                    borders: cardBorders,
                    children: [
                      new Paragraph({
                        spacing: { before: 0, after: 20 },
                        children: [
                          new TextRun({
                            text: s.levelKognitif,
                            bold: true,
                            size: 18,
                            color: COLOR_INK,
                            font: FONT_BODY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.BOTH,
                        spacing: { before: 0, after: 0, line: 240 },
                        children: [
                          new TextRun({
                            text: s.indikator,
                            size: 18,
                            color: "334155",
                            font: FONT_BODY,
                          }),
                        ],
                      }),
                    ],
                  }),
                  makeCell(s.pertanyaan, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(s.kunciJawaban, { size: 18, align: AlignmentType.BOTH }),
                ],
              })
          ),
        ],
      })
    );
    lampiranBlocks.push(compactGap());
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                shading: { type: ShadingType.CLEAR, fill: COLOR_SUBTLE_BG, color: "auto" },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                borders: cardBorders,
                children: [
                  labelValueParagraph("Rumus Skor:", lampiran.asesmenFormatif.pedomanPenskoran.rumusNilai),
                  labelValueParagraph(
                    "Kriteria Ketuntasan:",
                    lampiran.asesmenFormatif.pedomanPenskoran.kriteriaKetuntasan
                  ),
                  labelValueParagraph(
                    "Tindak Lanjut:",
                    lampiran.asesmenFormatif.pedomanPenskoran.catatanTindakLanjut
                  ),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Lampiran 4: Bahan Ajar
  if (hasLampiran(4)) {
    lampiranBlocks.push(sectionHeading("Lampiran 4: Bahan Ajar", COLOR_INK));
    lampiranBlocks.push(subHeading(lampiran.bahanAjar.judulBahanAjar));
    lampiranBlocks.push(bodyParagraph(lampiran.bahanAjar.ringkasanMateri));
    lampiranBlocks.push(subHeading("Poin Konsep Kunci"));
    lampiran.bahanAjar.poinKonsepKunci.forEach((p) => lampiranBlocks.push(bulletItem(p)));
    lampiranBlocks.push(labelValueParagraph("Referensi Bahan Ajar:", lampiran.bahanAjar.sumberReferensiGuru));
  }

  // Lampiran 5: Lembar Kerja Peserta Didik (LKPD)
  if (hasLampiran(5)) {
    lampiranBlocks.push(sectionHeading("Lampiran 5: Lembar Kerja Peserta Didik (LKPD)", COLOR_INK));
    lampiranBlocks.push(subHeading(lkpd.judulLkpd));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              makeCell("Nama / Kelompok", { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 32, size: 18 }),
              makeCell("....................................................................................", {
                color: "94A3B8",
                widthPct: 68,
                size: 18,
              }),
            ],
          }),
          new TableRow({
            cantSplit: true,
            children: [
              makeCell("Kelas / Tanggal", { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 32, size: 18 }),
              makeCell(`${identitas.kelas} / ..........................................`, {
                color: "475569",
                widthPct: 68,
                size: 18,
              }),
            ],
          }),
        ],
      })
    );
    lampiranBlocks.push(subHeading("Tujuan Kegiatan"));
    lampiranBlocks.push(bodyParagraph(lkpd.tujuanLkpd));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              makeListBoxCell("Petunjuk Belajar", lkpd.petunjukBelajar, 50),
              makeListBoxCell("Alat, Bahan & Sumber", lkpd.alatDanBahan, 50),
            ],
          }),
        ],
      })
    );

    lkpd.aktivitas.forEach((act) => {
      const actChildren: Paragraph[] = [
        new Paragraph({
          keepNext: true,
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: `Aktivitas ${act.stepNumber}: ${act.title}`,
              bold: true,
              size: 20,
              color: COLOR_INK,
              font: FONT_BODY,
            }),
          ],
        }),
        bodyParagraph(act.instruction, 60),
      ];

      act.promptQuestions.forEach((q, i) => {
        actChildren.push(
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { before: 30, after: 30, line: 252 },
            children: [
              new TextRun({
                text: `${i + 1}. ${q}`,
                bold: true,
                size: 19,
                color: COLOR_INK,
                font: FONT_BODY,
              }),
            ],
          })
        );
        for (let line = 0; line < Math.max(2, act.answerLines); line++) {
          actChildren.push(dottedLine());
        }
      });

      lampiranBlocks.push(compactGap());
      lampiranBlocks.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.TOP,
                  margins: { top: 70, bottom: 70, left: 100, right: 100 },
                  borders: cardBorders,
                  children: actChildren,
                }),
              ],
            }),
          ],
        })
      );
    });
  }

  // Lampiran 6: Lembar Refleksi & Umpan Balik Peserta Didik
  if (hasLampiran(6)) {
    lampiranBlocks.push(sectionHeading("Lampiran 6: Lembar Refleksi & Umpan Balik Peserta Didik", COLOR_INK));
    lampiranBlocks.push(bodyParagraph(lampiran.refleksiDanUmpanBalik.petunjukPengisian));

    const refleksiChildren: Paragraph[] = [
      new Paragraph({
        keepNext: true,
        spacing: { before: 0, after: 50 },
        children: [
          new TextRun({
            text: "Refleksi Peserta Didik",
            bold: true,
            size: 18,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      }),
    ];
    lampiran.refleksiDanUmpanBalik.refleksiPesertaDidik.forEach((q, idx) => {
      refleksiChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { before: 20, after: 20, line: 240 },
          children: [new TextRun({ text: `${idx + 1}. ${q}`, size: 18, color: COLOR_TEXT, font: FONT_BODY })],
        })
      );
      refleksiChildren.push(dottedLine());
    });

    const umpanBalikChildren: Paragraph[] = [
      new Paragraph({
        keepNext: true,
        spacing: { before: 0, after: 50 },
        children: [
          new TextRun({
            text: "Umpan Balik Peserta Didik",
            bold: true,
            size: 18,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      }),
    ];
    lampiran.refleksiDanUmpanBalik.umpanBalikPesertaDidik.forEach((q, idx) => {
      umpanBalikChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { before: 20, after: 20, line: 240 },
          children: [new TextRun({ text: `${idx + 1}. ${q}`, size: 18, color: COLOR_TEXT, font: FONT_BODY })],
        })
      );
      umpanBalikChildren.push(dottedLine());
    });

    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                margins: { top: 70, bottom: 70, left: 100, right: 100 },
                borders: cardBorders,
                children: refleksiChildren,
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                margins: { top: 70, bottom: 70, left: 100, right: 100 },
                borders: cardBorders,
                children: umpanBalikChildren,
              }),
            ],
          }),
        ],
      })
    );

    lampiranBlocks.push(compactGap());
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              makeListBoxCell("Rencana Tindak Lanjut Guru", lampiran.refleksiDanUmpanBalik.tindakLanjutGuru, 100),
            ],
          }),
        ],
      })
    );
  }

  // Lampiran 7: Media Ajar
  if (hasLampiran(7)) {
    lampiranBlocks.push(sectionHeading("Lampiran 7: Media Ajar", COLOR_INK));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              makeListBoxCell("Media Ajar Utama", lampiran.mediaAjar.mediaUtama, 50),
              makeListBoxCell("Alat & Bahan Pendukung", lampiran.mediaAjar.alatDanBahanPendukung, 50),
            ],
          }),
        ],
      })
    );
    lampiranBlocks.push(compactGap());
    lampiranBlocks.push(labelValueParagraph("Sumber Belajar Digital:", lampiran.mediaAjar.sumberDigital));
    lampiranBlocks.push(labelValueParagraph("Panduan Penggunaan:", lampiran.mediaAjar.panduanPenggunaan));
  }

  // Lampiran 8: KKTP
  if (hasLampiran(8)) {
    lampiranBlocks.push(
      sectionHeading("Lampiran 8: KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)", COLOR_INK)
    );
    lampiranBlocks.push(labelValueParagraph("Pendekatan KKTP:", lampiran.kktp.pendekatan));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("Kriteria", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 20,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Mahir (4)", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 20,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Cakap (3)", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 20,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Layak (2)", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 20,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
              makeCell("Perlu Bimbingan (1)", {
                bold: true,
                fill: COLOR_INK,
                color: "FFFFFF",
                widthPct: 20,
                borderColor: COLOR_TABLE_HEAD_BORDER,
                size: 18,
              }),
            ],
          }),
          ...lampiran.kktp.kriteriaKetuntasan.map(
            (r) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(r.criterion, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
                  makeCell(r.excellent, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(r.good, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(r.developing, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(r.needsSupport, { size: 18, align: AlignmentType.BOTH }),
                ],
              })
          ),
        ],
      })
    );

    lampiranBlocks.push(subHeading("Interval Nilai & Tindak Lanjut Ketercapaian"));
    lampiranBlocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              makeCell("Rentang Nilai", { bold: true, fill: "F1F5F9", color: COLOR_INK, widthPct: 16, size: 18 }),
              makeCell("Predikat", { bold: true, fill: "F1F5F9", color: COLOR_INK, widthPct: 18, size: 18 }),
              makeCell("Interpretasi Penguasaan", {
                bold: true,
                fill: "F1F5F9",
                color: COLOR_INK,
                widthPct: 33,
                size: 18,
              }),
              makeCell("Tindak Lanjut Guru", { bold: true, fill: "F1F5F9", color: COLOR_INK, widthPct: 33, size: 18 }),
            ],
          }),
          ...lampiran.kktp.intervalNilai.map(
            (iv) =>
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell(iv.rentang, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, size: 18 }),
                  makeCell(iv.predikat, { bold: true, color: COLOR_INK, size: 18 }),
                  makeCell(iv.interpretasi, { size: 18, align: AlignmentType.BOTH }),
                  makeCell(iv.tindakLanjut, { size: 18, align: AlignmentType.BOTH }),
                ],
              })
          ),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH_TWIPS, height: A4_HEIGHT_TWIPS },
            margin: { top: 480, right: 760, bottom: 480, left: 760 },
          },
        },
        children: [
          ...coverAndTocBlocks,

          // Header Dokumen (sama persis header ModulDocumentView)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 30 },
            children: [
              new TextRun({
                text: "MODUL AJAR KURIKULUM MERDEKA · PENDEKATAN PEMBELAJARAN MENDALAM",
                bold: true,
                size: 18,
                color: COLOR_PRIMARY,
                font: FONT_BODY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 30 },
            children: [
              new TextRun({
                text: identitas.judulModul,
                bold: true,
                size: 30,
                color: COLOR_INK,
                font: FONT_DISPLAY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK },
            },
            children: [
              new TextRun({
                text: `${identitas.jenjang} · ${identitas.fase} · ${identitas.kelas} · ${identitas.mataPelajaran} · ${identitas.alokasiWaktu}`,
                size: 18,
                color: COLOR_MUTED,
                font: FONT_BODY,
              }),
            ],
          }),

          // A. Identitas Modul
          sectionHeading("A. Identitas Modul"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: identitasRows,
          }),

          // B. Identifikasi
          sectionHeading("B. Identifikasi Kesiapan & Dimensi Profil Lulusan"),
          subHeading("Kesiapan Belajar Murid"),
          bodyParagraph(identifikasi.kesiapanMurid),
          subHeading("Karakteristik Materi"),
          bodyParagraph(identifikasi.karakteristikMateri),
          subHeading("Dimensi Profil Lulusan"),
          bodyParagraph(identifikasi.dimensiProfilLulusan.join(" · ")),

          // C. Desain Pembelajaran
          sectionHeading("C. Desain Pembelajaran"),
          subHeading("Capaian Pembelajaran (CP)"),
          bodyParagraph(desainPembelajaran.capaianPembelajaran),
          subHeading("Tujuan Pembelajaran (TP)"),
          ...desainPembelajaran.tujuanPembelajaran.map((tp, idx) => numberedItem(idx + 1, tp)),
          compactGap(),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  makeInfoBoxCell("Pemahaman Bermakna", desainPembelajaran.pemahamanBermakna, COLOR_SUBTLE_BG),
                ],
              }),
            ],
          }),
          subHeading("Pertanyaan Pemantik"),
          ...desainPembelajaran.pertanyaanPemantik.map((q) => bulletItem(q)),
          compactGap(),
          kerangkaTable,

          // D. Pengalaman Belajar
          sectionHeading("D. Pengalaman Belajar (Langkah Pembelajaran Mendalam)"),
          subHeading("1. Kegiatan Awal"),
          ...pengalamanBelajar.kegiatanAwal.map((item) => bulletItem(item)),
          subHeading("2. Kegiatan Inti"),
          ...kegiatanIntiBlocks,
          subHeading("3. Kegiatan Penutup"),
          ...pengalamanBelajar.kegiatanPenutup.map((item) => bulletItem(item)),

          // E. Asesmen Pembelajaran
          sectionHeading("E. Asesmen Pembelajaran"),
          labelValueParagraph("Asesmen Awal:", asesmen.asesmenAwal),
          labelValueParagraph("Asesmen Formatif:", asesmen.asesmenFormatif),
          labelValueParagraph("Asesmen Sumatif:", asesmen.asesmenSumatif),

          // F. Glosarium & Daftar Pustaka
          sectionHeading("F. Glosarium & Daftar Pustaka"),
          glosariumTable,
          subHeading("Daftar Pustaka"),
          ...lampiran.glosariumDanPustaka.daftarPustaka.map((d) => bulletItem(d, 18)),

          // Pengesahan TTD Kepala Sekolah & Guru Mata Pelajaran
          new Paragraph({
            spacing: { before: 100, after: 0 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            },
            children: [],
          }),
          signatureTable,

          ...lampiranBlocks,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTitle = identitas.judulModul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  a.href = url;
  a.download = `modul-ajar-lengkap-${safeTitle || "guru-pintar"}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
