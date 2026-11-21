import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
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

const COLOR_INK = "0F2922";
const COLOR_PRIMARY = "14533C";
const COLOR_GOLD = "CA8A04";
const COLOR_TEXT = "1E293B";
const COLOR_MUTED = "64748B";
const COLOR_BORDER = "E2E8F0";
const COLOR_SUBTLE_BG = "F8FAFC";

const FONT_DISPLAY = "Georgia";
const FONT_BODY = "Calibri";

const A4_WIDTH_TWIPS = 11906;
const A4_HEIGHT_TWIPS = 16838;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(headers: string[], rows: (string | number)[][], filename: string) {
  const escape = (val: string | number) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

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
    shading: options?.fill ? { type: ShadingType.CLEAR, fill: options.fill, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: bColor },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: bColor },
      left: { style: BorderStyle.SINGLE, size: 4, color: bColor },
      right: { style: BorderStyle.SINGLE, size: 4, color: bColor },
    },
    children: [
      new Paragraph({
        alignment: options?.align ?? AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text,
            bold: options?.bold ?? false,
            color: options?.color ?? COLOR_TEXT,
            size: options?.size ?? 18,
            font: FONT_BODY,
          }),
        ],
      }),
    ],
  });
}

function buildSignatureBlock(meta: AkademikSignatureMeta): Table {
  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 140, bottom: 0, left: 0, right: 100 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [new TextRun({ text: "Mengetahui,", size: 18, color: COLOR_TEXT, font: FONT_BODY })],
              }),
              new Paragraph({
                spacing: { before: 0, after: 580 },
                children: [
                  new TextRun({ text: "Kepala Sekolah", bold: true, size: 18, color: COLOR_INK, font: FONT_BODY }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text: meta.namaKepalaSekolah || "....................................................",
                    bold: true,
                    underline: {},
                    size: 18,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: `NIP. ${meta.nipKepalaSekolah || "..........................................."}`,
                    size: 18,
                    color: COLOR_TEXT,
                    font: FONT_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 140, bottom: 0, left: 100, right: 0 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text: meta.kotaTanggal || "...................., ...................... 2026",
                    size: 18,
                    color: COLOR_TEXT,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 580 },
                children: [
                  new TextRun({
                    text: "Guru Mata Pelajaran",
                    bold: true,
                    size: 18,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text: meta.penyusun || "....................................................",
                    bold: true,
                    underline: {},
                    size: 18,
                    color: COLOR_INK,
                    font: FONT_BODY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: `NIP. ${meta.nipGuru || "..........................................."}`,
                    size: 18,
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
}

function decodeDataUrlToBytes(dataUrl: string): { bytes: Uint8Array; type: "png" | "jpg" } | null {
  try {
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
    if (!match) return null;
    const ext = match[1].toLowerCase() === "png" ? "png" : "jpg";
    const bin = atob(match[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return { bytes, type: ext };
  } catch {
    return null;
  }
}

export async function exportCoverToDocx(cover: CoverPerangkatConfig): Promise<void> {
  const frameColor =
    cover.tema === "zamrud-emas"
      ? COLOR_INK
      : cover.tema === "bingkai-akademik"
        ? COLOR_PRIMARY
        : "0F172A";
  const accentColor = cover.tema === "zamrud-emas" ? COLOR_GOLD : COLOR_PRIMARY;

  const childrenInsideFrame: (Paragraph | Table)[] = [];

  // Instansi Atas
  childrenInsideFrame.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 30 },
      children: [
        new TextRun({
          text: cover.instansiAtas.toUpperCase(),
          bold: true,
          size: 22,
          color: COLOR_INK,
          font: FONT_BODY,
        }),
      ],
    })
  );
  if (cover.subInstansi.trim()) {
    childrenInsideFrame.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: cover.subInstansi.toUpperCase(),
            bold: true,
            size: 20,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      })
    );
  }
  childrenInsideFrame.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: cover.namaSekolah.toUpperCase(),
          bold: true,
          size: 28,
          color: COLOR_INK,
          font: FONT_DISPLAY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 220 },
      border: { bottom: { style: BorderStyle.DOUBLE, size: 12, color: accentColor } },
      children: [
        new TextRun({
          text: cover.alamatSekolah,
          size: 18,
          color: COLOR_MUTED,
          font: FONT_BODY,
        }),
      ],
    })
  );

  // Logo Sekolah (Unggahan custom atau label emblem)
  const decoded = cover.customLogoDataUrl ? decodeDataUrlToBytes(cover.customLogoDataUrl) : null;
  if (decoded) {
    childrenInsideFrame.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 180 },
        children: [
          new ImageRun({
            data: decoded.bytes,
            transformation: { width: 108, height: 108 },
            type: decoded.type,
          }),
        ],
      })
    );
  } else if (cover.logoPreset !== "tanpa-logo") {
    const presetLabel =
      cover.logoPreset === "tut-wuri"
        ? "[ TUT WURI HANDAYANI ]"
        : cover.logoPreset === "garuda-perisai"
          ? "[ LAMBANG PENDIDIKAN NASIONAL ]"
          : "[ KURIKULUM MERDEKA · PEMBELAJARAN MENDALAM ]";
    childrenInsideFrame.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: presetLabel,
            bold: true,
            size: 20,
            color: accentColor,
            font: FONT_BODY,
          }),
        ],
      })
    );
  }

  // Judul Utama Cover
  childrenInsideFrame.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({
          text: cover.judulUtama.toUpperCase(),
          bold: true,
          size: 40,
          color: COLOR_INK,
          font: FONT_DISPLAY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 220 },
      children: [
        new TextRun({
          text: cover.subJudul,
          bold: true,
          size: 21,
          color: COLOR_PRIMARY,
          font: FONT_BODY,
        }),
      ],
    })
  );

  // Tabel Identitas Utama di Tengah Cover
  childrenInsideFrame.push(
    new Table({
      width: { size: 90, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: [
        ["Mata Pelajaran", cover.mataPelajaran],
        ["Jenjang / Fase / Kelas", cover.jenjangFaseKelas],
        ["Semester", cover.semester],
        ["Tahun Ajaran", cover.tahunAjaran],
      ].map(
        ([k, v]) =>
          new TableRow({
            cantSplit: true,
            children: [
              makeCell(k, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 38, size: 20 }),
              makeCell(v, { bold: true, color: COLOR_INK, widthPct: 62, size: 20 }),
            ],
          })
      ),
    })
  );

  // Daftar Kelengkapan Berkas di Cover
  if (cover.daftarBerkas.length > 0) {
    childrenInsideFrame.push(
      new Paragraph({
        spacing: { before: 220, after: 60 },
        indent: { left: 450 },
        children: [
          new TextRun({
            text: "KELENGKAPAN BERKAS:",
            bold: true,
            size: 19,
            color: COLOR_PRIMARY,
            font: FONT_BODY,
          }),
        ],
      })
    );
    cover.daftarBerkas.forEach((item, idx) => {
      childrenInsideFrame.push(
        new Paragraph({
          spacing: { before: 0, after: 30 },
          indent: { left: 550 },
          children: [
            new TextRun({
              text: `${idx + 1}. ${item}`,
              size: 19,
              color: COLOR_TEXT,
              font: FONT_BODY,
            }),
          ],
        })
      );
    });
  }

  // Bagian Penyusun & Kepala Sekolah di Bawah Cover
  childrenInsideFrame.push(
    new Paragraph({ spacing: { before: 220, after: 0 } }),
    buildSignatureBlock({
      sekolah: cover.namaSekolah,
      penyusun: cover.namaGuru,
      nipGuru: cover.nipGuru,
      namaKepalaSekolah: cover.namaKepalaSekolah,
      nipKepalaSekolah: cover.nipKepalaSekolah,
      kotaTanggal: cover.kotaTahun,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 260, after: 60 },
      children: [
        new TextRun({
          text: `${cover.namaSekolah.toUpperCase()} · TAHUN AJARAN ${cover.tahunAjaran}`,
          bold: true,
          size: 19,
          color: COLOR_INK,
          font: FONT_BODY,
        }),
      ],
    })
  );

  const frameTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { top: 240, bottom: 240, left: 260, right: 260 },
            borders: {
              top: { style: BorderStyle.DOUBLE, size: 18, color: frameColor },
              bottom: { style: BorderStyle.DOUBLE, size: 18, color: frameColor },
              left: { style: BorderStyle.DOUBLE, size: 18, color: frameColor },
              right: { style: BorderStyle.DOUBLE, size: 18, color: frameColor },
            },
            children: childrenInsideFrame,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH_TWIPS, height: A4_HEIGHT_TWIPS },
            margin: { top: 680, right: 680, bottom: 680, left: 680 },
          },
        },
        children: [frameTable],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `cover-perangkat-ajar-${cover.tahunAjaran.replace("/", "-")}.docx`);
}

