// --- KONFIGURASI & API ---
const CONFIG = {
    USE_API: true, // Pastikan ini true untuk connect ke Node.js/PostgreSQL
    API_URL: 'http://localhost:3000/api',
    STORAGE_KEY: 'sip_kkd_fallback_v1'
};

const apiService = {
    async loadData() {
        if (CONFIG.USE_API) {
            try {
                const response = await fetch(`${CONFIG.API_URL}/data`);
                if (!response.ok) throw new Error('Server offline');
                const data = await response.json();
                return data || null;
            } catch (error) {
                console.warn("Gagal connect server, menggunakan data lokal:", error);
                return this.loadLocal();
            }
        }
        return this.loadLocal();
    },
    async saveData(data) {
        if (CONFIG.USE_API) {
            try {
                await fetch(`${CONFIG.API_URL}/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (error) {
                console.error("Gagal save ke server:", error);
                alert("Gagal menyimpan ke Database Server. Cek koneksi backend.");
            }
        } else {
            this.saveLocal(data);
        }
    },
    loadLocal() {
        try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)); } catch(e){ return null; }
    },
    saveLocal(data) {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    }
};

// --- HELPER ---
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- STATE DEFAULT ---
const defaultState = {
    view: 'home',
    isLoggedIn: false,
    mobileMenuOpen: false,
    selectedId: null,
    dashboardTab: 'locations',
    
    // Data Utama (Fallback jika DB kosong)
    provinces: window.SIP_DATA?.provinces || [],
    gallery: window.SIP_DATA?.gallery || [],
    news: window.SIP_DATA?.news || [],
    
    // UI State
    expandedProvId: null,
    showProvModal: false, editingProvId: null,
    showKkdModal: false, editingKkdId: null, selectedProvIdForKkd: null,
    showNewsModal: false, editingNewsId: null,
    showAddModal: false,

    // Forms
    provForm: { name: '', description: '', image: '' },
    kkdForm: { name: '', type: '', luas: '', sk: '', target: '', image: '', description: '', zonasiText: '' },
    newsForm: { title: '', category: 'Umum', image: '', content: '' }
};

let state = defaultState;

// --- INITIALIZATION ---
async function initApp() {
    const loadedData = await apiService.loadData();
    if (loadedData) {
        state = { 
            ...defaultState, 
            provinces: loadedData.provinces || defaultState.provinces,
            gallery: loadedData.gallery || defaultState.gallery,
            news: loadedData.news || defaultState.news
        };
    }
    render();
}

async function saveState() {
    const dbData = {
        provinces: state.provinces,
        gallery: state.gallery,
        news: state.news
    };
    await apiService.saveData(dbData);
}

// --- RENDER ENGINE ---
function render() {
    const app = document.getElementById('app');
    if (!app) return;

    let mainContent = '';
    try {
        switch(state.view) {
            case 'home': mainContent = renderHome(); break;
            case 'province-detail': mainContent = renderProvinceDetail(); break;
            case 'kkd-detail': mainContent = renderKkdDetail(); break;
            case 'contact': mainContent = renderContact(); break;
            case 'blog': mainContent = renderBlog(); break;
            case 'post-detail': mainContent = renderPostDetail(); break;
            case 'login': mainContent = renderLogin(); break;
            case 'dashboard': mainContent = renderDashboard(); break;
            default: mainContent = renderHome();
        }

        app.innerHTML = `
            ${renderNavbar()}
            <main class="pt-16 w-full flex-grow min-h-screen bg-slate-50">
                ${mainContent}
            </main>
            ${renderFooter()}
            
            ${state.showProvModal ? renderProvModal() : ''}
            ${state.showKkdModal ? renderKkdModal() : ''}
            ${state.showNewsModal ? renderNewsModal() : ''}
            ${state.showAddModal ? renderAddModal() : ''}
        `;
        
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Render Error:", err);
        app.innerHTML = `<div class="p-10 text-center text-red-600">Error: ${err.message}</div>`;
    }
}

// ==========================================
// 1. COMPONENTS UTAMA (NAVBAR & FOOTER)
// ==========================================

function renderNavbar() {
    const linkClass = (v) => `text-sm font-medium transition-colors ${state.view.includes(v) ? 'text-[#003366] font-bold' : 'text-slate-500 hover:text-[#003366]'}`;
    
    return `
    <nav class="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-200/60">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
            <!-- Logo Area -->
            <div class="flex items-center gap-2 cursor-pointer" onclick="navigate('home')">
                <div class="bg-[#EAEFEF] p-1.5 rounded-lg flex items-center justify-center w-8 h-8">
                    <img 
                        src="assets/logo.png" 
                        alt="Logo"
                        class="w-full h-full object-contain"
                        onerror="this.style.display='none'; this.parentElement.innerHTML='<i data-lucide=\'anchor\' class=\'w-5 h-5 text-[#003366]\'></i>'"
                    >
                </div>
                <span class="font-bold text-lg text-[#003366] tracking-tight">Konservasi Sulawesi</span>
            </div>
            
            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-6">
                <button onclick="navigate('home')" class="${linkClass('home')}">Beranda</button>
                <button onclick="navigate('home'); setTimeout(()=>document.getElementById('lokasi')?.scrollIntoView({behavior:'smooth'}),100)" class="text-sm font-medium text-slate-500 hover:text-[#003366]">Kawasan</button>
                <button onclick="navigate('blog')" class="${linkClass('blog')}">Berita</button>
                <button onclick="navigate('home'); setTimeout(()=>document.getElementById('galeri')?.scrollIntoView({behavior:'smooth'}),100)" class="text-sm font-medium text-slate-500 hover:text-[#003366]">Galeri</button>
                <button onclick="navigate('contact')" class="${linkClass('contact')}">Kontak</button>
                
                ${state.isLoggedIn ? 
                    `<button onclick="navigate('dashboard')" class="px-4 py-2 text-sm font-bold text-white bg-[#003366] rounded-full shadow-lg hover:bg-blue-900 transition-all">Dashboard</button>` : 
                    `<button onclick="navigate('login')" class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#003366] bg-blue-50 rounded-full hover:bg-blue-100 transition-all"><i data-lucide="user" class="w-4 h-4"></i> Login Admin</button>`
                }
            </div>

            <!-- Mobile Menu Toggle -->
            <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-slate-600 hover:text-[#003366]">
                <i data-lucide="${state.mobileMenuOpen ? 'x' : 'menu'}" class="w-6 h-6"></i>
            </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        ${state.mobileMenuOpen ? `
        <div class="md:hidden bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-2">
            <div class="px-4 py-3 space-y-1">
                <button onclick="navigate('home'); toggleMobileMenu()" class="block w-full text-left py-3 font-bold text-slate-700 border-b border-slate-50">Beranda</button>
                <button onclick="navigate('home'); toggleMobileMenu(); setTimeout(()=>document.getElementById('lokasi')?.scrollIntoView({behavior:'smooth'}),100)" class="block w-full text-left py-3 font-medium text-slate-600 border-b border-slate-50">Peta Lokasi</button>
                <button onclick="navigate('blog'); toggleMobileMenu()" class="block w-full text-left py-3 font-bold text-slate-700 border-b border-slate-50">Berita</button>
                <button onclick="navigate('home'); toggleMobileMenu(); setTimeout(()=>document.getElementById('galeri')?.scrollIntoView({behavior:'smooth'}),100)" class="block w-full text-left py-3 font-medium text-slate-600 border-b border-slate-50">Galeri</button>
                <button onclick="navigate('contact'); toggleMobileMenu()" class="block w-full text-left py-3 font-bold text-slate-700 border-b border-slate-50">Kontak</button>
                
                <div class="pt-3 pb-2">
                    <button onclick="navigate('${state.isLoggedIn ? 'dashboard' : 'login'}'); toggleMobileMenu()" class="block w-full text-center py-2.5 font-bold text-white bg-[#003366] rounded-lg shadow-md">
                        ${state.isLoggedIn ? 'Dashboard Admin' : 'Login Admin'}
                    </button>
                </div>
            </div>
        </div>` : ''}
    </nav>`;
}

function renderFooter() {
    return `<footer class="bg-white py-8 text-center text-xs text-slate-400 border-t mt-auto">© 2024 SIP-KKD Sulawesi</footer>`;
}

// ==========================================
// 2. PUBLIC VIEWS
// ==========================================

function renderHome() {
    return `
    <section class="relative bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32 text-center">
        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <span class="px-3 py-1 text-[10px] font-bold text-blue-800 bg-blue-100 rounded-full border border-blue-200 uppercase tracking-widest">Portal Resmi Kawasan Konservasi Sulawesi</span>
            <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 mt-6 mb-6">Menjaga Laut, <br/><span class="text-[#003366]">Melestarikan Kehidupan.</span></h1>
            <button onclick="document.getElementById('lokasi').scrollIntoView({behavior:'smooth'})" class="px-8 py-3.5 bg-[#003366] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all">Lihat Peta Lokasi</button>
        </div>
        <div class="absolute top-1/2 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute top-1/2 right-0 w-64 h-64 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    </section>

    <!-- LOKASI -->
    <section id="lokasi" class="py-20 max-w-7xl mx-auto px-4">
        <div class="text-center mb-12"><h2 class="text-3xl font-bold text-slate-900">Wilayah Konservasi</h2></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.provinces.map(prov => `
                <div onclick="viewProvince(${prov.id})" class="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-full">
                    ${prov.image ? 
                        `<div class="h-40 overflow-hidden relative"><img src="${prov.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"></div>` : 
                        `<div class="h-40 bg-slate-100 flex items-center justify-center text-slate-300"><i data-lucide="image" class="w-10 h-10"></i></div>`
                    }
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-bold text-slate-900 group-hover:text-[#003366] transition-colors">${prov.name}</h3>
                            <span class="bg-blue-50 text-[#003366] text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 whitespace-nowrap">${prov.kkds ? prov.kkds.length : 0} KKD</span>
                        </div>
                        <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">${prov.description}</p>
                        <div class="pt-4 border-t border-slate-50 flex items-center text-[#003366] text-sm font-bold mt-auto">Lihat Daftar <i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i></div>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>

    <!-- BERITA -->
    <section id="berita" class="py-20 bg-slate-50 border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between items-end mb-12">
                <h2 class="text-3xl font-bold text-slate-900">Berita Terbaru</h2>
                <button onclick="navigate('blog')" class="text-[#003366] font-bold text-sm flex items-center gap-1 hover:gap-3 transition-all">Lihat Semua <i data-lucide="arrow-right" class="w-4 h-4"></i></button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${state.news.slice(0, 3).map(post => `
                <div onclick="viewPost(${post.id})" class="cursor-pointer group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div class="h-48 overflow-hidden"><img src="${post.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"></div>
                    <div class="p-4">
                        <span class="text-blue-600 text-xs font-bold uppercase tracking-wide">${post.category}</span>
                        <h3 class="text-lg font-bold text-slate-900 mt-2 mb-2 group-hover:text-[#003366] transition-colors line-clamp-2">${post.title}</h3>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- GALERI -->
    <section id="galeri" class="py-20 bg-white border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-12"><h2 class="text-3xl font-bold text-slate-900">Dokumentasi Lapangan</h2></div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${state.gallery.slice(0, 8).map(item => `
                    <div class="group relative rounded-xl overflow-hidden aspect-square cursor-pointer hover:shadow-lg transition-all">
                        <img src="${item.url}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold p-2 text-center">
                            ${item.caption}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    `;
}

function renderProvinceDetail() {
    const prov = state.provinces.find(p => p.id === state.selectedId);
    if (!prov) return navigate('home');
    const bgStyle = prov.image ? `background-image: url('${prov.image}'); background-size: cover; background-position: center;` : 'background-color: #003366;';
    
    return `
    <div class="relative py-24 md:py-32 text-white overflow-hidden" style="${bgStyle}">
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30"></div>
        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <button onclick="navigate('home')" class="flex items-center text-white/80 hover:text-white mb-6 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm transition-all"><i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i> Kembali</button>
            <h1 class="text-4xl md:text-6xl font-extrabold mb-4">${prov.name}</h1>
            <p class="text-white/90 max-w-2xl text-lg">${prov.description}</p>
        </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 py-12 -mt-10 relative z-20">
        <div class="bg-white rounded-xl shadow-lg border border-slate-100 p-8 min-h-[400px]">
            <h2 class="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2"><i data-lucide="list" class="text-[#003366]"></i> Daftar Kawasan Konservasi</h2>
            ${prov.kkds && prov.kkds.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${prov.kkds.map(kkd => `
                <div onclick="viewKkd(${kkd.id})" class="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer group transition-all">
                    <img src="${kkd.image}" class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg bg-slate-200">
                    <div class="flex-grow">
                        <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase mb-2 inline-block">${kkd.type}</span>
                        <h3 class="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#003366] transition-colors">${kkd.name}</h3>
                        <p class="text-slate-500 text-sm line-clamp-2 mb-2">${kkd.description}</p>
                        <span class="text-xs font-bold text-[#003366] flex items-center">Detail Lengkap <i data-lucide="arrow-right" class="w-3 h-3 ml-1"></i></span>
                    </div>
                </div>`).join('')}
            </div>` : `<div class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">Belum ada data KKD.</div>`}
        </div>
    </div>`;
}

function renderKkdDetail() {
    let kkd = null, parentProv = null;
    state.provinces.forEach(p => { const f = p.kkds?.find(k => k.id === state.selectedId); if(f){kkd=f; parentProv=p;} });
    if (!kkd) return navigate('home');
    return `
    <div class="relative h-[60vh] min-h-[400px]"><img src="${kkd.image}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-[#003366] via-[#003366]/60 to-transparent"></div><div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto text-white"><button onclick="viewProvince(${parentProv.id})" class="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm hover:bg-white/30 transition-all mb-6 w-fit"><i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke ${parentProv.name}</button><h1 class="text-3xl md:text-5xl font-bold mb-4 shadow-sm">${kkd.name}</h1><div class="flex flex-wrap gap-6 text-sm font-medium opacity-90"><span class="flex items-center gap-2"><i data-lucide="maximize" class="w-5 h-5"></i> Luas: ${kkd.luas}</span><span class="flex items-center gap-2"><i data-lucide="file-check" class="w-5 h-5"></i> SK Penetapan</span></div></div></div>
    <div class="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2 space-y-8"><div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"><h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><i data-lucide="info" class="text-[#003366]"></i> Profil Kawasan</h3><p class="text-slate-600 text-lg leading-relaxed">${kkd.description}</p><div class="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100"><h4 class="text-xs font-bold text-[#003366] uppercase mb-1">Target Konservasi</h4><p class="text-slate-700 font-medium">${kkd.target}</p></div></div><div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"><h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><i data-lucide="layout-grid" class="text-[#003366]"></i> Data Zonasi</h3>${kkd.zonasi && kkd.zonasi.length > 0 ? `<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b-2 border-slate-100 text-slate-500 text-xs uppercase"><th class="py-3 px-2">Zona</th><th class="py-3 px-2">Luas</th><th class="py-3 px-2">Fungsi</th></tr></thead><tbody class="text-sm text-slate-700">${kkd.zonasi.map(z => `<tr class="border-b border-slate-50"><td class="py-3 px-2 font-bold">${z.zona}</td><td class="py-3 px-2">${z.luas}</td><td class="py-3 px-2">${z.fungsi}</td></tr>`).join('')}</tbody></table></div>` : `<p class="text-slate-400 italic">Data zonasi belum tersedia.</p>`}</div></div><div class="space-y-6"><div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 class="font-bold text-slate-900 mb-4 border-b pb-2">Dokumen Legalitas</h3><div class="flex items-start gap-3"><div class="bg-blue-100 p-2 rounded text-[#003366]"><i data-lucide="book" class="w-5 h-5"></i></div><div><p class="text-xs text-slate-500 font-bold uppercase mb-1">SK Penetapan</p><p class="text-sm font-medium text-slate-900 leading-snug">${kkd.sk}</p></div></div></div></div></div>`;
}

function renderBlog() {
    return `<div class="bg-white border-b border-slate-200"><div class="max-w-7xl mx-auto px-4 py-16 text-center"><h1 class="text-4xl font-extrabold text-slate-900 mb-2">Berita & Artikel</h1></div></div><div class="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">${state.news.map(post => `<div onclick="viewPost(${post.id})" class="group cursor-pointer"><div class="rounded-2xl overflow-hidden aspect-video mb-4 shadow-sm border border-slate-100"><img src="${post.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"></div><span class="text-blue-600 text-xs font-bold uppercase">${post.category}</span><h3 class="text-xl font-bold text-slate-900 mt-2 mb-2 group-hover:text-[#003366] transition-colors">${post.title}</h3></div>`).join('')}</div>`;
}

function renderPostDetail() {
    const post = state.news.find(p => p.id === state.selectedId);
    if (!post) return `<div class="p-20 text-center">Berita tidak ditemukan</div>`;
    return `<div class="bg-white min-h-screen"><div class="h-[50vh] relative"><img src="${post.image}" class="w-full h-full object-cover"></div><div class="max-w-3xl mx-auto px-6 py-12 -mt-20 relative bg-white rounded-t-3xl shadow-xl"><button onclick="navigate('blog')" class="mb-6 text-sm text-slate-500 hover:text-[#003366] flex items-center gap-2"><i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali</button><h1 class="text-4xl font-extrabold text-slate-900 mt-2 mb-6">${post.title}</h1><div class="prose prose-lg text-slate-700 leading-relaxed">${post.content}</div></div></div>`;
}

function renderContact() {
    return `
    <div class="bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-300">
        <div class="bg-[#003366] pt-32 pb-20 px-4 text-center text-white relative overflow-hidden">
            <div class="relative z-10 max-w-3xl mx-auto"><h1 class="text-3xl md:text-5xl font-bold mb-4">Hubungi Kami</h1><p class="text-blue-100 text-lg">Punya pertanyaan seputar kawasan konservasi?</p></div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div class="grid grid-cols-1 lg:grid-cols-2">
                    <div class="p-8 md:p-12 bg-slate-50/50">
                        <h3 class="text-2xl font-bold text-slate-900 mb-6">Kantor Pusat</h3>
                        <div class="space-y-6 mb-8">
                            <div class="flex items-start gap-4"><div class="bg-blue-100 p-3 rounded-full text-[#003366]"><i data-lucide="map-pin" class="w-6 h-6"></i></div><div><h4 class="font-semibold text-slate-900">Alamat</h4><p class="text-slate-600 text-sm mt-1">Gedung Mina Bahari IV, Lt. 10<br>Jl. Medan Merdeka Timur No. 16<br>Jakarta Pusat, 10110</p></div></div>
                            <div class="flex items-start gap-4"><div class="bg-blue-100 p-3 rounded-full text-[#003366]"><i data-lucide="mail" class="w-6 h-6"></i></div><div><h4 class="font-semibold text-slate-900">Email</h4><p class="text-slate-600 text-sm mt-1">humas.prl@kkp.go.id</p></div></div>
                        </div>
                        <div class="w-full h-64 bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-200"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.6664676527494!2d106.82963637583685!3d-6.175387060512803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2db8c5617%3A0x889df9672624537!2sKementerian%20Kelautan%20Dan%20Perikanan%20RI!5e0!3m2!1sid!2sid!4v1709623838541!5m2!1sid!2sid" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe></div>
                    </div>
                    <div class="p-8 md:p-12">
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Kirim Pesan</h3>
                        <form onsubmit="handleContactSubmit(event)" class="space-y-5">
                            <div><label class="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label><input type="text" placeholder="Nama Anda" required class="w-full px-4 py-3 border rounded-lg"></div>
                            <div><label class="block text-sm font-semibold text-slate-700 mb-1">Pesan</label><textarea rows="4" placeholder="Tuliskan pesan..." required class="w-full px-4 py-3 border rounded-lg"></textarea></div>
                            <button type="submit" class="w-full bg-[#003366] text-white py-3.5 rounded-lg font-bold">Kirim Pesan</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function renderLogin() {
    return `<div class="min-h-[80vh] flex flex-col items-center justify-center px-4"><div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100"><div class="text-center mb-8"><h2 class="text-2xl font-bold text-[#003366]">Admin Login</h2></div><form onsubmit="handleLogin(event)" class="space-y-4"><input type="text" id="username" placeholder="Username (admin)" class="w-full px-4 py-3 border rounded-lg outline-none" required><input type="password" id="password" placeholder="Password (admin123)" class="w-full px-4 py-3 border rounded-lg outline-none" required><button type="submit" class="w-full bg-[#003366] text-white py-3 rounded-lg font-bold">Masuk</button></form><button onclick="navigate('home')" class="w-full mt-4 text-sm text-center text-slate-400">Kembali ke Website</button></div></div>`;
}

// ==========================================
// 3. ADMIN DASHBOARD & MODALS
// ==========================================

function renderDashboard() {
    return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div><h1 class="text-2xl font-bold text-slate-900">Dashboard Pengelolaan</h1>${CONFIG.USE_API ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Online (PostgreSQL)</span>' : '<span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Offline (Browser)</span>'}</div>
            <button onclick="handleLogout()" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold">Keluar</button>
        </div>
        <div class="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit mb-8 overflow-x-auto">
            <button onclick="switchTab('locations')" class="px-6 py-2.5 rounded-lg text-sm font-bold ${state.dashboardTab==='locations'?'bg-white text-[#003366] shadow-sm':'text-slate-500'}">Lokasi</button>
            <button onclick="switchTab('news')" class="px-6 py-2.5 rounded-lg text-sm font-bold ${state.dashboardTab==='news'?'bg-white text-[#003366] shadow-sm':'text-slate-500'}">Berita</button>
            <button onclick="switchTab('gallery')" class="px-6 py-2.5 rounded-lg text-sm font-bold ${state.dashboardTab==='gallery'?'bg-white text-[#003366] shadow-sm':'text-slate-500'}">Galeri</button>
        </div>
        ${state.dashboardTab === 'locations' ? renderDashboardLocations() : ''}
        ${state.dashboardTab === 'news' ? renderDashboardNews() : ''}
        ${state.dashboardTab === 'gallery' ? renderDashboardGallery() : ''}
    </div>`;
}

function renderDashboardLocations() {
    return `
    <div class="space-y-4">
        ${state.provinces.map(prov => {
            const isExpanded = state.expandedProvId === prov.id;
            return `
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="p-4 flex items-center justify-between bg-slate-50 cursor-pointer" onclick="toggleProvAccordion(${prov.id})">
                    <div class="flex items-center gap-3"><span class="font-bold text-slate-800">${prov.name}</span><span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">${prov.kkds?.length||0} KKD</span></div>
                    <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-slate-400"></i>
                </div>
                ${isExpanded ? `
                <div class="p-4 border-t border-slate-200 bg-white">
                    <div class="mb-4 flex justify-between"><h5 class="text-xs font-bold text-[#003366]">DATA PROVINSI</h5><button onclick="openProvModal(${prov.id})" class="text-xs text-blue-600"><i data-lucide="edit" class="w-3 h-3 inline"></i> Edit</button></div>
                    <div class="flex justify-between items-center mb-4"><h4 class="text-sm font-bold text-slate-700">DAFTAR KKD</h4><button onclick="openKkdModal(${prov.id})" class="text-xs bg-[#003366] text-white px-3 py-1.5 rounded-lg">Tambah KKD</button></div>
                    <div class="grid gap-3">
                        ${prov.kkds && prov.kkds.map(kkd => `
                        <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                            <div class="flex gap-3 items-center"><img src="${kkd.image}" class="w-10 h-10 rounded bg-slate-200 object-cover"><div><p class="font-bold text-sm text-slate-900">${kkd.name}</p><p class="text-xs text-slate-500">${kkd.type}</p></div></div>
                            <div class="flex gap-2"><button onclick="openKkdModal(${prov.id}, ${kkd.id})" class="p-2 text-blue-600"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button onclick="deleteKkd(${prov.id}, ${kkd.id})" class="p-2 text-red-600"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
                        </div>`).join('')}
                    </div>
                </div>` : ''}
            </div>`;
        }).join('')}
    </div>`;
}

function renderDashboardNews() { return `<div class="flex justify-between mb-6"><h3 class="font-bold">Berita</h3><button onclick="openNewsModal()" class="bg-[#003366] text-white px-4 py-2 rounded-lg">Tambah</button></div><div class="space-y-4">${state.news.map(n => `<div class="bg-white p-4 rounded-xl border flex justify-between items-center"><span>${n.title}</span><div class="flex gap-2"><button onclick="editNews(${n.id})" class="text-blue-600"><i data-lucide="edit-3" class="w-4 h-4"></i></button><button onclick="deleteNews(${n.id})" class="text-red-600"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>`).join('')}</div>`; }
function renderDashboardGallery() { return `<div class="flex justify-between mb-6"><h3 class="font-bold">Galeri</h3><button onclick="toggleModal(true)" class="bg-[#003366] text-white px-4 py-2 rounded-lg">Upload</button></div><div class="grid grid-cols-4 gap-4">${state.gallery.map(g => `<div class="relative group"><img src="${g.url}" class="w-full h-24 object-cover rounded-lg"><button onclick="deletePhoto(${g.id})" class="absolute top-1 right-1 bg-red-600 text-white p-1 rounded"><i data-lucide="trash-2" class="w-3 h-3"></i></button></div>`).join('')}</div>`; }

// Modals (Sederhana agar tidak terlalu panjang, fungsi sama seperti sebelumnya)
function renderProvModal() { return `<div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50"><div class="bg-white rounded-xl w-full max-w-lg p-6"><h3 class="font-bold mb-4">Edit Provinsi</h3><form onsubmit="handleProvSubmit(event)" class="space-y-4"><input id="provName" value="${state.provForm.name}" class="w-full border p-2 rounded"><input type="file" id="provImageFile" class="w-full border p-2 rounded"><textarea id="provDesc" class="w-full border p-2 rounded">${state.provForm.description}</textarea><div class="flex justify-end gap-2"><button type="button" onclick="closeProvModal()" class="px-4 py-2 bg-slate-100">Batal</button><button type="submit" class="px-4 py-2 bg-blue-900 text-white">Simpan</button></div></form></div></div>`; }
function renderKkdModal() { const isEdit = state.editingKkdId !== null; return `<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"><div class="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"><h3 class="font-bold mb-4">${isEdit?'Edit':'Tambah'} KKD</h3><form onsubmit="handleKkdSubmit(event)" class="space-y-4"><input id="kkdName" value="${state.kkdForm.name}" placeholder="Nama KKD" class="w-full border p-2 rounded" required><div class="grid grid-cols-2 gap-4"><input id="kkdLuas" value="${state.kkdForm.luas}" placeholder="Luas" class="w-full border p-2 rounded"><input id="kkdSk" value="${state.kkdForm.sk}" placeholder="SK" class="w-full border p-2 rounded"></div><input type="file" id="kkdImageFile" class="w-full border p-2 rounded"><input id="kkdType" value="${state.kkdForm.type}" placeholder="Jenis (TP/KKP)" class="w-full border p-2 rounded"><textarea id="kkdDesc" placeholder="Deskripsi" class="w-full border p-2 rounded">${state.kkdForm.description}</textarea><textarea id="kkdZonasi" placeholder="Zonasi (Nama, Luas, Fungsi)" rows="3" class="w-full border p-2 rounded">${state.kkdForm.zonasiText}</textarea><div class="flex justify-end gap-2"><button type="button" onclick="closeKkdModal()" class="px-4 py-2 bg-slate-100">Batal</button><button type="submit" class="px-4 py-2 bg-blue-900 text-white">Simpan</button></div></form></div></div>`; }
function renderNewsModal() { return `<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"><div class="bg-white rounded-xl w-full max-w-lg p-6"><h3 class="font-bold mb-4">Berita</h3><form onsubmit="handleNewsSubmit(event)" class="space-y-4"><input id="newsTitle" value="${state.newsForm.title}" placeholder="Judul" class="w-full border p-2 rounded"><input type="file" id="newsImageFile" class="w-full border p-2 rounded"><textarea id="newsContent" rows="4" class="w-full border p-2 rounded">${state.newsForm.content}</textarea><div class="flex justify-end gap-2"><button type="button" onclick="closeNewsModal()" class="px-4 py-2 bg-slate-100">Batal</button><button type="submit" class="px-4 py-2 bg-blue-900 text-white">Simpan</button></div></form></div></div>`; }
function renderAddModal() { return `<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"><div class="bg-white rounded-xl w-full max-w-lg p-6"><h3 class="font-bold mb-4">Upload Foto</h3><form onsubmit="handleAddPhoto(event)" class="space-y-4"><input type="file" id="galleryImageFile" class="w-full border p-2 rounded"><input id="newCaption" placeholder="Caption" class="w-full border p-2 rounded"><div class="flex justify-end gap-2"><button type="button" onclick="toggleModal(false)" class="px-4 py-2 bg-slate-100">Batal</button><button type="submit" class="px-4 py-2 bg-blue-900 text-white">Simpan</button></div></form></div></div>`; }

// ==========================================
// 4. CONTROLLERS & LOGIC
// ==========================================

function navigate(v) { state.view = v; state.mobileMenuOpen = false; render(); window.scrollTo(0,0); }
function toggleMobileMenu() { state.mobileMenuOpen = !state.mobileMenuOpen; render(); }
function handleLogin(e) { e.preventDefault(); if(document.getElementById('username').value==='admin' && document.getElementById('password').value==='admin123') { state.isLoggedIn=true; navigate('dashboard'); } else alert('Gagal Login'); }
function handleLogout() { state.isLoggedIn=false; navigate('home'); }
function switchTab(tabName) { state.dashboardTab = tabName; render(); }
function viewProvince(id) { state.selectedId = id; navigate('province-detail'); }
function viewKkd(id) { state.selectedId = id; navigate('kkd-detail'); }
function viewPost(id) { state.selectedId = id; navigate('post-detail'); }

// CRUD Logic (Simplified for brevity but fully functional)
function toggleProvAccordion(id) { state.expandedProvId = state.expandedProvId === id ? null : id; render(); }
function openProvModal(id) { state.editingProvId = id; state.provForm = {...state.provinces.find(p=>p.id===id)}; state.showProvModal=true; render(); }
function closeProvModal() { state.showProvModal=false; render(); }
async function handleProvSubmit(e) { e.preventDefault(); const file = document.getElementById('provImageFile').files[0]; if(file) state.provForm.image = await readFile(file); state.provForm.name=document.getElementById('provName').value; state.provForm.description=document.getElementById('provDesc').value; state.provinces=state.provinces.map(p=>p.id===state.editingProvId?{...p, ...state.provForm}:p); saveState(); closeProvModal(); render(); }

function openKkdModal(provId, kkdId=null) { state.selectedProvIdForKkd=provId; state.editingKkdId=kkdId; if(kkdId){ const kkd = state.provinces.find(p=>p.id===provId).kkds.find(k=>k.id===kkdId); let zText=''; if(kkd.zonasi) zText=kkd.zonasi.map(z=>`${z.zona},${z.luas},${z.fungsi}`).join('\n'); state.kkdForm={...kkd, zonasiText:zText}; } else { state.kkdForm={name:'',type:'',luas:'',sk:'',target:'',image:'',description:'',zonasiText:''}; } state.showKkdModal=true; render(); }
function closeKkdModal() { state.showKkdModal=false; render(); }
async function handleKkdSubmit(e) { e.preventDefault(); const file=document.getElementById('kkdImageFile').files[0]; if(file) state.kkdForm.image=await readFile(file); 
    const zRaw=document.getElementById('kkdZonasi').value; const zArr=zRaw.split('\n').map(l=>{const p=l.split(','); return {zona:p[0]||'',luas:p[1]||'',fungsi:p[2]||''}});
    const newData={...state.kkdForm, name:document.getElementById('kkdName').value, type:document.getElementById('kkdType').value, luas:document.getElementById('kkdLuas').value, sk:document.getElementById('kkdSk').value, description:document.getElementById('kkdDesc').value, zonasi:zArr};
    state.provinces=state.provinces.map(p=>{ if(p.id===state.selectedProvIdForKkd){ let k=[...(p.kkds||[])]; if(state.editingKkdId){ k=k.map(i=>i.id===state.editingKkdId?{...i,...newData}:i); }else{ k.push({id:Date.now(),...newData}); } return {...p,kkds:k}; } return p; });
    saveState(); closeKkdModal(); render();
}
function deleteKkd(pid, kid) { if(confirm('Hapus?')) { state.provinces=state.provinces.map(p=>p.id===pid?{...p,kkds:p.kkds.filter(k=>k.id!==kid)}:p); saveState(); render(); } }

function openNewsModal() { state.showNewsModal=true; state.editingNewsId=null; state.newsForm={title:'',category:'Umum',content:''}; render(); }
function closeNewsModal() { state.showNewsModal=false; render(); }
function editNews(id) { state.editingNewsId=id; state.newsForm={...state.news.find(n=>n.id===id)}; state.showNewsModal=true; render(); }
async function handleNewsSubmit(e) { e.preventDefault(); const file=document.getElementById('newsImageFile').files[0]; if(file) state.newsForm.image=await readFile(file);
    const newData={...state.newsForm, title:document.getElementById('newsTitle').value, content:document.getElementById('newsContent').value, date:new Date().toLocaleDateString('id-ID')};
    if(state.editingNewsId) state.news=state.news.map(n=>n.id===state.editingNewsId?{...n,...newData}:n); else state.news.unshift({id:Date.now(),...newData});
    saveState(); closeNewsModal(); render();
}
function deleteNews(id) { if(confirm('Hapus?')) { state.news=state.news.filter(n=>n.id!==id); saveState(); render(); } }

function toggleModal(show) { state.showAddModal=show; render(); }
async function handleAddPhoto(e) { e.preventDefault(); const file=document.getElementById('galleryImageFile').files[0]; if(!file) return; const img=await readFile(file); state.gallery.unshift({id:Date.now(), url:img, caption:document.getElementById('newCaption').value, date:new Date().toLocaleDateString()}); saveState(); toggleModal(false); }
function deletePhoto(id) { if(confirm('Hapus?')) { state.gallery=state.gallery.filter(g=>g.id!==id); saveState(); render(); } }
function handleContactSubmit(e) { e.preventDefault(); alert("Pesan Terkirim!"); e.target.reset(); }

// Init Application
initApp();