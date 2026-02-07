// --- APP INITIALIZATION ---

// Data Cadangan (Seed Data) - Penyelamat jika data lain gagal dimuat
const seedData = {
    provinces: [
        { 
            id: 1, name: 'Sulawesi Selatan', active: true, 
            image: 'https://images.unsplash.com/photo-1596423737522-676292b3429d?auto=format&fit=crop&q=80&w=1000',
            description: 'Pusat konservasi terumbu karang di Kepulauan Spermonde dan Takabonerate.',
            kkds: [] 
        },
        { 
            id: 2, name: 'Sulawesi Utara', active: true, 
            image: 'https://images.unsplash.com/photo-1516683037151-9a17603a8cd4?auto=format&fit=crop&q=80&w=1000',
            description: 'Terkenal dengan Taman Nasional Bunaken dan keanekaragaman hayati laut Lembeh.',
            kkds: [] 
        },
        { 
            id: 3, name: 'Gorontalo', active: true, 
            image: 'https://images.unsplash.com/photo-1544246604-9c2b4d9cb99d?auto=format&fit=crop&q=80&w=1000',
            description: 'Habitat Hiu Paus dan konservasi pesisir Teluk Tomini yang terjaga.',
            kkds: [] 
        },
        { 
            id: 4, name: 'Sulawesi Barat', active: true, 
            image: 'https://images.unsplash.com/photo-1629733908386-3023ebce3298?auto=format&fit=crop&q=80&w=1000',
            description: 'Pengembangan kawasan konservasi penyu dan ekosistem mangrove di pesisir Majene.',
            kkds: [] 
        },
        { 
            id: 5, name: 'Sulawesi Tengah', active: true,
            image: 'https://images.unsplash.com/photo-1598322003844-32306f8c7929?auto=format&fit=crop&q=80&w=1000',
            description: 'Kawasan Kepulauan Togean yang menjadi jantung segitiga karang dunia.',
            kkds: [
                {
                    id: 501,
                    name: 'KKD Banggai Dalaka',
                    type: 'Taman Pesisir (TP)',
                    image: 'https://images.unsplash.com/photo-1540206395-688085723adb?auto=format&fit=crop&q=80&w=1000',
                    luas: '15.000 Hektar',
                    sk: 'Keputusan Menteri Kelautan dan Perikanan No. 53/KEPMEN-KP/2020',
                    target: 'Terumbu Karang, Padang Lamun, Habitat Penyu',
                    description: 'Kawasan konservasi Banggai Dalaka memiliki ekosistem pesisir yang lengkap.',
                    zonasi: [
                        { zona: 'Zona Inti', luas: '2.000 Ha', fungsi: 'Perlindungan mutlak' },
                        { zona: 'Zona Pemanfaatan', luas: '8.000 Ha', fungsi: 'Pariwisata alam' }
                    ]
                }
            ]
        },
        { 
            id: 6, name: 'Sulawesi Tenggara', active: true, 
            image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000',
            description: 'Surga bawah laut Wakatobi dengan ratusan spesies karang langka.',
            kkds: [] 
        }
    ],
    gallery: [
        { id: 101, url: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&q=80&w=800', location: 'Bunaken', date: '12 Okt 2023', caption: 'Patroli Rutin' },
        { id: 102, url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800', location: 'Wakatobi', date: '05 Nov 2023', caption: 'Monitoring Karang' },
        { id: 103, url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800', location: 'Takabonerate', date: '20 Des 2023', caption: 'Penyelaman Ilmiah' }
    ],
    news: [
        {
            id: 1,
            title: "Pelepasan 500 Tukik di Pesisir Majene",
            category: "Konservasi",
            date: "12 Februari 2024",
            author: "Admin KKP",
            image: "https://images.unsplash.com/photo-1437622643429-be013384de20?auto=format&fit=crop&q=80&w=1000",
            content: "Dinas Kelautan dan Perikanan Sulawesi Barat kembali melakukan aksi nyata pelestarian ekosistem laut..."
        },
        {
            id: 2,
            title: "Kunjungan Kerja Menteri KKP ke Wakatobi",
            category: "Pemerintahan",
            date: "10 Februari 2024",
            author: "Humas PRL",
            image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&q=80&w=1000",
            content: "Menteri Kelautan dan Perikanan melakukan kunjungan kerja ke Taman Nasional Wakatobi..."
        }
    ]
};

async function initApp() {
    console.log("Initializing App...");

    try {
        // CEK 1: Apakah variabel penting sudah ada?
        if (typeof defaultState === 'undefined') throw new Error("File 'js/state.js' belum dimuat atau error.");
        if (typeof render === 'undefined') throw new Error("File 'js/view.js' belum dimuat atau error.");
        if (typeof apiService === 'undefined') throw new Error("File 'js/service.js' belum dimuat atau error.");

        // 1. Load Data dari API atau LocalStorage
        const loadedData = await apiService.loadData();
        
        // Fungsi cek data valid
        const hasData = (data) => data && Array.isArray(data.provinces) && data.provinces.length > 0;

        // 2. Setup State
        if (hasData(loadedData)) {
            console.log("Using loaded data.");
            // Update global state (pastikan variabel state di state.js dideklarasikan dengan 'let' atau 'var', bukan 'const')
            state = { 
                ...defaultState, 
                provinces: loadedData.provinces,
                gallery: loadedData.gallery || [],
                news: loadedData.news || []
            };
        } else if (hasData(defaultState)) {
            console.log("Using default state.");
            state = defaultState;
        } else {
            console.warn("Using Seed Data (Emergency).");
            state = {
                ...defaultState,
                provinces: seedData.provinces,
                gallery: seedData.gallery,
                news: seedData.news
            };
            // Simpan seed data agar next load tidak kosong
            await apiService.saveData(state);
        }

        // 3. Render
        render();

    } catch (error) {
        console.error("Critical Error:", error);
        document.body.innerHTML = `
            <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <h1 style="color:red;">Gagal Memuat Aplikasi</h1>
                <p>Terjadi kesalahan teknis: <b>${error.message}</b></p>
                <p>Silakan periksa <b>Console (Tekan F12)</b> untuk detailnya.</p>
                <hr style="width:50%; margin: 20px auto;">
                <p style="color:gray; font-size:12px;">Pastikan urutan script di index.html sudah benar:<br>
                config.js > service.js > state.js > view.js > controller.js > app.js</p>
            </div>
        `;
    }
}

// Jalankan Aplikasi
initApp();