export async function exportKaldikToDocx(
  kaldik: KaldikYearSummary,
  meta: AkademikSignatureMeta
): Promise<void> {
  const rows = kaldik.months.map(
    (m, i) =>
      new TableRow({
        cantSplit: true,
        children: [
          makeCell(String(i + 1), { fill: COLOR_SUBTLE_BG, bold: true, align: AlignmentType.CENTER, widthPct: 6 }),
          makeCell(`${m.monthName} ${m.year}`, { bold: true, widthPct: 18 }),
          makeCell(`Smt ${m.semester}`, { align: AlignmentType.CENTER, widthPct: 9 }),
          makeCell(String(m.totalWeeks), { align: AlignmentType.CENTER, widthPct: 9 }),
          makeCell(String(m.effectiveWeeks), { bold: true, color: COLOR_PRIMARY, align: AlignmentType.CENTER, widthPct: 10 }),
          makeCell(String(m.nonEffectiveWeeks), { align: AlignmentType.CENTER, widthPct: 10 }),
          makeCell(String(m.effectiveDays), { bold: true, align: AlignmentType.CENTER, widthPct: 10 }),
          makeCell(
            m.agendaList.length
              ? m.agendaList.map((a) => `${a.day}: ${a.label}`).slice(0, 3).join("; ")
              : "Kegiatan belajar efektif reguler",
            { widthPct: 28, size: 17 }
          ),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH_TWIPS, height: A4_HEIGHT_TWIPS },
            margin: { top: 680, right: 794, bottom: 680, left: 794 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: `KALENDER PENDIDIKAN & RINCIAN MINGGU EFEKTIF · TAHUN AJARAN ${kaldik.tahunAjaran}`,
                bold: true,
                size: 24,
                color: COLOR_INK,
                font: FONT_DISPLAY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK } },
            children: [
              new TextRun({
                text: `${meta.sekolah} · Pola ${kaldik.hariSekolah} Hari Sekolah · Total ${kaldik.totalEffectiveWeeks} Minggu Efektif (${kaldik.totalEffectiveDays} Hari Belajar Efektif)`,
                size: 18,
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
                  makeCell("No", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 6 }),
                  makeCell("Bulan / Tahun", { bold: true, fill: COLOR_INK, color: "FFFFFF", widthPct: 18 }),
                  makeCell("Smt", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 9 }),
                  makeCell("Jml Pekan", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 9 }),
                  makeCell("Pekan Efektif", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 10 }),
                  makeCell("Tdk Efektif", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 10 }),
                  makeCell("Hari Efektif", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 10 }),
                  makeCell("Agenda & Hari Libur", { bold: true, fill: COLOR_INK, color: "FFFFFF", widthPct: 28 }),
                ],
              }),
              ...rows,
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell("", { fill: COLOR_SUBTLE_BG, widthPct: 6 }),
                  makeCell("TOTAL TAHUN AJARAN", { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 18 }),
                  makeCell("1 & 2", { bold: true, fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, widthPct: 9 }),
                  makeCell(
                    String(kaldik.months.reduce((s, m) => s + m.totalWeeks, 0)),
                    { bold: true, fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, widthPct: 9 }
                  ),
                  makeCell(String(kaldik.totalEffectiveWeeks), {
                    bold: true,
                    fill: COLOR_SUBTLE_BG,
                    color: COLOR_PRIMARY,
                    align: AlignmentType.CENTER,
                    widthPct: 10,
                  }),
                  makeCell(
                    String(kaldik.semester1.nonEffectiveWeeks + kaldik.semester2.nonEffectiveWeeks),
                    { bold: true, fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, widthPct: 10 }
                  ),
                  makeCell(String(kaldik.totalEffectiveDays), {
                    bold: true,
                    fill: COLOR_SUBTLE_BG,
                    color: COLOR_PRIMARY,
                    align: AlignmentType.CENTER,
                    widthPct: 10,
                  }),
                  makeCell(
                    `Ganjil: ${kaldik.semester1.effectiveWeeks} ME · Genap: ${kaldik.semester2.effectiveWeeks} ME`,
                    { bold: true, fill: COLOR_SUBTLE_BG, widthPct: 28 }
                  ),
                ],
              }),
            ],
          }),
          buildSignatureBlock(meta),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `kaldik-${kaldik.tahunAjaran.replace("/", "-")}.docx`);
}

