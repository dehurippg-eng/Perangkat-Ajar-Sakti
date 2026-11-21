import { DIMENSI_PROFIL_LULUSAN, JENJANG_CONFIG, type Jenjang, type MediaAjarData } from "../types/modul";

type TopicsByMapel = Record<string, string[]>;
type TopicsByKelas = Record<string, TopicsByMapel>;
type TopicsByFase = Record<string, TopicsByKelas>;

export const KURIKULUM_MERDEKA_TOPICS: Record<Jenjang, TopicsByFase> = {
  "SD/MI": {
    "Fase A": {
      "Kelas 1": {
        "Pendidikan Pancasila": [
          "Aku Mengenal Diriku dan Teman-Temanku (Identitas Diri & Keberagaman)",
          "Simbol Sila-Sila Pancasila dan Lambang Negara Garuda Pancasila",
          "Aturan di Rumah dan di Sekolah yang Harus Aku Patuhi",
          "Hidup Rukun dan Saling Menyayangi dalam Keluarga",
        ],
        "Bahasa Indonesia": [
          "Bunyi Huruf, Suku Kata (ba-bi-bu-be-bo), dan Membaca Kata Sederhana",
          "Mengenal Nama Sendiri, Keluarga, dan Benda di Sekitar Kelas",
          "Menyimak Dongeng Pendek dan Menjawab Pertanyaan Isi Cerita",
          "Menulis Kalimat Sederhana dengan Huruf Kapital dan Tanda Titik",
        ],
        Matematika: [
          "Membilang, Membaca, dan Menulis Bilangan Cacah 1 sampai 20",
          "Penjumlahan dan Pengurangan Bilangan Cacah sampai 20 dengan Benda Konkret",
          "Mengenal Bangun Datar (Segitiga, Segiempat, Lingkaran) dan Pola Bentuk",
          "Membandingkan Panjang, Berat, dan Waktu Aktivitas Sehari-hari",
        ],
        "Bahasa Inggris": [
          "Greetings and Self-Introduction (Hello, My Name Is...)",
          "Numbers 1–10 and Colors Around the Classroom",
          "My Family Members and Classroom Objects",
        ],
        "Seni Rupa": [
          "Mengenal Garis Lurus, Lengkung, dan Warna Primer dalam Menggambar",
          "Membuat Karya Kolase dari Kertas Warna dan Daun Kering",
          "Mencipta Bentuk Sederhana dengan Plastisin atau Tanah Liat",
        ],
        "Seni Musik": [
          "Membedakan Bunyi Alam dan Bunyi Buatan di Lingkungan Sekitar",
          "Menirukan Pola Irama Sederhana dengan Tepuk Tangan dan Alat Ritmis",
          "Menyanyikan Lagu Anak Nusantara dengan Irama Riang",
        ],
        PJOK: [
          "Gerak Dasar Lokomotor: Berjalan, Berlari, dan Melompat Lurus",
          "Gerak Dasar Non-Lokomotor: Membungkuk, Mengayun, dan Keseimbangan",
          "Mengenal Bagian Tubuh dan Kebiasaan Cuci Tangan serta Gosok Gigi",
        ],
      },
      "Kelas 2": {
        "Pendidikan Pancasila": [
          "Penerapan Nilai-Nilai Sila Pancasila di Lingkungan Rumah dan Sekolah",
          "Menjaga Kebersihan dan Ketertiban Lingkungan sebagai Warga Sekolah",
          "Menghargai Perbedaan Ciri Fisik, Hobi, dan Budaya Teman",
          "Sikap Gotong Royong dan Tolong-Menolong di Lingkungan Sekitar",
        ],
        "Bahasa Indonesia": [
          "Mengenal Perasaan (Senang, Takut, Marah) melalui Cerita Bergambar",
          "Menggunakan Tanda Baca (Titik, Koma, Tanya, Seru) dalam Kalimat",
          "Membedakan Informasi Fakta dan Opini Sederhana dari Teks Bacaan",
          "Menulis Cerita Pengalaman Pribadi yang Runtut dengan Kosakata Baru",
        ],
        Matematika: [
          "Bilangan Cacah sampai 100: Nilai Tempat Puluhan dan Satuan",
          "Penjumlahan dan Pengurangan Bilangan Cacah sampai 100",
          "Mengenal Konsep Pecahan Setengah (1/2) dan Seperempat (1/4) dari Benda Utuh",
          "Pengukuran Panjang (cm/m), Berat (gram/kg), dan Membaca Jam Analog",
        ],
        "Bahasa Inggris": [
          "Expressing Likes and Dislikes (Fruits, Animals, and Toys)",
          "Numbers 11–20 and Counting Objects Around Us",
          "Parts of the House and Prepositions (in, on, under)",
        ],
        "Seni Rupa": [
          "Menggambar Ekspresi Alam Sekitar dengan Gradasi Warna Krayon",
          "Membuat Karya Cetak Stempel dari Pelepah Pisang atau Umbi",
          "Merangkai Karya Tiga Dimensi dari Kardus dan Bahan Daur Ulang",
        ],
        "Seni Musik": [
          "Mengenal Tinggi-Rendah Nada (Solmisasi Do-Re-Mi-Fa-Sol)",
          "Memainkan Pola Ketukan Birama 2/4 dan 3/4 Menggunakan Alat Musik Ritmis",
          "Menyanyikan Lagu Anak dan Lagu Daerah dengan Artikulasi Jelas",
        ],
        PJOK: [
          "Kombinasi Gerak Lokomotor dan Manipulatif: Melempar dan Menangkap Bola",
          "Aktivitas Keseimbangan Dinamis dan Senam Irama Sederhana",
          "Memilih Makanan Bergizi dan Menjaga Kebersihan Pakaian serta Lingkungan",
        ],
      },
    },
    "Fase B": {
      "Kelas 3": {
        "Pendidikan Pancasila": [
          "Identitas Diri, Keluarga, dan Keragaman Suku Bangsa di Daerahku",
          "Aturan, Hak, dan Kewajiban Anak di Rumah dan di Sekolah",
          "Makna Sila-Sila Pancasila dalam Kehidupan Bermasyarakat",
          "Tradisi Gotong Royong dan Musyawarah di Lingkungan Sekitar",
        ],
        "Bahasa Indonesia": [
          "Menemukan Ide Pokok dan Gagasan Pendukung dalam Teks Narasi",
          "Memahami Kalimat Tunggal (S-P-O-K) serta Penggunaan Huruf Kapital",
          "Menulis Teks Prosedur Sederhana dan Puisi Anak Bertema Alam",
          "Menyampaikan Pendapat Secara Santun dalam Diskusi Kelompok Kecil",
        ],
        Matematika: [
          "Bilangan Cacah sampai 1.000: Membaca, Menulis, dan Membandingkan",
          "Perkalian dan Pembagian Bilangan Cacah dalam Soal Cerita Kontekstual",
          "Pengenalan Unsur Bangun Datar (Sisi, Sudut, Titik Sudut) dan Simetri",
          "Pengukuran Panjang, Berat, dan Satuan Waktu (Menit, Jam, Hari)",
        ],
        "IPAS (Ilmu Pengetahuan Alam dan Sosial)": [
          "Mari Kenali Hewan di Sekitar Kita dan Siklus Hidup Makhluk Hidup",
          "Sumber dan Bentuk Energi di Sekitar Kita (Panas, Cahaya, Gerak, Listrik)",
          "Mengenal Denah Rumah, Sekolah, dan Bentang Alam Daerah Tempat Tinggal",
          "Tradisi Masyarakat Setempat dan Kerja Sama dalam Lingkungan Sosial",
        ],
        "Bahasa Inggris": [
          "Favorite Food and Drinks (What Do You Like?)",
          "Daily Routines and Hobbies at Home and School",
          "Days of the Week and School Subjects",
        ],
        "Seni Rupa": [
          "Menggambar Garis, Bentuk Geometris, dan Warna Sekunder yang Harmonis",
          "Mencipta Karya Dekoratif Motif Ragam Hias Nusantara",
          "Membuat Kerajinan Tangan dari Bahan Alam dan Limbah Kertas",
        ],
        "Seni Musik": [
          "Membaca Notasi Angka dan Pola Irama Birama 4/4",
          "Menyanyikan Lagu Daerah Nusantara dengan Tempo yang Tepat",
          "Mengenal Alat Musik Melodis Sederhana (Pianika / Rekorder)",
        ],
        PJOK: [
          "Variasi Gerak Dasar Lari, Lompat, dan Lempar dalam Permainan Tradisional",
          "Permainan Bola Kecil dan Bola Besar Modifikasi yang Aman",
          "Latihan Keseimbangan, Kelenturan, dan Istirahat yang Cukup",
        ],
      },
      "Kelas 4": {
        "Pendidikan Pancasila": [
          "Sejarah Singkat Perumusan Pancasila dan Nilai Keteladanan Para Tokoh",
          "Konstitusi dan Aturan di Lingkungan Masyarakat serta Pemerintahan Desa/Kelurahan",
          "Bhinneka Tunggal Ika: Menghargai Keragaman Budaya dan Bahasa Daerah",
          "Peran Gotong Royong dalam Membangun Lingkungan yang Harmonis",
        ],
        "Bahasa Indonesia": [
          "Memahami Kalimat Transitif, Intransitif, dan Makna Kata Berimbuhan Me-/Ber-",
          "Menganalisis Teks Informatif dan Menyusun Laporan Hasil Wawancara",
          "Menulis Teks Deskripsi dan Teks Narasi Bertema Kepahlawanan/Lingkungan",
          "Membedakan Kalimat Efektif dan Menulis Paragraf Deduktif-Induktif",
        ],
        Matematika: [
          "Bilangan Cacah sampai 10.000, Faktor, dan Kelipatan Bilangan",
          "Pecahan Senilai, Membandingkan, dan Mengurutkan Pecahan",
          "Keliling dan Luas Bangun Datar (Persegi, Persegi Panjang, Segitiga)",
          "Penyajian Data Tabel dan Piktogram dari Survei Sederhana di Kelas",
        ],
        "IPAS (Ilmu Pengetahuan Alam dan Sosial)": [
          "Bagian Tubuh Tumbuhan dan Proses Fotosintesis sebagai Sumber Kehidupan",
          "Wujud Zat (Padat, Cair, Gas) dan Perubahan Wujud dalam Kehidupan Sehari-hari",
          "Gaya di Sekitar Kita (Gaya Otot, Gesek, Gravitasi, Magnet) dan Pengaruhnya",
          "Kerajaan-Kerajaan Nusantara dan Peta Wilayah Provinsi Tempat Tinggalku",
          "Kegiatan Ekonomi Masyarakat: Produksi, Distribusi, dan Konsumsi",
        ],
        "Bahasa Inggris": [
          "Telling Time and Daily Activities Using Simple Present Tense",
          "Present Continuous Tense: What Are You Doing?",
          "Numbers 50–100 and Transportation Around the City",
        ],
        "Seni Rupa": [
          "Menggambar Sketsa Rumah Impian dengan Prinsip Perspektif Sederhana",
          "Mengolah Limbah Plastik/Kardus Menjadi Karya Kreatif Bernilai Guna",
          "Membuat Komik Sederhana atau Poster Peduli Lingkungan",
        ],
        "Seni Musik": [
          "Menyanyikan Lagu Wajib Nasional dengan Teknik Pernapasan Diafragma Dasar",
          "Memainkan Melodi Lagu Daerah Sederhana Menggunakan Pianika/Rekorder",
          "Mengapresiasi Ragam Alat Musik Tradisional Indonesia",
        ],
        PJOK: [
          "Kombinasi Gerak Spesifik Passing, Menendang, dan Memukul Bola",
          "Senam Lantai Dasar: Sikap Lilin, Keseimbangan, dan Guling Depan Aman",
          "Kebugaran Jasmani Anak serta Pencegahan Cedera Ringan saat Bermain",
        ],
      },
    },
    "Fase C": {
      "Kelas 5": {
        "Pendidikan Pancasila": [
          "Pancasila dalam Kehidupanku: Mengamalkan Nilai Gotong Royong dan Keadilan",
          "Norma dalam Kehidupan Bermasyarakat serta Hak dan Kewajiban Warga Negara",
          "Keragaman Budaya Daerahku sebagai Kekayaan Bangsa Indonesia",
          "Mengenal Wilayah NKRI dan Struktur Pemerintahan Daerah Kabupaten/Kota",
        ],
        "Bahasa Indonesia": [
          "Menganalisis Unsur Intrinsik Cerita Fiksi dan Majas (Metafora, Personifikasi)",
          "Menulis Teks Eksplanasi dan Ringkasan Teks Nonfiksi Berbasis Fakta",
          "Memahami Imbuhan Pe-, Ter-, -Kan/-Lah serta Kalimat Majemuk Setara",
          "Membuat Surat Pribadi, Surel Sederhana, dan Teks Pengumuman Resmi",
        ],
        Matematika: [
          "Bilangan Cacah sampai 100.000, KPK, dan FPB dalam Masalah Sehari-hari",
          "Operasi Penjumlahan, Pengurangan, dan Perkalian Pecahan serta Desimal",
          "Keliling dan Luas Gabungan Bangun Datar serta Sudut pada Segitiga",
          "Pengumpulan Data, Diagram Batang Ganda, dan Penafsiran Data Sederhana",
        ],
        "IPAS (Ilmu Pengetahuan Alam dan Sosial)": [
          "Sifat-Sifat Cahaya, Bunyi, serta Cara Kerja Indra Penglihatan dan Pendengaran",
          "Ekosistem, Jaring-Jaring Makanan, dan Keseimbangan Lingkungan Alam",
          "Listrik Sederhana, Magnet, dan Teknologi Ramah Lingkungan di Sekitar",
          "Sistem Pernapasan dan Pencernaan Manusia serta Menjaga Kesehatan Organ",
          "Kondisi Geografis Indonesia sebagai Negara Maritim dan Agraris",
        ],
        "Bahasa Inggris": [
          "Expressing Quantities and Prices of Food/Drinks",
          "Describing Health Problems and Giving Simple Advice",
          "Comparative Adjectives in Comparing People and Objects",
        ],
        "Seni Rupa": [
          "Prinsip Keseimbangan dan Ritme dalam Menggambar Objek Alam Benda",
          "Mencipta Karya Anyaman dari Kertas, Bambu, atau Serat Alam",
          "Membuat Ragam Hias Daerah pada Media Kain atau Kayu Sederhana",
        ],
        "Seni Musik": [
          "Menyanyikan Lagu Nasional dan Lagu Daerah dalam Dua Suara Sederhana",
          "Bermain Ansambel Campuran Alat Musik Melodis dan Ritmis",
          "Mengenal Tangga Nada Mayor dan Minor pada Lagu Nusantara",
        ],
        PJOK: [
          "Kombinasi Gerak Dasar Permainan Bola Basket, Bola Voli, dan Sepak Bola",
          "Atletik Anak: Lari Sprint 40 Meter, Lompat Jauh, dan Lempar Turbo",
          "Gerak Dasar Pencak Silat dan Pemeliharaan Kebersihan Alat Reproduksi",
        ],
      },
      "Kelas 6": {
        "Pendidikan Pancasila": [
          "Hubungan Antarsila dalam Pancasila sebagai Satu Kesatuan yang Utuh",
          "Mengamalkan Nilai Pancasila dalam Musyawarah Mufakat di Sekolah",
          "Menghormati Keberagaman Agama, Budaya, dan Persatuan Indonesia",
          "Mengenal Provinsi di Indonesia dan Semangat Bela Negara Sejak Dini",
        ],
        "Bahasa Indonesia": [
          "Menganalisis Teks Laporan Hasil Pengamatan dan Teks Biografi Tokoh",
          "Menulis Teks Pidato Persuasif dan Debat Sederhana dengan Argumen Santun",
          "Membedakan Informasi Fakta, Opini, dan Hoaks pada Artikel Media",
          "Mengisi Formulir Resmi, Kuitansi, dan Menulis Surat Resmi Sekolah",
        ],
        Matematika: [
          "Operasi Hitung Pecahan, Desimal, dan Persen dalam Konteks Diskon/Keuangan",
          "Rasio, Perbandingan Senilai, dan Skala Peta/Denah",
          "Volume dan Luas Permukaan Bangun Ruang (Kubus, Balok, Prisma, Tabung)",
          "Mean (Rata-Rata), Median, Modus, dan Peluang Kejadian Sederhana",
        ],
        "IPAS (Ilmu Pengetahuan Alam dan Sosial)": [
          "Sistem Gerak Manusia (Rangka, Sendi, Otot) dan Sistem Saraf Dasar",
          "Krisis Energi, Energi Alternatif Terbarukan, dan Penghematan Energi",
          "Sistem Tata Surya, Rotasi-Revolusi Bumi, serta Fenomena Gerhana",
          "Sejarah Perjuangan Bangsa Indonesia Menuju Proklamasi Kemerdekaan 1945",
          "Interaksi Indonesia dengan Negara ASEAN dan Pengaruh Globalisasi",
        ],
        "Bahasa Inggris": [
          "Simple Past Tense: Talking About Past Holidays and School Events",
          "Future Plans Using 'Going To' and 'Will'",
          "Reading Short Narrative & Fable Texts to Find Moral Lessons",
        ],
        "Seni Rupa": [
          "Menggambar Ekspresif Menggunakan Prinsip Proporsi dan Perspektif",
          "Merancang Poster Kampanye Sosial/Lingkungan yang Komunikatif",
          "Membuat Karya Patung Sederhana atau Kerajinan Daur Ulang Kreatif",
        ],
        "Seni Musik": [
          "Mengaransemen Iringan Ritmis dan Melodis untuk Lagu Daerah Nusantara",
          "Penampilan Paduan Suara Lagu Wajib Nasional dengan Ekspresi dan Dinamika",
          "Apresiasi Pertunjukan Musik Tradisional dan Modern Indonesia",
        ],
        PJOK: [
          "Penerapan Taktik Dasar Permainan Bola Besar dan Bola Kecil yang Sportif",
          "Aktivitas Kebugaran Jasmani: Tes Daya Tahan, Kelincahan, dan Kekuatan",
          "Gerak Berirama Berkelompok dan Bahaya Rokok serta Zat Adiktif",
        ],
      },
    },
  },
  "SMP/MTs": {
    "Fase D": {
      "Kelas 7": {
        "Pendidikan Pancasila": [
          "Sejarah Kelahiran Pancasila (BPUPK, Piagam Jakarta, dan Pengesahan PPKI)",
          "Norma dan Keadilan dalam Kehidupan Bermasyarakat serta UUD NRI 1945",
          "Kesatuan Indonesia dan Karakteristik Daerah dalam Bingkai NKRI",
          "Keberagaman Suku, Agama, Ras, dan Budaya serta Kerja Sama Gotong Royong",
        ],
        "Bahasa Indonesia": [
          "Teks Deskripsi: Menjelajahi Keindahan Alam dan Budaya Daerah",
          "Teks Puisi Rakyat (Pantun, Syair, Gurindam) dan Cerita Fantasi",
          "Teks Prosedur: Tip Sehat, Resep Lokal, dan Langkah Kerja Aman",
          "Teks Berita Cetak/Digital dan Surat Pribadi/Resmi",
        ],
        Matematika: [
          "Bilangan Bulat, Bilangan Rasional (Pecahan & Desimal), dan Faktorisasi",
          "Rasio, Proporsi, Laju Perubahan, dan Skala Peta",
          "Aljabar Dasar: Bentuk Aljabar dan Persamaan Linear Satu Variabel (PLSV)",
          "Garis, Sudut, Kesebangunan Segitiga, serta Penyajian Data Statistika",
        ],
        "IPA (Ilmu Pengetahuan Alam)": [
          "Hakikat Ilmu Sains, Alat Laboratorium, dan Pengukuran Besaran",
          "Zat dan Perubahannya (Wujud Zat, Massa Jenis, Perubahan Fisika & Kimia)",
          "Suhu, Kalor, Pemuaian, serta Gerak Lurus dan Gaya (Hukum Newton)",
          "Klasifikasi Makhluk Hidup, Ekologi, dan Keanekaragaman Hayati Indonesia",
          "Bumi dan Tata Surya (Lapisan Bumi, Rotasi, Revolusi, dan Fase Bulan)",
        ],
        "IPS (Ilmu Pengetahuan Sosial)": [
          "Kondisi Geografis Indonesia, Peta, dan Interaksi Antarruang",
          "Keberagaman Lingkungan Alam, Masa Praaksara, dan Aktivitas Ekonomi Awal",
          "Potensi Sumber Daya Alam, Kependudukan, dan Pemberdayaan Masyarakat",
          "Interaksi Sosial, Nilai, Norma, dan Lembaga Sosial di Masyarakat",
        ],
        "Bahasa Inggris": [
          "About Me: Introducing Self, Hobbies, and Daily Routines",
          "Culinary and Me: Describing Favorite Foods and Simple Recipes",
          "Home Sweet Home: Describing Rooms and Cleaning Routines",
          "My School Activities: Class Schedules and Study Habits",
        ],
        Informatika: [
          "Berpikir Komputasional: Algoritma, Optimasi Penjadwalan, dan Struktur Data",
          "Teknologi Informasi dan Komunikasi: Peramban, Surel, dan Manajemen Berkas",
          "Sistem Komputer: Perangkat Keras, Perangkat Lunak, dan Sistem Biner Dasar",
          "Analisis Data Dasar dengan Spreadsheet dan Pemrograman Visual (Scratch)",
        ],
        "Seni Budaya": [
          "Seni Rupa: Menggambar Flora, Fauna, dan Alam Benda dengan Teknik Arsir",
          "Seni Musik: Bernyanyi Unisono Lagu Daerah dengan Teknik Pernapasan",
          "Seni Tari: Unsur Gerak Tari (Ruang, Waktu, Tenaga) dalam Tari Tradisional",
          "Seni Teater: Teknik Dasar Olah Tubuh, Olah Suara, dan Imajinasi Pantomim",
        ],
        PJOK: [
          "Permainan Invasi (Sepak Bola/Bola Basket) dan Permainan Net (Bola Voli)",
          "Atletik (Lari Jarak Pendek & Tolak Peluru) serta Pencak Silat Dasar",
          "Aktivitas Kebugaran Jasmani dan Pola Makan Sehat Bergizi Seimbang",
        ],
      },
      "Kelas 8": {
        "Pendidikan Pancasila": [
          "Kedudukan dan Fungsi Pancasila sebagai Dasar Negara dan Pandangan Hidup",
          "Memahami Tata Urutan Peraturan Perundang-undangan Nasional dan UUD 1945",
          "Semangat Kebangkitan Nasional 1908 dan Sumpah Pemuda 1928",
          "Merawat Tradisi Kearifan Lokal dan Budaya Nasional di Era Digital",
        ],
        "Bahasa Indonesia": [
          "Teks Laporan Hasil Observasi Berbasis Pengamatan Lingkungan Sekolah",
          "Membuat Iklan, Slogan, dan Poster yang Komunikatif serta Etis",
          "Teks Artikel Ilmiah Populer dan Teks Ulasan Karya Fiksi/Film",
          "Menulis Teks Pidato Persuasif dan Mengapresiasi Puisi Modern",
        ],
        Matematika: [
          "Bilangan Berpangkat (Eksponen), Bentuk Akar, dan Notasi Ilmiah",
          "Teorema Pythagoras dan Aplikasinya dalam Masalah Jarak Nyata",
          "Persamaan Garis Lurus (Gradien) dan Sistem Persamaan Linear Dua Variabel (SPLDV)",
          "Relasi, Fungsi Linear, Statistika (Ukuran Pemusatan), dan Peluang Empirik",
        ],
        "IPA (Ilmu Pengetahuan Alam)": [
          "Pengenalan Sel, Mikroskop, dan Spesialisasi Sel Makhluk Hidup",
          "Fotosintesis, Klorofil, dan Hubungan Energi Ekosistem",
          "Struktur dan Fungsi Tubuh Manusia (Pencernaan, Peredaran Darah, Pernapasan, Ekskresi)",
          "Usaha, Energi, Pesawat Sederhana, Getaran, Gelombang, dan Cahaya/Alat Optik",
          "Unsur, Senyawa, Campuran, serta Struktur Bumi dan Mitigasi Gunung Api/Gempa",
        ],
        "IPS (Ilmu Pengetahuan Sosial)": [
          "Kondisi Geografis dan Pelestarian Sumber Daya Alam Indonesia",
          "Kemajemukan Masyarakat Indonesia, Mobilitas Sosial, dan Konflik/Integrasi",
          "Nasionalisme, Kedatangan Bangsa Barat, dan Pergerakan Kebangsaan Indonesia",
          "Pembangunan Perekonomian Indonesia, Perdagangan Antarpulau, dan Ekspor-Impor",
        ],
        "Bahasa Inggris": [
          "Celebrating Independence Day: Recounting School Competitions (Simple Past)",
          "Kindness Begins with Me: Reading Narrative Fables and Moral Messages",
          "Love Our World: Procedure Texts on Saving Water and Waste Management",
          "No Littering: Expressing Past Experiences and Environmental Campaigns",
        ],
        Informatika: [
          "Berpikir Komputasional: Fungsi, Himpunan Data, dan Representasi Graf/Pohon",
          "Jaringan Komputer dan Internet: Routing, Keamanan Akun, dan Phishing",
          "Analisis Data Menengah: Pencarian, Pengurutan, dan Visualisasi Grafik Spreadsheet",
          "Algoritma dan Pemrograman: Percabangan, Perulangan (Blockly/Python Dasar)",
        ],
        "Seni Budaya": [
          "Seni Rupa: Menggambar Perspektif, Ilustrasi, dan Desain Poster Manual/Digital",
          "Seni Musik: Memainkan Alat Musik Tradisional dan Lagu Daerah Nusantara",
          "Seni Tari: Pola Lantai dan Iringan Musik dalam Tari Kreasi Daerah",
          "Seni Teater: Penulisan Naskah Fragmen Sederhana dan Pemeranan Karakter",
        ],
        PJOK: [
          "Keterampilan Gerak Spesifik Sepak Bola, Bola Basket, Bola Voli, dan Bulu Tangkis",
          "Senam Lantai (Guling Belakang & Meroda) serta Gerak Berirama Berpasangan",
          "Pencegahan Pergaulan Bebas dan Bahaya Penyalahgunaan NAPZA bagi Remaja",
        ],
      },
      "Kelas 9": {
        "Pendidikan Pancasila": [
          "Dinamika Perwujudan Pancasila dan Hubungan Pancasila dengan UUD NRI 1945",
          "Hak dan Kewajiban Warga Negara dalam Kehidupan Berdemokrasi",
          "Menjaga Keutuhan Wilayah NKRI, Kemerdekaan Berpendapat, dan Bela Negara",
          "Peran Generasi Muda dalam Menjaga Kearifan Lokal di Tengah Globalisasi",
        ],
        "Bahasa Indonesia": [
          "Teks Laporan Percobaan Ilmiah dan Teks Rekaman Eksperimen",
          "Teks Diskusi: Menyajikan Argumen Pro dan Kontra secara Objektif",
          "Teks Tanggapan Kritis terhadap Karya Seni dan Fenomena Sosial",
          "Menulis Cerita Pendek (Cerpen) dan Teks Eksplanasi Fenomena Alam/Sosial",
        ],
        Matematika: [
          "Sistem Persamaan Linear Dua Variabel (SPLDV) Lanjutan dan Pemodelan Masalah",
          "Bangun Ruang Sisi Datar dan Sisi Lengkung (Tabung, Kerucut, Bola)",
          "Transformasi Geometri (Translasi, Refleksi, Rotasi, Dilatasi)",
          "Kesebangunan, Kekongruenan Bangun Datar, dan Peluang Kejadian",
        ],
        "IPA (Ilmu Pengetahuan Alam)": [
          "Pertumbuhan dan Perkembangan Makhluk Hidup serta Sistem Koordinasi & Reproduksi",
          "Tekanan Zat Padat, Cair (Hukum Pascal & Archimedes), dan Gas",
          "Listrik Statis, Listrik Dinamis (Hukum Ohm), Kemagnetan, dan Induksi",
          "Reaksi Kimia Sederhana (Asam-Basa), Pewarisan Sifat (Genetika), dan Bioteknologi",
          "Isu Lingkungan: Pemanasan Global, Krisis Energi, dan Ketahanan Pangan",
        ],
        "IPS (Ilmu Pengetahuan Sosial)": [
          "Perubahan Sosial Budaya dan Dampak Modernisasi-Globalisasi di Masyarakat",
          "Uang, Lembaga Keuangan, Literasi Finansial, dan Ekonomi Digital/E-Commerce",
          "Sejarah Indonesia: Masa Kemerdekaan, Orde Baru, hingga Era Reformasi",
          "Kerja Sama Internasional, Peta Sebaran Benua, dan Pembangunan Berkelanjutan",
        ],
        "Bahasa Inggris": [
          "Exploring Fauna of Indonesia: Report Texts Using Passive Voice",
          "Taking Trips: Recount Texts of Educational Tours and Historical Sites",
          "Journeys to the Fantasy Worlds: Narrative Texts and Indirect Speech",
          "Upcycling Used Materials: Descriptive & Procedure Texts for Sustainability",
        ],
        Informatika: [
          "Berpikir Komputasional Terpadu dan Struktur Data Lanjutan",
          "Integrasi Konten Aplikasi Perkantoran: Membuat Blog/Laporan Proyek Digital",
          "Pemrograman Modular (Prosedur/Fungsi) dan Proyek Koding Sederhana",
          "Keamanan Informasi, Jejak Digital, dan Etika Kecerdasan Artifisial",
        ],
        "Seni Budaya": [
          "Seni Rupa: Seni Lukis, Seni Patung, Seni Grafis, dan Penyelenggaraan Pameran Kelas",
          "Seni Musik: Aransemen Vokal Grup dan Ansambel Lagu Populer/Nusantara",
          "Seni Tari & Teater: Pementasan Karya Tari Kreasi atau Teater Modern Remaja",
        ],
        PJOK: [
          "Evaluasi Keterampilan Taktik Permainan Beregu (Invasi, Net, dan Lapangan)",
          "Penyusunan Program Latihan Kebugaran Jasmani Mandiri Remaja",
          "Pertolongan Pertama pada Kecelakaan (P3K) dan Keselamatan di Jalan/Air",
        ],
      },
    },
  },
  "SMA/MA": {
    "Fase E": {
      "Kelas 10": {
        "Pendidikan Pancasila": [
          "Menggali Ide Pendiri Bangsa dan Penerapan Pancasila dalam Kehidupan Bernegara",
          "Membangun Budaya Taat Hukum dan Hierarki Peraturan Perundang-undangan",
          "Merawat Harmoni dalam Keberagaman dan Menghindari Konflik Sosial",
          "Menjaga Keutuhan Wilayah NKRI dan Tantangan Geopolitik Abad ke-21",
        ],
        "Bahasa Indonesia": [
          "Teks Laporan Hasil Observasi (LHO) Berbasis Riset Lingkungan",
          "Teks Anekdot sebagai Kritik Sosial yang Santun dan Cerdas",
          "Teks Hikayat Klasik dan Mengalihwahanakannya ke Bentuk Cerpen Modern",
          "Teks Negosiasi Bisnis/Sosial dan Teks Biografi Tokoh Teladan",
        ],
        Matematika: [
          "Eksponen, Fungsi Eksponensial, Bentuk Akar, dan Logaritma",
          "Barisan dan Deret Aritmetika-Geometri serta Bunga Tunggal/Majemuk",
          "Sistem Persamaan dan Pertidaksamaan Linear Tiga Variabel",
          "Perbandingan Trigonometri pada Segitiga Siku-Siku dan Aplikasi Ketinggian",
          "Fungsi Kuadrat, Statistika Data Berkelompok, dan Peluang Kejadian Majemuk",
        ],
        "Bahasa Inggris": [
          "Great Athletes: Descriptive Texts on Health and Sportsmanship",
          "Sports Events: Recount Texts of Memorable Competitions",
          "Healthy Foods: Procedure Texts on Nutrition and Balanced Lifestyle",
          "Graffiti and Art: Analytical Exposition Texts Expressing Opinions",
        ],
        Fisika: [
          "Pengukuran Besaran Fisika, Alat Ukur Presisi, Ketidakpastian, dan Angka Penting",
          "Energi Terbarukan, Efisiensi Energi, dan Konversi Sumber Energi Alternatif",
          "Pemanasan Global: Efek Rumah Kaca, Perubahan Iklim, dan Mitigasi Berbasis Sains",
        ],
        Kimia: [
          "Kimia Hijau (Green Chemistry) dalam Pembangunan Berkelanjutan 2030",
          "Struktur Atom, Konfigurasi Elektron, dan Sistem Periodik Unsur",
          "Hukum-Hukum Dasar Kimia (Lavoisier, Proust, Dalton, Gay-Lussac, Avogadro)",
          "Persamaan Reaksi Kimia Sederhana dan Konsep Mol",
        ],
        Biologi: [
          "Virus: Struktur, Replikasi, Peranan Positif-Negatif, dan Vaksinasi",
          "Keanekaragaman Hayati Indonesia dan Strategi Konservasi Spesies Endemik",
          "Ekosistem, Jaring-Jaring Makanan, Daur Biogeokimia, dan Perubahan Lingkungan",
          "Inovasi Bioteknologi Konvensional dan Modern untuk Ketahanan Pangan",
        ],
        Ekonomi: [
          "Konsep Dasar Ilmu Ekonomi, Kelangkaan, Pilihan, dan Biaya Peluang",
          "Kegiatan Ekonomi, Sistem Ekonomi, serta Perilaku Produsen dan Konsumen",
          "Keseimbangan Pasar, Harga Pasar, Elastisitas, dan Struktur Pasar",
          "Lembaga Jasa Keuangan (Perbankan, Pasar Modal, OJK) dan Literasi Keuangan",
        ],
        Sosiologi: [
          "Fungsi Sosiologi untuk Mengenali Gejala Sosial dan Sejarah Lahirnya Sosiologi",
          "Individu, Kelompok, Nilai, Norma, dan Hubungan Sosial di Masyarakat",
          "Ragam Gejala Sosial (Kemiskinan, Kejahatan, Disorganisasi) dan Lembaga Sosial",
          "Penelitian Sosial Sederhana: Merancang Instrumen Observasi dan Wawancara",
        ],
        Geografi: [
          "Konsep Dasar Geografi, Prinsip, Pendekatan Keruangan, dan Keterampilan Peta/SIG",
          "Dinamika Litosfer (Tektonisme, Vulkanisme, Gempa Bumi) dan Mitigasi Bencana",
          "Dinamika Atmosfer (Cuaca, Iklim) dan Dinamika Hidrosfer (DAS & Kelautan)",
        ],
        Sejarah: [
          "Pengantar Ilmu Sejarah: Manusia, Ruang, Waktu, Diakronik, dan Sinkronik",
          "Asal-Usul Nenek Moyang Bangsa Indonesia dan Jalur Rempah Nusantara",
          "Perkembangan Kerajaan Hindu-Buddha dan Kesultanan Islam di Nusantara",
        ],
        Informatika: [
          "Berpikir Komputasional: Algoritma Pencarian (Searching) & Pengurutan (Sorting)",
          "Struktur Data Stack/Queue serta Integrasi Aplikasi Perkantoran Lanjut",
          "Jaringan Komputer, Internet, dan Dasar Pemrograman Teks (C/Python)",
          "Analisis Data Menggunakan Python/Spreadsheet dan Dampak Sosial Informatika",
        ],
        "Seni Budaya": [
          "Apresiasi dan Eksplorasi Karya Seni Rupa Dua Dimensi Berbasis Isu Lingkungan",
          "Eksplorasi Musik Nusantara Kontemporer dan Kreasi Tari/Teater Modern",
        ],
        PJOK: [
          "Analisis Keterampilan Gerak Permainan Invasi, Net, dan Lapangan",
          "Penyusunan Program Latihan Kebugaran Jasmani Pribadi dan Pencegahan Pergaulan Berisiko",
        ],
      },
    },
    "Fase F": {
      "Kelas 11": {
        "Pendidikan Pancasila": [
          "Keterkaitan Pancasila dengan UUD NRI Tahun 1945 dan Hak Konstitusional",
          "Praktik Demokrasi Pancasila, Kesadaran Hukum, dan Gerakan Antikorupsi",
          "Harmoni dalam Keberagaman dan Pencegahan Disintegrasi Bangsa",
        ],
        "Bahasa Indonesia": [
          "Teks Argumentasi tentang Ketahanan Pangan Lokal dan Isu Lingkungan",
          "Teks Berita Digital/Vlog yang Akurat dan Etika Bermedia Sosial",
          "Mengapresiasi Cerpen Bertema Sejarah dan Menulis Karya Ilmiah Sederhana",
          "Menganalisis dan Memanggungkan Naskah Drama Indonesia",
        ],
        Matematika: [
          "Fungsi Komposisi dan Fungsi Invers dalam Pemodelan Matematika",
          "Lingkaran: Garis Singgung, Busur, Tali Busur, dan Segi Empat Tali Busur",
          "Statistika Bivariat: Diagram Pencar (Scatter Plot), Regresi Linear, dan Korelasi",
          "Matriks, Polinomial (Suku Banyak), dan Vektor (Matematika Tingkat Lanjut)",
        ],
        "Bahasa Inggris": [
          "Legend and Digital Literacy: Reading Narrative Texts Critically",
          "Analytical Exposition Text: Healthy Environment and Plastic Waste Reduction",
          "Hortatory Exposition Text: Persuading Action on Digital Safety",
        ],
        Fisika: [
          "Vektor, Kinematika Gerak Dua Dimensi (Parabola & Melingkar), dan Dinamika Newton",
          "Fluida Statis (Tekanan Hidrostatis, Archimedes) dan Fluida Dinamis (Bernoulli)",
          "Gelombang Mekanik, Gelombang Bunyi, Gelombang Cahaya, dan Kalor-Termodinamika",
        ],
        Kimia: [
          "Ikatan Kimia, Bentuk Molekul, dan Gaya Antarmolekul",
          "Stoikiometri Reaksi, Termokimia (Entalpi & Hukum Hess), dan Laju Reaksi",
          "Kesetimbangan Kimia (Kc, Kp, Pergeseran Le Chatelier) dalam Industri",
        ],
        Biologi: [
          "Menjelajah Sel dan Pergerakan Zat melalui Membran (Difusi, Osmosis, Transpor Aktif)",
          "Proses Pengaturan pada Tumbuhan dan Sistem Pertukaran Zat pada Manusia",
          "Sistem Koordinasi (Saraf, Indra, Hormon), Reproduksi, dan Sistem Imun Tubuh",
        ],
        Ekonomi: [
          "Badan Usaha dalam Perekonomian Indonesia (BUMN, BUMS, BUMD, Koperasi)",
          "Pendapatan Nasional (PDB, PNB, Pendapatan Per Kapita) dan Kesenjangan Ekonomi",
          "Ketenagakerjaan, Pengangguran, Teori Uang, Indeks Harga, dan Inflasi",
          "Kebijakan Moneter Bank Indonesia dan Kebijakan Fiskal (APBN/APBD)",
        ],
        Sosiologi: [
          "Kelompok Sosial di Masyarakat, Partikularisme, dan Eksklusivisme Kelompok",
          "Permasalahan Sosial Akibat Pengelompokan Sosial (Ketimpangan & Kemiskinan)",
          "Konflik Sosial, Kekerasan, dan Metode Resolusi Konflik secara Damai",
          "Membangun Harmoni Sosial dan Inklusi Sosial di Tengah Kemajemukan",
        ],
        Geografi: [
          "Posisi Strategis Indonesia sebagai Poros Maritim Dunia",
          "Keanekaragaman Hayati, Persebaran Flora-Fauna, dan Sumber Daya Alam Berkelanjutan",
          "Lingkungan Hidup, Dinamika Kependudukan, serta Mitigasi & Adaptasi Bencana",
        ],
        Sejarah: [
          "Kolonialisme dan Perlawanan Bangsa Indonesia terhadap Penjajahan Eropa",
          "Pergerakan Kebangsaan Indonesia (Budi Utomo, Sarekat Islam, Sumpah Pemuda)",
          "Pendudukan Jepang di Indonesia hingga Proklamasi Kemerdekaan 17 Agustus 1945",
        ],
        Informatika: [
          "Strategi Algoritmik (Greedy, Rekursi) dan Pemrograman Modular C++/Python",
          "Basis Data Relasional (ERD & SQL) dan Pengembangan Aplikasi Web Sederhana",
          "Jaringan Komputer Lanjut, Keamanan Siber, dan Etika Pengembangan AI",
        ],
        "Seni Budaya": [
          "Merancang Pameran Karya Seni Rupa Kontemporer dan Kurasi Karya",
          "Produksi Musik Digital / Aransemen Pertunjukan Tari dan Teater Sekolah",
        ],
        PJOK: [
          "Strategi Penyerangan dan Pertahanan dalam Olahraga Beregu dan Bela Diri",
          "Pengukuran Komposisi Tubuh dan Perencanaan Aktivitas Fisik Teratur",
        ],
      },
      "Kelas 12": {
        "Pendidikan Pancasila": [
          "Berpancasila dalam Kehidupan Global dan Era Kecerdasan Artifisial",
          "Menegakkan Demokrasi, Hak Asasi Manusia, dan Integritas Kebangsaan",
          "Peran Aktif Indonesia dalam Perdamaian Dunia dan Kerja Sama Internasional",
        ],
        "Bahasa Indonesia": [
          "Menulis Esai Kritis dan Artikel Opini Isu Kewirausahaan/Teknologi",
          "Menyusun Proposal Kegiatan/Penelitian dan Karya Tulis Ilmiah Lengkap",
          "Menganalisis Novel Indonesia Modern dan Resensi Buku Fiksi/Nonfiksi",
        ],
        Matematika: [
          "Transformasi Fungsi dan Geometri (Busur, Luas Juring, Kombinatorik)",
          "Peluang Kejadian Bersyarat, Permutasi, dan Kombinasi",
          "Limit Fungsi, Turunan (Diferensial), dan Integral Aplikasi (Tingkat Lanjut)",
          "Distribusi Binomial dan Distribusi Normal dalam Analisis Data",
        ],
        "Bahasa Inggris": [
          "Discussion Text: Pros and Cons of Artificial Intelligence and Digital Payments",
          "Argumentative Text: Defending Opinions on Sustainable Development",
          "Application Letters, Curriculum Vitae (CV), and Job Interview Preparation",
        ],
        Fisika: [
          "Listrik Statis, Kapasitor, Listrik Arus Searah (DC), dan Medan Magnet",
          "Induksi Elektromagnetik (Hukum Faraday-Lenz) dan Arus Bolak-Balik (AC)",
          "Fisika Modern: Relativitas, Efek Fotolistrik, dan Gejala Kuantum",
        ],
        Kimia: [
          "Larutan Asam-Basa, pH, Larutan Penyangga (Buffer), Hidrolisis, dan Titrasi",
          "Sifat Koligatif Larutan dan Elektrokimia (Sel Volta, Elektrolisis, Korosi)",
          "Senyawa Karbon (Alkana hingga Ester), Polimer, dan Makromolekul",
        ],
        Biologi: [
          "Enzim dan Metabolisme Sel (Respirasi Aerob-Anaerob & Fotosintesis)",
          "Materi Genetik (DNA, RNA, Sintesis Protein) dan Pembelahan Sel (Mitosis/Meiosis)",
          "Hukum Mendel, Penyimpangan Semu, Mutasi, Evolusi, dan Bioteknologi Modern",
        ],
        Ekonomi: [
          "Pertumbuhan Ekonomi, Pembangunan Ekonomi, dan Ekonomi Digital",
          "Perdagangan Internasional, Neraca Pembayaran, dan Kurs Valuta Asing",
          "Siklus Akuntansi Perusahaan Jasa dan Dagang serta Laporan Keuangan",
        ],
        Sosiologi: [
          "Perubahan Sosial di Tengah Arus Globalisasi dan Masyarakat Digital",
          "Globalisasi, Konsumerisme, dan Strategi Penguatan Identitas Budaya Lokal",
          "Pemberdayaan Komunitas Berbasis Kearifan Lokal dan Evaluasi Program Sosial",
        ],
        Geografi: [
          "Pengembangan Wilayah, Tata Ruang, dan Interaksi Desa-Kota",
          "Pemanfaatan Peta, Penginderaan Jauh, dan Sistem Informasi Geografis (SIG)",
          "Kerja Sama Negara Maju dan Negara Berkembang menuju Pembangunan Berkelanjutan",
        ],
        Sejarah: [
          "Perjuangan Mempertahankan Kemerdekaan Indonesia (1945–1950)",
          "Dinamika Demokrasi Liberal dan Demokrasi Terpimpin (1950–1965)",
          "Pemerintahan Orde Baru, Gerakan Reformasi 1998, hingga Era Kontemporer",
        ],
        Informatika: [
          "Pemrograman Berbasis Objek / Pengembangan Aplikasi Web Full-Stack Sederhana",
          "Pengolahan Data Besar (Data Science Dasar) dan Pengenalan Machine Learning",
          "Proyek Lintas Disiplin Informatika untuk Pemecahan Masalah Masyarakat",
        ],
        "Seni Budaya": [
          "Portofolio Karya Seni Rupa untuk Karier Kreatif dan Kritik Seni",
          "Manajemen Produksi Pertunjukan Musik, Tari, atau Teater Skala Sekolah",
        ],
        PJOK: [
          "Manajemen Penyelenggaraan Turnamen Olahraga dan Perwasitan Dasar",
          "Evaluasi Gaya Hidup Aktif Sepanjang Hayat dan Kesehatan Mental Remaja",
        ],
      },
    },
  },
  "SMK/MAK": {
    "Fase E": {
      "Kelas 10": {
        "Pendidikan Pancasila": [
          "Nilai Pancasila sebagai Etika Profesi dan Integritas Calon Tenaga Kerja",
          "Kesadaran Hukum, Hak-Kewajiban Kerja, dan Tata Tertib Industri",
          "Harmoni Keberagaman Budaya Kerja dan Kolaborasi Tim di Industri",
        ],
        "Bahasa Indonesia": [
          "Teks Laporan Hasil Observasi Lingkungan Bengkel dan Dunia Industri",
          "Teks Prosedur Keselamatan dan Kesehatan Kerja (K3) serta SOP Alat",
          "Teks Negosiasi Penawaran Jasa/Produk dan Komunikasi Bisnis Santun",
          "Teks Biografi Tokoh Wirausahawan dan Profesional Industri Inspiratif",
        ],
        Matematika: [
          "Eksponen dan Logaritma dalam Perhitungan Teknik, Bisnis, dan Keuangan",
          "Barisan dan Deret untuk Perhitungan Bunga Tunggal, Majemuk, dan Penyusutan",
          "Sistem Persamaan dan Pertidaksamaan Linear (Optimasi Produksi Sederhana)",
          "Perbandingan Trigonometri Terapan dalam Pengukuran Sudut dan Tinggi",
          "Statistika Data Industri dan Peluang dalam Pengendalian Mutu",
        ],
        "Bahasa Inggris": [
          "Introducing Self and Describing Vocational Workshop Tools & Facilities",
          "Procedure Text: Explaining Standard Operating Procedures (SOP) Safely",
          "Descriptive Text: Promoting Local Tourism, Products, and Services",
          "Recount Text: Reporting Practical Learning Experiences at School Workshop",
        ],
        "Projek IPAS": [
          "Makhluk Hidup dan Lingkungannya: Analisis Pengelolaan Limbah Bengkel/Usaha",
          "Zat dan Perubahannya: Pemilihan Material Aman dan Uji Sifat Bahan Industri",
          "Energi dan Perubahannya: Audit Energi Sederhana dan Teknologi Energi Terbarukan",
          "Bumi dan Antariksa: Mitigasi Bencana dan Keselamatan Lingkungan Kerja",
          "Interaksi Sosial, Komunikasi Efektif, dan Perilaku Ekonomi Produktif",
        ],
        Informatika: [
          "Berpikir Komputasional dan Analisis Data Operasional Menggunakan Spreadsheet",
          "Pembuatan Dokumen Teknis Profesional, Pitch Deck, dan Kolaborasi Cloud",
          "Jaringan Komputer Dasar, Keamanan Data Kerja, dan Etika Digital Industri",
          "Algoritma dan Pemrograman Dasar untuk Otomasi Sederhana",
        ],
        Sejarah: [
          "Jalur Rempah, Perdagangan Nusantara, dan Perkembangan Teknologi Masa Lalu",
          "Sejarah Industrialisasi di Indonesia dan Peran Pendidikan Vokasi SMK",
        ],
        "Seni Budaya": [
          "Desain Grafis Komersial, Tata Letak Kemasan Produk, dan Estetika Ruang Kerja",
          "Apresiasi Budaya Lokal sebagai Inspirasi Produk Kreatif Vokasi",
        ],
        PJOK: [
          "Kebugaran Jasmani Penunjang Stamina Kerja Industri (Ergonomi & Postur Aman)",
          "Permainan Olahraga Beregu untuk Penguatan Kerja Sama Tim dan Sportivitas",
        ],
        "Dasar-Dasar Program Keahlian": [
          "Proses Bisnis Menyeluruh Bidang Keahlian di Dunia Usaha dan Dunia Industri (DUDI)",
          "Perkembangan Teknologi Mutakhir (Industri 4.0 & Green Jobs) pada Program Keahlian",
          "Profesi, Kewirausahaan (Technopreneur), dan Peluang Usaha Lulusan SMK",
          "Penerapan Keselamatan dan Kesehatan Kerja Lingkungan Hidup (K3LH) dan Budaya 5R",
          "Penggunaan, Kalibrasi, dan Perawatan Peralatan Kerja Dasar Sesuai SOP",
        ],
      },
    },
    "Fase F": {
      "Kelas 11": {
        "Pendidikan Pancasila": [
          "Implementasi Nilai Pancasila dalam Etika Profesi dan Tanggung Jawab Sosial Usaha",
          "Praktik Demokrasi, Antikorupsi, dan Integritas di Lingkungan Kerja",
        ],
        "Bahasa Indonesia": [
          "Teks Argumentasi Inovasi Produk Vokasi dan Ketahanan Ekonomi Lokal",
          "Menyusun Proposal Usaha, Proposal Projek TeFa, dan Laporan Hasil Observasi Industri",
          "Menganalisis Teks Berita Industri dan Menyajikan Presentasi Profesional",
        ],
        Matematika: [
          "Matriks dan Vektor Terapan dalam Pemodelan Data dan Desain Teknis",
          "Geometri Lingkaran dan Transformasi pada Rancangan Teknik/Produk",
          "Statistika Bivariat (Regresi & Korelasi) untuk Analisis Data Penjualan/Mutu",
        ],
        "Bahasa Inggris": [
          "Analytical Exposition: Workplace Safety Culture and Eco-Friendly Industry",
          "Business Correspondence: Emails, Inquiry Letters, and Customer Service",
          "Technical Manuals and Standard Operating Procedures (SOP) in English",
        ],
        Sejarah: [
          "Kolonialisme, Perkembangan Infrastruktur Ekonomi, dan Kebangkitan Nasional",
          "Perjuangan Kemerdekaan 1945 dan Pembangunan Industri Nasional",
        ],
        "Konsentrasi Keahlian": [
          "Perencanaan Kerja dan Penyiapan Peralatan/Bahan Sesuai Standar Industri (SOP)",
          "Eksekusi Layanan / Produksi Berbasis Teaching Factory (TeFa) Skala Menengah",
          "Pengujian Kualitas (Quality Control), Troubleshooting, dan Kalibrasi Hasil Kerja",
          "Dokumentasi Teknis, Pelaporan Pekerjaan, dan Etika Layanan Pelanggan",
        ],
        "Projek Kreatif dan Kewirausahaan (PKK)": [
          "Analisis Peluang Usaha Berbasis Masalah Konsumen (Design Thinking) & BMC",
          "Perancangan Desain Produk/Jasa, Prototipe (Prototype), dan Uji Kelayakan Pasar",
          "Perhitungan Harga Pokok Produksi (HPP), Break Even Point (BEP), dan Harga Jual",
          "Desain Kemasan Produk Kreatif dan Pengurusan Hak Kekayaan Intelektual (HaKI)",
        ],
        Informatika: [
          "Pengolahan Basis Data Bisnis (SQL) dan Otomasi Laporan Operasional",
          "Pemanfaatan Kecerdasan Artifisial untuk Produktivitas Kerja Vokasi",
        ],
        PJOK: [
          "Pencegahan Penyakit Akibat Kerja, Ergonomi, dan Kebugaran Jasmani Aktif",
          "Permainan Olahraga Beregu dan Manajemen Kebugaran Calon Tenaga Kerja",
        ],
      },
      "Kelas 12": {
        "Pendidikan Pancasila": [
          "Kewarganegaraan Global, Etika Profesi Internasional, dan Bela Negara",
          "Peran Wirausahawan Muda Pancasila dalam Pembangunan Ekonomi Berkelanjutan",
        ],
        "Bahasa Indonesia": [
          "Menulis Surat Lamaran Kerja, Daftar Riwayat Hidup (CV), dan Simulasi Wawancara",
          "Menyusun Laporan Praktik Kerja Lapangan (PKL) dan Artikel Karya Ilmiah Vokasi",
          "Strategi Komunikasi Negosiasi dan Presentasi Pitching di Hadapan Mitra Industri",
        ],
        Matematika: [
          "Limit, Turunan, dan Optimasi Biaya/Keuntungan Produksi Usaha",
          "Peluang Kejadian Majemuk dan Pengambilan Keputusan Berbasis Risiko Usaha",
        ],
        "Bahasa Inggris": [
          "Writing Job Application Letters, Resumes, and Practicing Job Interviews",
          "Presenting Product/Service Proposals and PKL Reports in English",
          "Handling Customer Complaints and Professional Negotiation Phrases",
        ],
        "Konsentrasi Keahlian": [
          "Persiapan dan Pembekalan Praktik Kerja Lapangan (PKL): Target Kompetensi & Etika DUDI",
          "Penyelesaian Projek Riil Pelanggan / Teaching Factory Tingkat Lanjut",
          "Simulasi dan Persiapan Uji Kompetensi Keahlian (UKK) Sesuai Skema LSP/Industri",
          "Perawatan Berkala, Layanan Purna Jual, dan Audit Mutu Hasil Kerja",
        ],
        "Projek Kreatif dan Kewirausahaan (PKK)": [
          "Produksi Massal Terkendali dan Pengendalian Mutu Produk/Jasa",
          "Strategi Pemasaran Digital (Omnichannel Marketing) dan Content Branding Produk",
          "Penyusunan Laporan Keuangan Usaha Mikro (Laba Rugi & Arus Kas) serta Evaluasi Usaha",
          "Presentasi Pitching Bisnis di Hadapan Mitra Industri/Konsumen",
        ],
        Informatika: [
          "Pemanfaatan E-Commerce, Analitik Penjualan Digital, dan Keamanan Transaksi",
          "Proyek Integrasi Sistem Informasi Kerja untuk Mitra Usaha/Sekolah",
        ],
      },
    },
  },
};

