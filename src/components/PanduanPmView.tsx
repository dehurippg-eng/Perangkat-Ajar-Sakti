import { ArrowRight } from "lucide-react";
import { DIMENSI_PROFIL_LULUSAN } from "../types/modul";

interface PanduanPmViewProps {
  onStartBuilder: () => void;
}

export function PanduanPmView({ onStartBuilder }: PanduanPmViewProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-semibold text-ink text-balance">
            Kerangka Pembelajaran Mendalam Kurikulum Merdeka
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Setiap Modul Ajar dan LKPD di GURU PINTAR, CERDAS, DAN PROFESIONAL disusun mengikuti kerangka Pembelajaran Mendalam (Deep Learning) yang memadukan tiga prinsip inti dengan tiga pengalaman belajar berkesinambungan.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "01. Berkesadaran (Mindful)",
              desc: "Murid hadir secara utuh, menyadari tujuan belajar, meregulasi emosi, dan memahami relevansi proses belajar terhadap dirinya.",
            },
            {
              title: "02. Bermakna (Meaningful)",
              desc: "Materi terhubung dengan pengetahuan sebelumnya dan situasi nyata di masyarakat sehingga bukan sekadar hafalan mekanis.",
            },
            {
              title: "03. Menggembirakan (Joyful)",
              desc: "Lingkungan kelas memberi rasa aman untuk bertanya, bereksperimen, dan berkolaborasi secara antusias tanpa tekanan berlebih.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-canvas p-5">
              <h2 className="font-display text-base font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-7">
          <h2 className="font-display text-xl font-semibold text-ink">
            Alur Pengalaman Belajar (Kegiatan Inti)
          </h2>
          <div className="mt-5 divide-y divide-border">
            {[
              {
                stage: "Tahap 1: Memahami",
                summary:
                  "Murid mengeksplorasi konsep esensial secara aktif dari sumber autentik, pengamatan, atau eksperimen awal untuk membangun struktur pemahaman.",
              },
              {
                stage: "Tahap 2: Mengaplikasi",
                summary:
                  "Murid menerapkan konsep untuk memecahkan masalah kontekstual, berdiskusi dalam LKPD, atau merancang produk nyata bersama kelompok.",
              },
              {
                stage: "Tahap 3: Merefleksi",
                summary:
                  "Murid mengevaluasi strategi belajarnya sendiri, menarik kesimpulan berbasis bukti, dan merumuskan tindak lanjut konkret.",
              },
            ].map((row) => (
              <div key={row.stage} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-sm font-semibold text-primary">{row.stage}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{row.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-5">
          <h2 className="font-display text-xl font-semibold text-ink">
            8 Dimensi Profil Lulusan
          </h2>
          <ol className="mt-4 grid gap-2 text-sm text-slate-800">
            {DIMENSI_PROFIL_LULUSAN.map((dim, idx) => (
              <li key={dim} className="flex items-baseline gap-2.5 border-b border-border/70 pb-2 last:border-b-0">
                <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                  0{idx + 1}.
                </span>
                <span>{dim}</span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={onStartBuilder}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary cursor-pointer"
          >
            <span>Susun Modul Ajar Sekarang</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
