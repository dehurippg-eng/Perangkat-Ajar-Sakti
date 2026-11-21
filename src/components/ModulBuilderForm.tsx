import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  DAFTAR_LAMPIRAN,
  DIMENSI_PROFIL_LULUSAN,
  JENJANG_CONFIG,
  MODEL_PEMBELAJARAN_OPTIONS,
  type GenerateModulInput,
  type Jenjang,
  type MediaAjarData,
  type ModulAjar,
  type TeacherUser,
} from "../types/modul";
import {
  getMapelForJenjangFase,
  getMateriPokokOptions,
  getRecommendedDimensiProfilLulusan,
  getRecommendedMediaAjar,
} from "../data/kurikulumMerdekaTopics";

interface ModulBuilderFormProps {
  user: TeacherUser;
  token: string;
  onGenerated: (modul: ModulAjar, includedLampiran: number[]) => void;
  onCancel: () => void;
}

function getDefaultJp(jenjang: Jenjang): number {
  if (jenjang === "SD/MI") return 2;
  if (jenjang === "SMK/MAK") return 4;
  return 3;
}

export function ModulBuilderForm({ user, token, onGenerated, onCancel }: ModulBuilderFormProps) {
  const initialJenjang: Jenjang = "SMP/MTs";
  const initialFase = "Fase D";
  const initialKelas = "Kelas 8";
  const initialMapel = "IPA (Ilmu Pengetahuan Alam)";
  const initialSuggestions = getMateriPokokOptions(
    initialJenjang,
    initialFase,
    initialKelas,
    initialMapel
  );

  const initialTopik = initialSuggestions[0] ?? "";
  const initialModel = MODEL_PEMBELAJARAN_OPTIONS[0];
  const initialDimensi = getRecommendedDimensiProfilLulusan(
    initialJenjang,
    initialMapel,
    initialTopik,
    initialModel
  );
  const initialMediaAjar = getRecommendedMediaAjar(
    initialJenjang,
    initialMapel,
    initialTopik,
    initialModel
  );

  const [jenjang, setJenjang] = useState<Jenjang>(initialJenjang);
  const [fase, setFase] = useState<string>(initialFase);
  const [kelas, setKelas] = useState<string>(initialKelas);
  const [mataPelajaran, setMataPelajaran] = useState<string>(initialMapel);
  const [topik, setTopik] = useState<string>(initialTopik);
  const [penyusun, setPenyusun] = useState(user.name);
  const [sekolah, setSekolah] = useState(user.school);
  const [tahunAjaran, setTahunAjaran] = useState("2026/2027");
  const [jp, setJp] = useState(getDefaultJp(initialJenjang));
  const [jumlahPertemuan, setJumlahPertemuan] = useState(1);
  const [modelPembelajaran, setModelPembelajaran] = useState(initialModel);
  const [dimensi, setDimensi] = useState<string[]>(initialDimensi);
  const [dimensiManual, setDimensiManual] = useState(false);
  const [mediaAjar, setMediaAjar] = useState<MediaAjarData>(initialMediaAjar);
  const [mediaManual, setMediaManual] = useState(false);
  const [selectedLampiran, setSelectedLampiran] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [kotaTanggal, setKotaTanggal] = useState("");
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState("");
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState("");
  const [nipGuru, setNipGuru] = useState("");
  const [catatanKonteks, setCatatanKonteks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentJenjangConfig = JENJANG_CONFIG[jenjang];
  const currentFaseObj =
    currentJenjangConfig.fases.find((f) => f.fase === fase) ?? currentJenjangConfig.fases[0];
  const availableMapel = getMapelForJenjangFase(jenjang, fase, kelas);
  const topicSuggestions = getMateriPokokOptions(jenjang, fase, kelas, mataPelajaran);

  function syncTopikDanRekomendasi(
    nextJenjang: Jenjang,
    nextFase: string,
    nextKelas: string,
    nextMapel: string,
    nextModel = modelPembelajaran
  ) {
    const nextList = getMateriPokokOptions(nextJenjang, nextFase, nextKelas, nextMapel);
    const nextTopik = nextList[0] ?? "";
    setTopik(nextTopik);
    setDimensiManual(false);
    setDimensi(
      getRecommendedDimensiProfilLulusan(nextJenjang, nextMapel, nextTopik, nextModel)
    );
    setMediaManual(false);
    setMediaAjar(getRecommendedMediaAjar(nextJenjang, nextMapel, nextTopik, nextModel));
  }

  function handleJenjangChange(nextJenjang: Jenjang) {
    const cfg = JENJANG_CONFIG[nextJenjang];
    const nextFase = cfg.fases[0].fase;
    const nextKelas = cfg.fases[0].kelasList[0];
    const nextMapelList = getMapelForJenjangFase(nextJenjang, nextFase, nextKelas);
    const nextMapel = nextMapelList[0] ?? cfg.mapel[0];

    setJenjang(nextJenjang);
    setFase(nextFase);
    setKelas(nextKelas);
    setMataPelajaran(nextMapel);
    setJp(getDefaultJp(nextJenjang));
    syncTopikDanRekomendasi(nextJenjang, nextFase, nextKelas, nextMapel);
  }

  function handleFaseChange(nextFase: string) {
    const found = currentJenjangConfig.fases.find((f) => f.fase === nextFase);
    const nextKelas = found ? found.kelasList[0] : kelas;
    const nextMapelList = getMapelForJenjangFase(jenjang, nextFase, nextKelas);
    const nextMapel = nextMapelList.includes(mataPelajaran) ? mataPelajaran : nextMapelList[0];

    setFase(nextFase);
    setKelas(nextKelas);
    setMataPelajaran(nextMapel);
    syncTopikDanRekomendasi(jenjang, nextFase, nextKelas, nextMapel);
  }

  function handleKelasChange(nextKelas: string) {
    const nextMapelList = getMapelForJenjangFase(jenjang, fase, nextKelas);
    const nextMapel = nextMapelList.includes(mataPelajaran) ? mataPelajaran : nextMapelList[0];

    setKelas(nextKelas);
    setMataPelajaran(nextMapel);
    syncTopikDanRekomendasi(jenjang, fase, nextKelas, nextMapel);
  }

  function handleMapelChange(nextMapel: string) {
    setMataPelajaran(nextMapel);
    syncTopikDanRekomendasi(jenjang, fase, kelas, nextMapel);
  }

  function handlePresetTopikChange(nextTopik: string) {
    setTopik(nextTopik);
    setDimensiManual(false);
    setDimensi(
      getRecommendedDimensiProfilLulusan(jenjang, mataPelajaran, nextTopik, modelPembelajaran)
    );
    setMediaManual(false);
    setMediaAjar(getRecommendedMediaAjar(jenjang, mataPelajaran, nextTopik, modelPembelajaran));
  }

  function handleTopikInputChange(nextTopik: string) {
    setTopik(nextTopik);
    if (!dimensiManual) {
      setDimensi(
        getRecommendedDimensiProfilLulusan(jenjang, mataPelajaran, nextTopik, modelPembelajaran)
      );
    }
    if (!mediaManual) {
      setMediaAjar(getRecommendedMediaAjar(jenjang, mataPelajaran, nextTopik, modelPembelajaran));
    }
  }

  function handleModelChange(nextModel: string) {
    setModelPembelajaran(nextModel);
    if (!dimensiManual) {
      setDimensi(
        getRecommendedDimensiProfilLulusan(jenjang, mataPelajaran, topik, nextModel)
      );
    }
    if (!mediaManual) {
      setMediaAjar(getRecommendedMediaAjar(jenjang, mataPelajaran, topik, nextModel));
    }
  }

  function resetDimensiOtomatis() {
    setDimensiManual(false);
    setDimensi(
      getRecommendedDimensiProfilLulusan(jenjang, mataPelajaran, topik, modelPembelajaran)
    );
  }

  function resetMediaOtomatis() {
    setMediaManual(false);
    setMediaAjar(getRecommendedMediaAjar(jenjang, mataPelajaran, topik, modelPembelajaran));
  }

  function toggleDimensi(item: string) {
    setDimensiManual(true);
    setDimensi((prev) => {
      if (prev.includes(item)) {
        return prev.length > 1 ? prev.filter((d) => d !== item) : prev;
      }
      if (prev.length >= 4) return prev;
      return [...prev, item];
    });
  }

  function toggleLampiranItem(id: number) {
    setSelectedLampiran((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!topik.trim()) {
      setError("Isi topik atau materi pokok terlebih dahulu.");
      return;
    }

    setLoading(true);
    const payload: GenerateModulInput & { ownerId: string } = {
      ownerId: user.id,
      penyusun: penyusun.trim() || user.name,
      sekolah: sekolah.trim() || user.school,
      tahunAjaran: tahunAjaran.trim() || "2026/2027",
      jenjang,
      fase,
      kelas,
      mataPelajaran,
      topik: topik.trim(),
      jp,
      jumlahPertemuan,
      modelPembelajaran,
      dimensiProfilLulusan: dimensi,
      catatanKonteks: catatanKonteks.trim(),
      mediaAjarRekomendasi: mediaAjar,
      kotaTanggal: kotaTanggal.trim() || undefined,
      namaKepalaSekolah: namaKepalaSekolah.trim() || undefined,
      nipKepalaSekolah: nipKepalaSekolah.trim() || undefined,
      nipGuru: nipGuru.trim() || undefined,
    };

    try {
      const res = await fetch("/api/generate-modul", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyusun modul ajar.");
        setLoading(false);
        return;
      }
      onGenerated(data.modul, selectedLampiran);
    } catch {
      setError("Gagal menghubungi server penyusun modul. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 md:p-8 lg:col-span-8"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Susun Modul Ajar & LKPD Baru
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Materi pokok Kurikulum Merdeka otomatis menyesuaikan jenjang, fase, kelas, dan mata pelajaran yang dipilih.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800"
          >
            {error}
          </div>
        )}

        {/* Jenjang Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink">Jenjang Pendidikan</label>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1 sm:grid-cols-4">
            {(["SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"] as Jenjang[]).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => handleJenjangChange(j)}
                className={`rounded-md py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  jenjang === j ? "bg-card text-ink shadow-xs" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {j}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="fase" className="block text-xs font-semibold text-ink">
              Fase
            </label>
            <select
              id="fase"
              value={fase}
              onChange={(e) => handleFaseChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {currentJenjangConfig.fases.map((f) => (
                <option key={f.fase} value={f.fase}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kelas" className="block text-xs font-semibold text-ink">
              Kelas
            </label>
            <select
              id="kelas"
              value={kelas}
              onChange={(e) => handleKelasChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {currentFaseObj.kelasList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mapel" className="block text-xs font-semibold text-ink">
              Mata Pelajaran
            </label>
            <select
              id="mapel"
              value={mataPelajaran}
              onChange={(e) => handleMapelChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {availableMapel.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {topicSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="preset-topik" className="block text-xs font-semibold text-ink">
                  Materi Pokok Kurikulum Merdeka (Terisi Otomatis)
                </label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {topicSuggestions.length} materi · {kelas} ({fase})
                </span>
              </div>
              <select
                id="preset-topik"
                value={topicSuggestions.includes(topik) ? topik : ""}
                onChange={(e) => {
                  if (e.target.value) handlePresetTopikChange(e.target.value);
                }}
                className="h-10 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
              >
                {topicSuggestions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                {!topicSuggestions.includes(topik) && (
                  <option value="">(Topik khusus yang disunting manual)</option>
                )}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="topik" className="block text-xs font-semibold text-ink">
              Topik / Materi Pokok (Dapat Disunting)
            </label>
            <input
              id="topik"
              type="text"
              value={topik}
              onChange={(e) => handleTopikInputChange(e.target.value)}
              placeholder="Materi pokok Kurikulum Merdeka otomatis terisi di sini"
              required
              className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="jp" className="block text-xs font-semibold text-ink">
              Alokasi Waktu (JP)
            </label>
            <input
              id="jp"
              type="number"
              min={1}
              max={12}
              value={jp}
              onChange={(e) => setJp(Math.max(1, Number(e.target.value) || 1))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink tabular-nums outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pertemuan" className="block text-xs font-semibold text-ink">
              Jumlah Pertemuan
            </label>
            <input
              id="pertemuan"
              type="number"
              min={1}
              max={6}
              value={jumlahPertemuan}
              onChange={(e) => setJumlahPertemuan(Math.max(1, Number(e.target.value) || 1))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink tabular-nums outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tahun" className="block text-xs font-semibold text-ink">
              Tahun Ajaran
            </label>
            <input
              id="tahun"
              type="text"
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink tabular-nums outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="penyusun" className="block text-xs font-semibold text-ink">
              Nama Penyusun
            </label>
            <input
              id="penyusun"
              type="text"
              value={penyusun}
              onChange={(e) => setPenyusun(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sekolah" className="block text-xs font-semibold text-ink">
              Satuan Pendidikan
            </label>
            <input
              id="sekolah"
              type="text"
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="model" className="block text-xs font-semibold text-ink">
            Model Pembelajaran
          </label>
          <select
            id="model"
            value={modelPembelajaran}
            onChange={(e) => handleModelChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
          >
            {MODEL_PEMBELAJARAN_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-ink">
                Dimensi Profil Lulusan (Terhubung Otomatis)
              </label>
              <p className="text-xs text-muted-foreground">
                Menyesuaikan langsung dengan mata pelajaran, materi pokok, dan model pembelajaran.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {dimensiManual && (
                <button
                  type="button"
                  onClick={resetDimensiOtomatis}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Sesuaikan Otomatis
                </button>
              )}
              <span className="text-xs text-muted-foreground tabular-nums">
                {dimensi.length}/4 dipilih
              </span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {DIMENSI_PROFIL_LULUSAN.map((item) => {
              const selected = dimensi.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDimensi(item)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    selected
                      ? "border-primary bg-primary/8 text-ink"
                      : "border-border bg-card text-muted-foreground hover:text-ink"
                  }`}
                >
                  <span className="truncate">{item}</span>
                  <span className={`ml-2 text-xs font-semibold ${selected ? "text-primary" : "text-slate-300"}`}>
                    {selected ? "Aktif" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Ajar Relevan (Otomatis) */}
        <div className="space-y-2 rounded-lg border border-border bg-canvas p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-ink">
                Media Ajar Relevan (Terisi Otomatis sesuai Mapel & Materi)
              </label>
              <p className="text-xs text-muted-foreground">
                Media pembelajaran, alat peraga, dan sumber digital otomatis menyesuaikan topik pilihan Anda.
              </p>
            </div>
            {mediaManual && (
              <button
                type="button"
                onClick={resetMediaOtomatis}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Sesuaikan Otomatis
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-medium text-ink">Media Utama (1 per baris)</span>
              <textarea
                rows={3}
                value={mediaAjar.mediaUtama.join("\n")}
                onChange={(e) => {
                  setMediaManual(true);
                  setMediaAjar({
                    ...mediaAjar,
                    mediaUtama: e.target.value.split("\n"),
                  });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-card p-2 text-xs leading-relaxed text-ink outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <div>
                <span className="block text-xs font-medium text-ink">Alat & Bahan Pendukung</span>
                <textarea
                  rows={2}
                  value={mediaAjar.alatDanBahanPendukung.join("\n")}
                  onChange={(e) => {
                    setMediaManual(true);
                    setMediaAjar({
                      ...mediaAjar,
                      alatDanBahanPendukung: e.target.value.split("\n"),
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-card p-2 text-xs leading-relaxed text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <span className="block text-xs font-medium text-ink">Sumber Digital Relevan</span>
                <input
                  type="text"
                  value={mediaAjar.sumberDigital}
                  onChange={(e) => {
                    setMediaManual(true);
                    setMediaAjar({
                      ...mediaAjar,
                      sumberDigital: e.target.value,
                    });
                  }}
                  className="mt-1 h-8 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-ink outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 8 Lampiran Selector */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-ink">
                Paket Lampiran Perangkat Ajar ({selectedLampiran.length}/8 Lampiran)
              </label>
              <p className="text-xs text-muted-foreground">
                Glosarium, Daftar Pustaka, dan TTD Pengesahan tetap di akhir Modul Ajar; 8 lampiran terpilih digabung dalam satu berkas PDF/Word.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedLampiran([1, 2, 3, 4, 5, 6, 7, 8])}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Pilih Semua (8)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLampiran([])}
                className="font-medium text-muted-foreground hover:text-ink cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {DAFTAR_LAMPIRAN.map((item) => {
              const checked = selectedLampiran.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer ${
                    checked
                      ? "border-primary bg-primary/5 text-ink"
                      : "border-border bg-canvas text-muted-foreground hover:text-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLampiranItem(item.id)}
                    className="mt-0.5 size-3.5 accent-primary"
                  />
                  <span className="leading-snug font-medium">{item.title}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Pengesahan TTD Kepsek & Guru Mapel */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-ink">
              Pengesahan Kepala Sekolah & Guru Mata Pelajaran (Opsional)
            </label>
            <p className="text-xs text-muted-foreground">
              Kosongkan jika ingin diisi manual setelah modul dicetak/diunduh ke Word.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={namaKepalaSekolah}
              onChange={(e) => setNamaKepalaSekolah(e.target.value)}
              placeholder="Nama Kepala Sekolah & Gelar"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={nipKepalaSekolah}
              onChange={(e) => setNipKepalaSekolah(e.target.value)}
              placeholder="NIP Kepala Sekolah (opsional)"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={kotaTanggal}
              onChange={(e) => setKotaTanggal(e.target.value)}
              placeholder="Tempat & Tanggal, cth. Yogyakarta, 15 Juli 2026"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
            <input
              type="text"
              value={nipGuru}
              onChange={(e) => setNipGuru(e.target.value)}
              placeholder="NIP Guru Mata Pelajaran (opsional)"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="konteks" className="block text-xs font-semibold text-ink">
            Catatan Konteks Murid / Kondisi Sekolah (Opsional)
          </label>
          <textarea
            id="konteks"
            rows={2}
            value={catatanKonteks}
            onChange={(e) => setCatatanKonteks(e.target.value)}
            placeholder="cth. Sekolah berada di wilayah pesisir, alat praktikum terbatas sehingga memakai bahan rumah tangga."
            className="w-full rounded-lg border border-border bg-card p-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Menyusun Modul & LKPD...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-saffron" />
                <span>Susun Modul Ajar & LKPD</span>
              </>
            )}
          </button>
        </div>
      </form>

      <aside className="space-y-5 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Struktur Keluaran Otomatis
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Dokumen yang dihasilkan siap langsung dicetak, disimpan sebagai PDF, atau diunduh ke format Word (.docx) untuk diedit lebih lanjut.
          </p>

          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-xs">
            <div>
              <dt className="font-semibold text-ink">01. Identitas & Kesiapan</dt>
              <dd className="mt-0.5 text-muted-foreground">
                Kesiapan murid, karakteristik materi, dan {dimensi.length} Dimensi Profil Lulusan.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">02. Desain & Pengalaman Belajar</dt>
              <dd className="mt-0.5 text-muted-foreground">
                CP, TP, Pemahaman Bermakna, serta alur Memahami, Mengaplikasi, dan Merefleksi.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">03. Penutup Modul, Pengesahan & 8 Lampiran</dt>
              <dd className="mt-0.5 text-muted-foreground">
                Akhir Modul Ajar memuat Glosarium, Daftar Pustaka, dan TTD Kepala Sekolah & Guru Mapel; diikuti 8 Lampiran: Asesmen Diagnostik, Penilaian Sikap, Asesmen Formatif, Bahan Ajar, LKPD, Refleksi & Umpan Balik, Media Ajar Otomatis, dan KKTP dalam satu berkas PDF/Word.
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