export function getMapelForJenjangFase(jenjang: Jenjang, fase: string, kelas?: string): string[] {
  const faseData = KURIKULUM_MERDEKA_TOPICS[jenjang]?.[fase];
  if (faseData) {
    const targetKelas = kelas && faseData[kelas] ? kelas : Object.keys(faseData)[0];
    if (targetKelas && faseData[targetKelas]) {
      return Object.keys(faseData[targetKelas]);
    }
  }
  return JENJANG_CONFIG[jenjang].mapel;
}

export function getMateriPokokOptions(
  jenjang: Jenjang,
  fase: string,
  kelas: string,
  mapel: string
): string[] {
  const byKelas = KURIKULUM_MERDEKA_TOPICS[jenjang]?.[fase]?.[kelas];
  if (byKelas?.[mapel]) {
    return byKelas[mapel];
  }
  const faseData = KURIKULUM_MERDEKA_TOPICS[jenjang]?.[fase];
  if (faseData) {
    for (const k of Object.keys(faseData)) {
      if (faseData[k]?.[mapel]) {
        return faseData[k][mapel];
      }
    }
  }
  return [];
}

const MAPEL_DIMENSI_DEFAULTS: Record<string, string[]> = {
  "Pendidikan Pancasila": [
    "Keimanan dan Ketakwaan terhadap Tuhan YME",
    "Kewargaan",
    "Penalaran Kritis",
    "Kolaborasi",
  ],
  "Bahasa Indonesia": [
    "Komunikasi",
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
  ],
  "Bahasa Inggris": [
    "Komunikasi",
    "Kolaborasi",
    "Kewargaan",
    "Kemandirian",
  ],
  Matematika: [
    "Penalaran Kritis",
    "Kemandirian",
    "Kreativitas",
    "Kolaborasi",
  ],
  "IPAS (Ilmu Pengetahuan Alam dan Sosial)": [
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
    "Keimanan dan Ketakwaan terhadap Tuhan YME",
  ],
  "IPA (Ilmu Pengetahuan Alam)": [
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
    "Keimanan dan Ketakwaan terhadap Tuhan YME",
  ],
  "Projek IPAS": [
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
    "Kesehatan",
  ],
  Fisika: [
    "Penalaran Kritis",
    "Kreativitas",
    "Kemandirian",
    "Kolaborasi",
  ],
  Kimia: [
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
    "Kesehatan",
  ],
  Biologi: [
    "Penalaran Kritis",
    "Kesehatan",
    "Keimanan dan Ketakwaan terhadap Tuhan YME",
    "Kolaborasi",
  ],
  "IPS (Ilmu Pengetahuan Sosial)": [
    "Kewargaan",
    "Penalaran Kritis",
    "Kolaborasi",
    "Komunikasi",
  ],
  Ekonomi: [
    "Penalaran Kritis",
    "Kemandirian",
    "Kewargaan",
    "Komunikasi",
  ],
  Sosiologi: [
    "Kewargaan",
    "Kolaborasi",
    "Penalaran Kritis",
    "Komunikasi",
  ],
  Geografi: [
    "Kewargaan",
    "Penalaran Kritis",
    "Keimanan dan Ketakwaan terhadap Tuhan YME",
    "Kolaborasi",
  ],
  Sejarah: [
    "Kewargaan",
    "Penalaran Kritis",
    "Komunikasi",
    "Keimanan dan Ketakwaan terhadap Tuhan YME",
  ],
  Informatika: [
    "Penalaran Kritis",
    "Kreativitas",
    "Kemandirian",
    "Kolaborasi",
  ],
  "Seni Rupa": [
    "Kreativitas",
    "Komunikasi",
    "Kemandirian",
    "Kewargaan",
  ],
  "Seni Musik": [
    "Kreativitas",
    "Kolaborasi",
    "Komunikasi",
    "Kewargaan",
  ],
  "Seni Budaya": [
    "Kreativitas",
    "Kewargaan",
    "Kolaborasi",
    "Komunikasi",
  ],
  PJOK: [
    "Kesehatan",
    "Kolaborasi",
    "Kemandirian",
    "Komunikasi",
  ],
  "Dasar-Dasar Program Keahlian": [
    "Kemandirian",
    "Kolaborasi",
    "Penalaran Kritis",
    "Kesehatan",
  ],
  "Konsentrasi Keahlian": [
    "Kemandirian",
    "Penalaran Kritis",
    "Kolaborasi",
    "Komunikasi",
  ],
  "Projek Kreatif dan Kewirausahaan (PKK)": [
    "Kreativitas",
    "Kemandirian",
    "Kolaborasi",
    "Komunikasi",
  ],
};