export async function exportProtaToDocx(
  prota: ProtaDocument,
  kaldik: KaldikYearSummary,
  meta: AkademikSignatureMeta
): Promise<void> {
  const totalJp = prota.rows.reduce((s, r) => s + r.alokasiJp, 0);
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH_TWIPS, height: A4_HEIGHT_TWIPS },
            margin: { top: 680, right: 794, bottom: 680, left: 794 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: "PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA",
                bold: true,
                size: 24,
                color: COLOR_INK,
                font: FONT_DISPLAY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK } },
            children: [
              new TextRun({
                text: `${meta.sekolah} · ${prota.mataPelajaran} · ${prota.jenjang} (${prota.fase} / ${prota.kelas}) · Tahun Ajaran ${prota.tahunAjaran}`,
                size: 18,
                color: COLOR_MUTED,
                font: FONT_BODY,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            children: [
              new TextRun({
                text: `Basis Perhitungan Kaldik: ${kaldik.totalEffectiveWeeks} Minggu Efektif (Ganjil ${kaldik.semester1.effectiveWeeks} ME + Genap ${kaldik.semester2.effectiveWeeks} ME) × ${prota.jpPerMinggu} JP/Minggu = ${totalJp} JP Total.`,
                size: 18,
                color: COLOR_TEXT,
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
                  makeCell("No", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 6 }),
                  makeCell("Smt", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 8 }),
                  makeCell("Elemen / Lingkup", { bold: true, fill: COLOR_INK, color: "FFFFFF", widthPct: 18 }),
                  makeCell("Topik / Materi Pokok Kurikulum Merdeka", { bold: true, fill: COLOR_INK, color: "FFFFFF", widthPct: 38 }),
                  makeCell("Alokasi JP", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 10 }),
                  makeCell("Keterangan", { bold: true, fill: COLOR_INK, color: "FFFFFF", widthPct: 20 }),
                ],
              }),
              ...prota.rows.map(
                (r, idx) =>
                  new TableRow({
                    cantSplit: true,
                    children: [
                      makeCell(String(idx + 1), { fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, widthPct: 6 }),
                      makeCell(`Smt ${r.semester}`, { align: AlignmentType.CENTER, widthPct: 8 }),
                      makeCell(r.elemen, { widthPct: 18 }),
                      makeCell(r.materiPokok, { bold: true, color: COLOR_INK, widthPct: 38 }),
                      makeCell(`${r.alokasiJp} JP`, { bold: true, color: COLOR_PRIMARY, align: AlignmentType.CENTER, widthPct: 10 }),
                      makeCell(r.keterangan, { widthPct: 20 }),
                    ],
                  })
              ),
              new TableRow({
                cantSplit: true,
                children: [
                  makeCell("", { fill: COLOR_SUBTLE_BG, widthPct: 6 }),
                  makeCell("", { fill: COLOR_SUBTLE_BG, widthPct: 8 }),
                  makeCell("", { fill: COLOR_SUBTLE_BG, widthPct: 18 }),
                  makeCell("TOTAL ALOKASI JAM PELAJARAN SETAHUN", { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_INK, widthPct: 38 }),
                  makeCell(`${totalJp} JP`, { bold: true, fill: COLOR_SUBTLE_BG, color: COLOR_PRIMARY, align: AlignmentType.CENTER, widthPct: 10 }),
                  makeCell(`${kaldik.totalEffectiveWeeks} Minggu Efektif`, { fill: COLOR_SUBTLE_BG, widthPct: 20 }),
                ],
              }),
            ],
          }),
          buildSignatureBlock(meta),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `prota-${prota.mataPelajaran.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${prota.tahunAjaran.replace("/", "-")}.docx`);
}

