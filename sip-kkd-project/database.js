// --- DATABASE AWAL (DEFAULT) ---
// Data ini akan dimuat jika belum ada data di penyimpanan browser (Local Storage)

window.SIP_DATA = {
    // 1. DATA WILAYAH (PROVINSI & KKD)
    provinces: [
        { 
            id: 1, name: 'Sulawesi Selatan', active: true, kkds: [],
            description: 'Pusat konservasi terumbu karang di Kepulauan Spermonde dan Takabonerate.' 
        },
        { 
            id: 2, name: 'Sulawesi Utara', active: true, kkds: [],
            description: 'Terkenal dengan Taman Nasional Bunaken dan keanekaragaman hayati laut Lembeh.' 
        },
        { 
            id: 3, name: 'Gorontalo', active: true, kkds: [],
            description: 'Habitat Hiu Paus dan konservasi pesisir Teluk Tomini yang terjaga.' 
        },
        { 
            id: 4, name: 'Sulawesi Barat', active: true, kkds: [],
            description: 'Pengembangan kawasan konservasi penyu dan ekosistem mangrove di pesisir Majene.' 
        },
        { 
            id: 5, name: 'Sulawesi Tengah', active: true,
            description: 'Kawasan Kepulauan Togean yang menjadi jantung segitiga karang dunia.',
            // DATA KKD YANG SUDAH ANDA SIAPKAN
            kkds: [
                {
                    id: 501,
                    name: 'KKD Banggai Dalaka',
                    type: 'Taman Pesisir (TP)',
                    image: 'https://images.unsplash.com/photo-1540206395-688085723adb?auto=format&fit=crop&q=80&w=1000',
                    luas: '15.000 Hektar',
                    sk: 'Kepmen KP No. 53/KEPMEN-KP/2020',
                    target: 'Terumbu Karang, Padang Lamun, Habitat Penyu',
                    description: 'Kawasan konservasi Banggai Dalaka memiliki ekosistem pesisir yang lengkap mulai dari mangrove, lamun, hingga terumbu karang yang menjadi habitat penting bagi biota laut dilindungi.',
                    // DATA ZONASI (Sesuai Konteks Materi)
                    zonasi: [
                        { zona: 'Zona Inti', luas: '2.000 Ha', fungsi: 'Perlindungan mutlak habitat dan populasi ikan' },
                        { zona: 'Zona Pemanfaatan Terbatas', luas: '8.000 Ha', fungsi: 'Pariwisata alam dan penelitian' },
                        { zona: 'Zona Lainnya', luas: '5.000 Ha', fungsi: 'Rehabilitasi dan budidaya ramah lingkungan' }
                    ]
                }
            ]
        },
        { 
            id: 6, name: 'Sulawesi Tenggara', active: true, kkds: [],
            description: 'Surga bawah laut Wakatobi dengan ratusan spesies karang langka.' 
        },
    ],

    // 2. DATA GALERI FOTO
    gallery: [
        { id: 1, url: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&q=80&w=800', caption: 'Patroli Rutin Bunaken', date: '12 Okt 2023' },
        { id: 2, url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800', caption: 'Terumbu Karang Wakatobi', date: '05 Nov 2023' },
    ],

    // 3. DATA BERITA
    news: [
        {
            id: 1,
            title: "Pelepasan 500 Tukik di Pesisir Majene",
            category: "Konservasi",
            date: "12 Februari 2024",
            author: "Admin KKP",
            image: "https://images.unsplash.com/photo-1437622643429-be013384de20?auto=format&fit=crop&q=80&w=1000",
            content: "Dinas Kelautan dan Perikanan Sulawesi Barat kembali melakukan aksi nyata pelestarian ekosistem laut dengan melepasliarkan 500 tukik penyu hijau..."
        }
    ]
};