const TOPIC_KEYWORD_RULES: { dimensi: string; pattern: RegExp }[] = [
  {
    dimensi: "Kesehatan",
    pattern:
      /kesehatan|gizi|makanan|olahraga|kebugaran|jasmani|penyakit|pernapasan|pencernaan|peredaran|ekskresi|reproduksi|imun|virus|vaksin|k3|k3lh|ergonomi|p3k|napza|rokok|kebersihan|cuci tangan|gosok gigi|istirahat|cedera|senam|atletik|bola|pencak silat|limbah|sanitasi|sampah|healthy|nutrition/i,
  },
  {
    dimensi: "Keimanan dan Ketakwaan terhadap Tuhan YME",
    pattern:
      /keimanan|ketakwaan|agama|akhlak|moral|syukur|ciptaan|ekosistem|makhluk hidup|tata surya|keanekaragaman hayati|ketuhanan|jujur|integritas|toleransi|fable|moral lessons/i,
  },
  {
    dimensi: "Kewargaan",
    pattern:
      /pancasila|uud|konstitusi|nkri|bhinneka|gotong royong|warga|masyarakat|negara|demokrasi|musyawarah|norma|hukum|hak|kewajiban|bela negara|asean|internasional|globalisasi|kearifan lokal|nusantara|daerah|budaya|kerajaan|kemerdekaan|proklamasi|sejarah|antikorupsi|mitigasi bencana|pemanasan global|iklim|ekologi|lingkungan/i,
  },
  {
    dimensi: "Penalaran Kritis",
    pattern:
      /analisis|menganalisis|riset|observasi|eksperimen|percobaan|pecahan|aljabar|persamaan|fungsi|geometri|statistika|peluang|algoritma|logaritma|eksponen|stoikiometri|hukum|teorema|evaluasi|kritis|argumentasi|fakta|opini|hoaks|troubleshooting|uji kelayakan|data|risiko|optimasi|kalor|listrik|energi/i,
  },
  {
    dimensi: "Kreativitas",
    pattern:
      /kreatif|kreativitas|karya|desain|merancang|mencipta|menggambar|kolase|melukis|patung|anyaman|komik|poster|puisi|cerpen|fantasi|aransemen|prototipe|prototype|inovasi|daur ulang|upcycling|tefa|produk|kemasan|branding|iklan|konten|rekayasa|aplikasi|art/i,
  },
  {
    dimensi: "Kolaborasi",
    pattern:
      /kolaborasi|kelompok|beregu|kerja sama|gotong royong|musyawarah|paduan suara|ansambel|diskusi|kemitraan|tim|pameran|pementasan|organisasi|interaksi sosial|berpasangan/i,
  },
  {
    dimensi: "Kemandirian",
    pattern:
      /mandiri|kemandirian|pribadi|individu|portofolio|lamaran kerja|cv|pkl|wirausaha|kewirausahaan|technopreneur|literasi finansial|menabung|manajemen|program latihan|karier|uji kompetensi|ukk|kalibrasi|perawatan|resumes|job/i,
  },
  {
    dimensi: "Komunikasi",
    pattern:
      /komunikasi|pidato|debat|wawancara|presentasi|negosiasi|surat|surel|email|laporan|cerita|berpendapat|santun|menyampaikan|pitching|interview|customer|pelanggan|korespondensi|berita|greetings|speaking|telling|describing|exposition/i,
  },
];