export async function exportProsemToDocx(
  prosem: ProsemDocument,
  kaldik: KaldikYearSummary,
  meta: AkademikSignatureMeta
): Promise<void> {
  const semMonths = kaldik.months.filter((m) => m.semester === prosem.semester);
  const weekCols: { key: string; label: string; isEffective: boolean }[] = [];
  semMonths.forEach((m) => {
    m.weeks.forEach((w) => {
      weekCols.push({
        key: `${m.month}-${w.weekIndex}`,
        label: `${m.monthName.slice(0, 3)} ${w.weekIndex}`,
        isEffective: w.isEffective,
      });
    });
  });

  const weekWidth = Math.max(2, Math.floor(48 / Math.max(1, weekCols.length)));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: A4_WIDTH_TWIPS,
              height: A4_HEIGHT_TWIPS,
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: { top: 560, right: 560, bottom: 560, left: 560 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 30 },
            children: [
              new TextRun({
                text: `PROGRAM SEMESTER (PROSEM) · SEMESTER ${prosem.semester === 1 ? "I (GANJIL)" : "II (GENAP)"}`,
                bold: true,
                size: 24,
                color: COLOR_INK,
                font: FONT_DISPLAY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK } },
            children: [
              new TextRun({
                text: `${meta.sekolah} · ${prosem.mataPelajaran} · ${prosem.jenjang} (${prosem.fase} / ${prosem.kelas}) · Tahun Ajaran ${prosem.tahunAjaran}`,
                size: 18,
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
                  makeCell("No", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 4, size: 16 }),
                  makeCell("Materi Pokok", { bold: true, fill: COLOR_INK, color: "FFFFFF", widthPct: 30, size: 16 }),
                  makeCell("JP", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, widthPct: 5, size: 16 }),
                  ...weekCols.map((wc) =>
                    makeCell(wc.label, {
                      bold: true,
                      fill: wc.isEffective ? COLOR_PRIMARY : "64748B",
                      color: "FFFFFF",
                      align: AlignmentType.CENTER,
                      widthPct: weekWidth,
                      size: 13,
                    })
                  ),
                ],
              }),
              ...prosem.rows.map(
                (r, idx) =>
                  new TableRow({
                    cantSplit: true,
                    children: [
                      makeCell(String(idx + 1), { fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, size: 16 }),
                      makeCell(r.materiPokok, { bold: true, size: 16 }),
                      makeCell(String(r.alokasiJp), { bold: true, color: COLOR_PRIMARY, align: AlignmentType.CENTER, size: 16 }),
                      ...weekCols.map((wc) => {
                        const val = r.pekanJp[wc.key] ?? 0;
                        return makeCell(!wc.isEffective ? "×" : val > 0 ? String(val) : "", {
                          fill: !wc.isEffective ? "F1F5F9" : val > 0 ? "ECFDF5" : undefined,
                          color: !wc.isEffective ? "94A3B8" : COLOR_INK,
                          bold: val > 0,
                          align: AlignmentType.CENTER,
                          size: 15,
                        });
                      }),
                    ],
                  })
              ),
            ],
          }),
          buildSignatureBlock(meta),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `prosem-smt${prosem.semester}-${prosem.tahunAjaran.replace("/", "-")}.docx`);
}