export function getRecommendedDimensiProfilLulusan(
  jenjang: Jenjang,
  mapel: string,
  topik: string,
  modelPembelajaran?: string
): string[] {
  const scores = new Map<string, number>();
  DIMENSI_PROFIL_LULUSAN.forEach((d) => scores.set(d, 0));

  const mapelDefaults = MAPEL_DIMENSI_DEFAULTS[mapel] ?? [
    "Penalaran Kritis",
    "Kolaborasi",
    "Komunikasi",
    "Kemandirian",
  ];
  mapelDefaults.forEach((dimensi, index) => {
    scores.set(dimensi, (scores.get(dimensi) ?? 0) + (5 - index));
  });

  const cleanTopik = topik.trim();
  if (cleanTopik) {
    for (const rule of TOPIC_KEYWORD_RULES) {
      if (rule.pattern.test(cleanTopik)) {
        scores.set(rule.dimensi, (scores.get(rule.dimensi) ?? 0) + 5);
      }
    }
  }

  if (modelPembelajaran) {
    if (/Project Based Learning|PjBL/i.test(modelPembelajaran)) {
      scores.set("Kreativitas", (scores.get("Kreativitas") ?? 0) + 2);
      scores.set("Kolaborasi", (scores.get("Kolaborasi") ?? 0) + 2);
    } else if (/Problem Based Learning|PBL/i.test(modelPembelajaran)) {
      scores.set("Penalaran Kritis", (scores.get("Penalaran Kritis") ?? 0) + 2);
      scores.set("Kolaborasi", (scores.get("Kolaborasi") ?? 0) + 1);
    } else if (/Inquiry|Discovery/i.test(modelPembelajaran)) {
      scores.set("Penalaran Kritis", (scores.get("Penalaran Kritis") ?? 0) + 2);
      scores.set("Kemandirian", (scores.get("Kemandirian") ?? 0) + 2);
    } else if (/Cooperative/i.test(modelPembelajaran)) {
      scores.set("Kolaborasi", (scores.get("Kolaborasi") ?? 0) + 2);
      scores.set("Komunikasi", (scores.get("Komunikasi") ?? 0) + 2);
    } else if (/Contextual|CTL/i.test(modelPembelajaran)) {
      scores.set("Kewargaan", (scores.get("Kewargaan") ?? 0) + 2);
      scores.set("Kemandirian", (scores.get("Kemandirian") ?? 0) + 1);
    }
  }

  if (jenjang === "SMK/MAK") {
    scores.set("Kemandirian", (scores.get("Kemandirian") ?? 0) + 1);
  }

  const ranked = [...DIMENSI_PROFIL_LULUSAN]
    .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0))
    .slice(0, 4);

  return DIMENSI_PROFIL_LULUSAN.filter((d) => ranked.includes(d));
}