export async function exportPresensiToDocx(params: {
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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: A4_WIDTH_TWIPS,
              height: A4_HEIGHT_TWIPS,
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: { top: 520, right: 520, bottom: 520, left: 520 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 30 },
            children: [
              new TextRun({
                text: `DAFTAR HADIR PESERTA DIDIK · ${monthName.toUpperCase()} ${year}`,
                bold: true,
                size: 24,
                color: COLOR_INK,
                font: FONT_DISPLAY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 110 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK } },
            children: [
              new TextRun({
                text: `${meta.sekolah} · ${academicClass.namaKelas} · ${mataPelajaran} · Tahun Ajaran ${tahunAjaran}`,
                size: 18,
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
                  makeCell("No", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 14 }),
                  makeCell("Nama Peserta Didik", { bold: true, fill: COLOR_INK, color: "FFFFFF", size: 14 }),
                  ...days.map((d) =>
                    makeCell(String(d.day), {
                      bold: true,
                      fill: d.isEffective ? COLOR_INK : "64748B",
                      color: "FFFFFF",
                      align: AlignmentType.CENTER,
                      size: 13,
                    })
                  ),
                  makeCell("H", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 14 }),
                  makeCell("S", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 14 }),
                  makeCell("I", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 14 }),
                  makeCell("A", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 14 }),
                  makeCell("%", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 14 }),
                ],
              }),
              ...academicClass.students.map((stu, idx) => {
                const stats = computeStudentAttendanceStats(stu.id, days, attendanceMap);
                return new TableRow({
                  cantSplit: true,
                  children: [
                    makeCell(String(idx + 1), { fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, size: 14 }),
                    makeCell(stu.nama, { bold: true, size: 14 }),
                    ...days.map((d) => {
                      const code = d.isEffective ? (attendanceMap[`${stu.id}|${d.dateStr}`] ?? "") : "L";
                      return makeCell(code, {
                        fill: !d.isEffective ? "F1F5F9" : undefined,
                        color: code === "A" ? "DC2626" : !d.isEffective ? "94A3B8" : COLOR_TEXT,
                        align: AlignmentType.CENTER,
                        size: 13,
                      });
                    }),
                    makeCell(String(stats.hadir), { bold: true, align: AlignmentType.CENTER, size: 14 }),
                    makeCell(String(stats.sakit), { align: AlignmentType.CENTER, size: 14 }),
                    makeCell(String(stats.izin), { align: AlignmentType.CENTER, size: 14 }),
                    makeCell(String(stats.alpa), { align: AlignmentType.CENTER, size: 14 }),
                    makeCell(`${stats.persenHadir}%`, { bold: true, color: COLOR_PRIMARY, align: AlignmentType.CENTER, size: 14 }),
                  ],
                });
              }),
            ],
          }),
          buildSignatureBlock(meta),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `daftar-hadir-${academicClass.namaKelas.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}-${String(month).padStart(2, "0")}.docx`);
}

export async function exportRekapNilaiToDocx(params: {
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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: A4_WIDTH_TWIPS,
              height: A4_HEIGHT_TWIPS,
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: { top: 560, right: 560, bottom: 560, left: 560 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 30 },
            children: [
              new TextRun({
                text: `REKAPITULASI NILAI PESERTA DIDIK · SEMESTER ${semester === 1 ? "I (GANJIL)" : "II (GENAP)"}`,
                bold: true,
                size: 24,
                color: COLOR_INK,
                font: FONT_DISPLAY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 110 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_INK } },
            children: [
              new TextRun({
                text: `${meta.sekolah} · ${academicClass.namaKelas} · ${mataPelajaran} · KKTP Minimal: ${kktpMinimal} · Tahun Ajaran ${tahunAjaran}`,
                size: 18,
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
                  makeCell("No", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("NIS", { bold: true, fill: COLOR_INK, color: "FFFFFF", size: 15 }),
                  makeCell("Nama Peserta Didik", { bold: true, fill: COLOR_INK, color: "FFFFFF", size: 15 }),
                  makeCell("TP1", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("TP2", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("TP3", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("TP4", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("Avg Fmt", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("LM1", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("LM2", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("STS", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("SAS", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("Avg Smt", { bold: true, fill: COLOR_PRIMARY, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("NA", { bold: true, fill: COLOR_INK, color: "FFFFFF", align: AlignmentType.CENTER, size: 15 }),
                  makeCell("Predikat", { bold: true, fill: COLOR_INK, color: "FFFFFF", size: 15 }),
                  makeCell("Keterangan KKTP", { bold: true, fill: COLOR_INK, color: "FFFFFF", size: 15 }),
                ],
              }),
              ...academicClass.students.map((stu, idx) => {
                const entry = gradeMap[stu.id];
                const sum = computeStudentGradeSummary(entry, kktpMinimal, bobotFormatif);
                const fmtVal = (n: number | null | undefined) => (typeof n === "number" ? String(n) : "-");
                return new TableRow({
                  cantSplit: true,
                  children: [
                    makeCell(String(idx + 1), { fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, size: 15 }),
                    makeCell(stu.nis, { size: 15 }),
                    makeCell(stu.nama, { bold: true, size: 15 }),
                    makeCell(fmtVal(entry?.tp1), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.tp2), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.tp3), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.tp4), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(sum.avgFormatif), { bold: true, fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.lm1), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.lm2), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.sts), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(entry?.sas), { align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(sum.avgSumatif), { bold: true, fill: COLOR_SUBTLE_BG, align: AlignmentType.CENTER, size: 15 }),
                    makeCell(fmtVal(sum.nilaiAkhir), {
                      bold: true,
                      color: sum.tuntas === false ? "DC2626" : COLOR_PRIMARY,
                      align: AlignmentType.CENTER,
                      size: 15,
                    }),
                    makeCell(sum.predikat, { bold: true, size: 15 }),
                    makeCell(sum.tindakLanjut, { size: 14 }),
                  ],
                });
              }),
            ],
          }),
          buildSignatureBlock(meta),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    `rekap-nilai-${academicClass.namaKelas.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-smt${semester}-${tahunAjaran.replace("/", "-")}.docx`
  );
}