export function getRecommendedMediaAjar(
  jenjang: Jenjang,
  mapel: string,
  topik: string,
  modelPembelajaran?: string
): MediaAjarData {
  const cleanTopik = topik.trim() || mapel;
  const lower = `${mapel} ${cleanTopik}`.toLowerCase();

  let mediaUtama: string[] = [];
  let alatDanBahanPendukung: string[] = [];
  let sumberDigital = "";

  if (/matematika/i.test(mapel)) {
    if (jenjang === "SD/MI") {
      mediaUtama = [
        `Benda konkret dan kartu bilangan kontekstual untuk materi ${cleanTopik}`,
        "Papan flanel / blok nilai tempat & alat peraga bangun datar sederhana",
        "Slide visual bergambar bertahap serta LKPD tercetak",
      ];
      alatDanBahanPendukung = ["Stik es krim / kancing hitung", "Penggaris & kertas berpetak", "Spidol warna & kartu soal"];
      sumberDigital = "Portal Buku Kemendikbudristek (buku.kemdikbud.go.id) & Mathigon Polypad manipulatif virtual";
    } else {
      mediaUtama = [
        `Simulasi grafik & geometri interaktif (GeoGebra / Desmos) untuk ${cleanTopik}`,
        "Kartu masalah kontekstual (problem cards) dan tabel pengumpulan data",
        "Salindia pemodelan langkah demi langkah",
      ];
      alatDanBahanPendukung = ["Kertas milimeter blok / berpetak", "Penggaris, jangka, & busur derajat", "Papan tulis dan kertas plano kelompok"];
      sumberDigital = "GeoGebra Classic / Desmos Graphing & Platform Merdeka Mengajar (PMM)";
    }
  } else if (/ipa|ipas|fisika|kimia|biologi/i.test(mapel)) {
    if (/listrik|magnet|energi|kalor|gaya|gelombang|cahaya|optik|fluida|atom|asam|reaksi/i.test(lower)) {
      mediaUtama = [
        `Kit percobaan / demonstrasi sederhana dan simulasi virtual PhET terkait ${cleanTopik}`,
        "Diagram alur fenomena & kartu hipotesis ilmiah",
        "Video pendek fenomena alam sehari-hari sebagai pemantik",
      ];
      alatDanBahanPendukung = ["Alat ukur sederhana / bahan ramah lingkungan sekitar", "Baterai, kabel, termometer, atau gelas ukur sesuai praktikum", "Lembar observasi eksperimen & jas lab/K3"];
      sumberDigital = "PhET Interactive Simulations (phet.colorado.edu) & Rumah Belajar Kemendikbud";
    } else {
      mediaUtama = [
        `Spesimen nyata / model anatomi / gambar struktur untuk ${cleanTopik}`,
        "Video observasi ekosistem atau proses biologis berdurasi 3–5 menit",
        "Peta konsep interaktif & kartu klasifikasi",
      ];
      alatDanBahanPendukung = ["Lup / mikroskop sekolah atau gambar pembesaran", "Kertas plano, spidol, & kartu identifikasi", "Bahan amatan alami dari lingkungan sekolah"];
      sumberDigital = "Portal Rumah Belajar Kemendikbudristek & Laboratorium Maya IPA";
    }
  } else if (/bahasa indonesia|bahasa inggris/i.test(mapel)) {
    mediaUtama = [
      `Teks otentik (cetak & audio/video pendek) bertema ${cleanTopik}`,
      "Kartu kosakata / struktur teks dan bagan kerangka tulisan (graphic organizer)",
      "Salindia contoh analisis teks serta rekaman pelafalan / pidato model",
    ];
    alatDanBahanPendukung = ["Kamus Besar Bahasa Indonesia (KBBI) / Kamus Dwibahasa", "Kertas sticky notes untuk peer-feedback", "Papan pajang karya siswa (gallery walk)"];
    sumberDigital = /inggris/i.test(mapel)
      ? "Audio/Video Edukatif Bahasa Inggris, Kamus Daring Cambridge, & Buku Siswa Kurikulum Merdeka"
      : "KBBI Daring Kemendikbud (kbbi.kemdikbud.go.id), EYD V, & Portal Bacaan Jakarta/Kemendikbud";
  } else if (/pancasila|ips|sosiologi|geografi|sejarah|ekonomi/i.test(mapel)) {
    mediaUtama = [
      `Infografis, studi kasus berita/peristiwa aktual, dan video dokumenter singkat tentang ${cleanTopik}`,
      /geografi|ips|sejarah/i.test(mapel)
        ? "Peta tematik Indonesia/dunia, lini masa sejarah, & citra satelit"
        : "Kartu peran (role-play) musyawarah & studi kasus sosial-ekonomi",
      "Lembar analisis sebab-akibat dan peta pemikiran kelompok",
    ];
    alatDanBahanPendukung = ["Atlas / peta dinding atau cetakan wilayah", "Kertas plano & kartu argumen", "Data statistik sederhana BPS / berita terkurasi"];
    sumberDigital = "Google Earth / Peta Ina-Geoportal, Portal Sejarah & BPS, serta Buku Teks Utama Kurikulum Merdeka";
  } else if (/informatika/i.test(mapel)) {
    mediaUtama = [
      `Perangkat lunak praktik langsung (Scratch / Blockly / Python / Spreadsheet / SQLite) untuk ${cleanTopik}`,
      "Kartu aktivitas unplugged (berpikir komputasional tanpa komputer)",
      "Diagram alir (flowchart) & contoh kode/data nyata",
    ];
    alatDanBahanPendukung = ["Komputer/laptop/tablet kelas atau lembar kerja unplugged", "Proyektor LCD & file dataset latihan", "Papan tulis untuk penelusuran algoritma (tracing)"];
    sumberDigital = "Scratch MIT / Blockly Games / Python Sandbox & Modul Informatika BSKAP Kemendikbudristek";
  } else if (/seni/i.test(mapel)) {
    mediaUtama = [
      `Contoh karya referensi visual/audio Nusantara dan mancanegara untuk ${cleanTopik}`,
      /musik/i.test(mapel)
        ? "Rekaman audio lagu daerah/nasional, partitur notasi angka/balok, & alat musik ritmis/melodis"
        : "Portofolio teknik berkarya & video demonstrasi langkah pembuatan karya",
      "Rubrik apresiasi karya di ruang kelas",
    ];
    alatDanBahanPendukung = /musik/i.test(mapel)
      ? ["Pianika, rekorder, atau alat musik ritmis sederhana", "Speaker kelas & metronom digital"]
      : ["Kertas gambar/karton, krayon/cat air, gunting, lem, & bahan daur ulang", "Media pamer karya kelas"];
    sumberDigital = "Galeri Nasional Indonesia Daring & Kanal Budaya Kemendikbudristek";
  } else if (/pjok/i.test(mapel)) {
    mediaUtama = [
      `Demonstrasi langsung guru dan video model teknik gerak aman untuk ${cleanTopik}`,
      "Poster urutan pemanasan, keselamatan olahraga, & lintasan aktivitas",
      "Kartu tantangan kebugaran / taktik permainan kelompok",
    ];
    alatDanBahanPendukung = ["Peluit, stopwatch, & kerucut pembatas (cone)", "Bola/matras/peralatan olahraga yang tersedia di sekolah", "Kotak P3K lapangan & air minum siswa"];
    sumberDigital = "Video Pembelajaran PJOK Kemendikbudristek & Panduan Kebugaran Jasmani Sekolah";
  } else if (jenjang === "SMK/MAK" || /keahlian|pkk|kewirausahaan/i.test(mapel)) {
    mediaUtama = [
      `Job sheet / Standard Operating Procedure (SOP) industri & K3LH untuk ${cleanTopik}`,
      "Contoh produk/prototipe nyata atau studi kasus dunia usaha/dunia industri (DUDI)",
      "Template kanvas model bisnis (BMC) / lembar kontrol kualitas (QC)",
    ];
    alatDanBahanPendukung = ["Peralatan praktik bengkel/lab program keahlian & APD K3", "Alat ukur/kalibrasi atau perangkat lunak vokasi", "Lembar inspeksi mutu hasil kerja"];
    sumberDigital = "Platform Teaching Factory (TeFa), Portal Vokasi Kemendikbudristek, & Referensi Standar SKKNI/DUDI";
  } else {
    mediaUtama = [
      `Media visual interaktif dan contoh kasus kontekstual terkait ${cleanTopik}`,
      "Video pemantik berdurasi 3–5 menit dan LKPD terbimbing",
      "Peta konsep ringkasan materi",
    ];
    alatDanBahanPendukung = ["Proyektor / papan tulis kelas", "Kertas plano & spidol diskusi kelompok"];
    sumberDigital = "Buku Teks Utama Kurikulum Merdeka & Platform Merdeka Mengajar";
  }

  const modelHint = modelPembelajaran
    ? ` Selaras dengan sintaks ${modelPembelajaran}, media digunakan untuk memicu eksplorasi bermakna pada tahap Memahami dan kolaborasi solusi pada tahap Mengaplikasi.`
    : "";

  return {
    mediaUtama,
    alatDanBahanPendukung,
    sumberDigital,
    panduanPenggunaan: `Media ajar untuk materi "${cleanTopik}" (${mapel} · ${jenjang}) disiapkan sebelum kegiatan inti agar peserta didik mengamati langsung fenomena atau praktik nyata.${modelHint}`,
  };
}


