// --- VIEW COMPONENTS (TAMPILAN) ---
// File ini hanya menangani tampilan HTML (UI). Logika ada di controller.js

// 1. RENDER ENGINE UTAMA
function render() {
    const app = document.getElementById('app');
    if (!app) return;

    // Gunakan state global, jika belum siap gunakan default
    const currentState = typeof state !== 'undefined' ? state : defaultState;

    let mainContent = '';
    try {
        // Routing Sederhana
        switch(currentState.view) {
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

        // Render Layout Utama
        app.innerHTML = `
            ${renderNavbar()}
            <main class="pt-16 w-full flex-grow min-h-screen bg-slate-50">
                ${mainContent}
            </main>
            ${renderFooter()}
            
            <!-- Modals (Popup) -->
            ${currentState.showProvModal ? renderProvModal() : ''}
            ${currentState.showKkdModal ? renderKkdModal() : ''}
            ${currentState.showNewsModal ? renderNewsModal() : ''}
            ${currentState.showAddModal ? renderAddModal() : ''}
        `;
        
        // Refresh Icon
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Render Error:", err);
        app.innerHTML = `<div class="p-10 text-center text-red-600 font-bold">Error Rendering UI: ${err.message}<br><span class="text-sm font-normal text-gray-500">Cek Console (F12) untuk detail.</span></div>`;
    }
}

// 2. NAVBAR & FOOTER
function renderNavbar() {
    const linkClass = (v) => `text-sm font-medium transition-colors ${state.view.includes(v) ? 'text-[#003366] font-bold' : 'text-slate-500 hover:text-[#003366]'}`;
    
    return `
    <nav class="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-200/60 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
            <!-- Logo -->
            <div class="flex items-center gap-2 cursor-pointer group" onclick="navigate('home')">
                <div class="bg-[#EAEFEF] p-1.5 rounded-lg flex items-center justify-center w-8 h-8 group-hover:bg-blue-50 transition-colors">
                    <img src="assets/logo.png" alt="Logo" class="w-full h-full object-contain" onerror="this.style.display='none'; this.parentElement.innerHTML='<i data-lucide=\'anchor\' class=\'w-5 h-5 text-[#003366]\'></i>'">
                </div>
                <span class="font-bold text-lg text-[#003366] tracking-tight">Konservasi Sulawesi</span>
            </div>
            
            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-6">
                <button onclick="navigate('home')" class="${linkClass('home')}">Beranda</button>
                <button onclick="navigate('home'); setTimeout(()=>document.getElementById('lokasi')?.scrollIntoView({behavior:'smooth'}),100)" class="text-sm font-medium text-slate-500 hover:text-[#003366]">Peta Lokasi</button>
                <button onclick="navigate('blog')" class="${linkClass('blog')}">Berita</button>
                <button onclick="navigate('home'); setTimeout(()=>document.getElementById('galeri')?.scrollIntoView({behavior:'smooth'}),100)" class="text-sm font-medium text-slate-500 hover:text-[#003366]">Galeri</button>
                <button onclick="navigate('contact')" class="${linkClass('contact')}">Kontak</button>
                
                ${state.isLoggedIn ? 
                    `<button onclick="navigate('dashboard')" class="px-4 py-2 text-sm font-bold text-white bg-[#003366] rounded-full shadow-lg hover:bg-blue-900 transition-all">Dashboard</button>` : 
                    `<button onclick="navigate('login')" class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#003366] bg-blue-50 rounded-full hover:bg-blue-100 transition-all"><i data-lucide="user" class="w-4 h-4"></i> Login Admin</button>`
                }
            </div>

            <!-- Mobile Toggle -->
            <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-slate-600 hover:text-[#003366]">
                <i data-lucide="${state.mobileMenuOpen ? 'x' : 'menu'}" class="w-6 h-6"></i>
            </button>
        </div>

        <!-- Mobile Dropdown -->
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
    return `
    <footer class="bg-white border-t border-slate-200 mt-auto py-12">
        <div class="max-w-7xl mx-auto px-6 text-center">
             <div class="flex items-center justify-center gap-2 mb-4 opacity-70">
                <i data-lucide="anchor" class="w-5 h-5 text-[#003366]"></i>
                <span class="font-bold text-lg text-[#003366]">SIP-KKD Sulawesi</span>
            </div>
            <p class="text-slate-400 text-xs">
                © 2024 Sistem Informasi Pemantauan Kawasan Konservasi Daerah.<br>
                Dikembangkan untuk Kementrian Kelautan dan Perikanan.
            </p>
        </div>
    </footer>`;
}

// 3. PUBLIC VIEWS (HALAMAN DEPAN)
function renderHome() {
    // --- LOGIKA STATISTIK & FILTER ---
    const totalProv = state.provinces.length;
    const totalKKD = state.provinces.reduce((acc, curr) => acc + (curr.kkds ? curr.kkds.length : 0), 0);
    const totalGaleri = state.gallery.length;

    const locQuery = (state.searchLocationQuery || '').toLowerCase();
    
    // Filter Provinsi berdasarkan Search
    const filteredProvinces = state.provinces.filter(prov => {
        const provMatch = prov.name.toLowerCase().includes(locQuery);
        const kkdMatch = prov.kkds && prov.kkds.some(k => k.name.toLowerCase().includes(locQuery));
        return provMatch || kkdMatch;
    });

    return `
    <!-- HERO SECTION -->
    <section class="relative bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32 text-center overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <span class="inline-block px-3 py-1 text-[10px] font-bold text-blue-800 bg-blue-100 rounded-full border border-blue-200 uppercase tracking-widest mb-4">Portal Resmi Data Konservasi</span>
            <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">Menjaga Laut, <br/><span class="text-[#003366]">Melestarikan Kehidupan.</span></h1>
            <p class="max-w-2xl mx-auto text-base md:text-lg text-slate-600 mb-10 leading-relaxed">Sistem Informasi Pemantauan (SIP) untuk Kawasan Konservasi Daerah wilayah Sulawesi.</p>
            
            <!-- STATISTIK DASHBOARD -->
            <div class="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-3xl font-extrabold text-[#003366]">${totalKKD}</p>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Kawasan</p>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-3xl font-extrabold text-blue-500">${totalProv}</p>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Provinsi</p>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-3xl font-extrabold text-teal-500">${totalGaleri}+</p>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Dokumentasi</p>
                </div>
            </div>

            <button onclick="document.getElementById('lokasi').scrollIntoView({behavior:'smooth'})" class="px-8 py-3.5 bg-[#003366] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">Lihat Peta Lokasi</button>
        </div>
        <!-- Background Blobs -->
        <div class="absolute top-1/2 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute top-1/2 right-0 w-64 h-64 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    </section>

    <!-- SECTION: LOKASI (PROVINSI) -->
    <section id="lokasi" class="py-20 max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">Wilayah Konservasi</h2>
                <p class="text-slate-500">Jelajahi data KKD berdasarkan provinsi.</p>
            </div>
            <!-- Search Bar Lokasi -->
            <div class="relative w-full md:w-72">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                <input 
                    type="text" 
                    placeholder="Cari provinsi atau KKD..." 
                    class="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm shadow-sm"
                    value="${state.searchLocationQuery || ''}"
                    oninput="handleSearchLocation(event)"
                >
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredProvinces.length > 0 ? filteredProvinces.map(prov => `
                <div onclick="viewProvince(${prov.id})" class="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-full">
                    ${prov.image ? 
                        `<div class="h-48 overflow-hidden relative">
                            <img src="${prov.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image'">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div class="absolute bottom-3 left-4 text-white font-bold text-sm flex items-center gap-1">
                                <i data-lucide="map-pin" class="w-3 h-3"></i> ${prov.name}
                            </div>
                        </div>` 
                    : 
                        `<div class="h-48 bg-slate-100 flex items-center justify-center text-slate-300"><i data-lucide="image" class="w-12 h-12"></i></div>`
                    }
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Data Terkini</span>
                            <span class="bg-blue-50 text-[#003366] text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 whitespace-nowrap">
                                ${prov.kkds ? prov.kkds.length : 0} Kawasan
                            </span>
                        </div>
                        <p class="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow leading-relaxed">${prov.description}</p>
                        <div class="pt-4 border-t border-slate-50 flex items-center text-[#003366] text-sm font-bold mt-auto group-hover:gap-2 transition-all">
                            Lihat Detail <i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </div>`).join('') 
            : `<div class="col-span-3 text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">Tidak ditemukan lokasi dengan kata kunci "${locQuery}"</div>`}
        </div>
    </section>
    
    <!-- SECTION: BERITA -->
    <section id="berita" class="py-20 bg-slate-50 border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between items-end mb-12">
                <div>
                    <h2 class="text-3xl font-bold text-slate-900 mb-1">Berita Terbaru</h2>
                    <p class="text-slate-500 text-sm">Update informasi lapangan & kebijakan.</p>
                </div>
                <button onclick="navigate('blog')" class="text-[#003366] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">Lihat Semua <i data-lucide="arrow-right" class="w-4 h-4"></i></button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${state.news.slice(0, 3).map(post => `
                <div onclick="viewPost(${post.id})" class="cursor-pointer group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                    <div class="h-48 overflow-hidden relative">
                        <img src="${post.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=News'">
                        <div class="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-bold px-3 py-1 rounded-full text-[#003366] shadow-sm uppercase tracking-wide">
                            ${post.category}
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
                            <i data-lucide="calendar" class="w-3 h-3"></i> ${post.date}
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#003366] transition-colors line-clamp-2 leading-snug">${post.title}</h3>
                        <p class="text-slate-500 text-sm line-clamp-3 leading-relaxed">${post.content}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- SECTION: GALERI -->
    <section id="galeri" class="py-20 bg-white border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-slate-900">Dokumentasi Lapangan</h2>
                <p class="text-slate-500 mt-2">Arsip foto kegiatan dan kondisi alam.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${state.gallery.slice(0, 8).map(item => `
                    <div class="group relative rounded-xl overflow-hidden aspect-square cursor-pointer hover:shadow-xl transition-all duration-300 bg-slate-100">
                        <img src="${item.url}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/400x400/e2e8f0/1e293b?text=Image'">
                        
                        <!-- Overlay Hover Effect -->
                        <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <p class="text-white text-sm font-bold truncate mb-1">${item.caption}</p>
                            <div class="flex items-center justify-between text-white/80 text-[10px]">
                                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${item.location || '-'}</span>
                                <span>${item.date}</span>
                            </div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>
    </section>
    `;
}

// 4. HALAMAN DETAIL (PROVINSI & KKD)
function renderProvinceDetail() {
    const prov = state.provinces.find(p => p.id === state.selectedId);
    if (!prov) return navigate('home');
    
    // Background Image Logic
    const bgStyle = prov.image ? `background-image: url('${prov.image}'); background-size: cover; background-position: center;` : 'background-color: #003366;';
    
    return `
    <div class="relative py-32 text-white overflow-hidden" style="${bgStyle}">
        <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <button onclick="navigate('home')" class="flex items-center text-white/80 hover:text-white mb-6 text-sm bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/20"><i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i> Kembali ke Peta</button>
            <span class="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 block">Provinsi</span>
            <h1 class="text-4xl md:text-6xl font-extrabold mb-6 shadow-sm leading-tight">${prov.name}</h1>
            <p class="text-white/90 max-w-2xl text-lg leading-relaxed border-l-4 border-blue-500 pl-4">${prov.description}</p>
        </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-20">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 min-h-[400px]">
            <h2 class="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div class="bg-blue-100 p-2 rounded-lg text-[#003366]"><i data-lucide="list" class="w-6 h-6"></i></div>
                Daftar Kawasan Konservasi (${prov.kkds ? prov.kkds.length : 0})
            </h2>
            
            ${prov.kkds && prov.kkds.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${prov.kkds.map(kkd => `
                <div onclick="viewKkd(${kkd.id})" class="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer group transition-all duration-300 bg-white">
                    <img src="${kkd.image}" class="w-28 h-28 object-cover rounded-lg bg-slate-200 shadow-sm" onerror="this.src='https://placehold.co/200x200?text=No+Img'">
                    <div class="flex-grow flex flex-col justify-center">
                        <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase mb-2 inline-block w-fit">${kkd.type}</span>
                        <h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#003366] transition-colors">${kkd.name}</h3>
                        <p class="text-slate-500 text-sm line-clamp-1 mb-3">${kkd.description}</p>
                        <span class="text-xs font-bold text-[#003366] flex items-center mt-auto">Lihat Data Lengkap <i data-lucide="arrow-right" class="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform"></i></span>
                    </div>
                </div>`).join('')}
            </div>` 
            : `<div class="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <i data-lucide="folder-open" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                <p>Belum ada data KKD yang diinput untuk provinsi ini.</p>
               </div>`}
        </div>
    </div>`;
}

function renderKkdDetail() {
    let kkd = null, parentProv = null;
    state.provinces.forEach(p => { 
        const f = p.kkds?.find(k => k.id === state.selectedId); 
        if(f){kkd=f; parentProv=p;} 
    });
    if (!kkd) return navigate('home');

    return `
    <!-- Header KKD -->
    <div class="relative h-[60vh] min-h-[400px]">
        <img src="${kkd.image}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/1200x600?text=No+Image'">
        <div class="absolute inset-0 bg-gradient-to-t from-[#003366] via-[#003366]/70 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto text-white">
            <button onclick="viewProvince(${parentProv.id})" class="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm hover:bg-white/20 transition-all mb-6 w-fit font-medium">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke ${parentProv.name}
            </button>
            <div class="flex items-center gap-3 mb-4">
                 <span class="bg-blue-500/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-lg shadow-lg border border-blue-400">${kkd.type}</span>
                 <span class="bg-emerald-500/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-lg shadow-lg border border-emerald-400">Aktif</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-bold mb-6 shadow-sm leading-tight">${kkd.name}</h1>
            <div class="flex flex-wrap gap-6 text-sm font-medium opacity-90">
                <span class="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg"><i data-lucide="maximize" class="w-4 h-4 text-blue-300"></i> Luas: ${kkd.luas}</span>
                <span class="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg"><i data-lucide="file-check" class="w-4 h-4 text-blue-300"></i> ${kkd.sk || 'SK Belum Input'}</span>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Kolom Utama -->
        <div class="lg:col-span-2 space-y-8">
            <!-- Profil -->
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <i data-lucide="info" class="text-[#003366] w-5 h-5"></i> Profil Kawasan
                </h3>
                <p class="text-slate-600 text-lg leading-relaxed text-justify">${kkd.description}</p>
                
                <div class="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 class="text-xs font-bold text-[#003366] uppercase mb-2 flex items-center gap-2">
                        <i data-lucide="target" class="w-4 h-4"></i> Target Konservasi
                    </h4>
                    <p class="text-slate-700 font-medium text-lg">${kkd.target}</p>
                </div>
            </div>

            <!-- Zonasi -->
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <i data-lucide="layout-grid" class="text-[#003366] w-5 h-5"></i> Data Zonasi
                </h3>
                ${kkd.zonasi && kkd.zonasi.length > 0 ? `
                <div class="overflow-x-auto rounded-lg border border-slate-200">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50">
                            <tr class="text-slate-500 text-xs uppercase">
                                <th class="py-3 px-4 font-bold border-r border-slate-200">Nama Zona</th>
                                <th class="py-3 px-4 font-bold border-r border-slate-200 w-32">Luas (Ha)</th>
                                <th class="py-3 px-4 font-bold">Fungsi Utama</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm text-slate-700 divide-y divide-slate-100">
                            ${kkd.zonasi.map(z => `
                            <tr class="hover:bg-blue-50/30 transition-colors">
                                <td class="py-3 px-4 font-bold text-[#003366] border-r border-slate-100">${z.zona}</td>
                                <td class="py-3 px-4 border-r border-slate-100 font-mono">${z.luas}</td>
                                <td class="py-3 px-4">${z.fungsi}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : `<div class="p-6 bg-slate-50 rounded-lg text-center text-slate-500 italic border border-dashed border-slate-200">Data detail zonasi belum tersedia untuk kawasan ini.</div>`}
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                <h3 class="font-bold text-slate-900 mb-4 border-b pb-2">Informasi Legalitas</h3>
                <div class="flex items-start gap-3 mb-6">
                    <div class="bg-blue-100 p-2.5 rounded-lg text-[#003366] shrink-0"><i data-lucide="book-open" class="w-5 h-5"></i></div>
                    <div>
                        <p class="text-xs text-slate-500 font-bold uppercase mb-1">Dasar Hukum</p>
                        <p class="text-sm font-medium text-slate-900 leading-snug">${kkd.sk || '-'}</p>
                    </div>
                </div>
                <button class="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-[#003366] hover:text-white transition-all flex justify-center items-center gap-2 group">
                    <i data-lucide="download" class="w-4 h-4"></i> Unduh Dokumen SK
                </button>
                <div class="mt-6 pt-6 border-t border-slate-100">
                    <div class="bg-slate-100 rounded-xl h-48 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
                        <i data-lucide="map" class="w-10 h-10 opacity-50"></i>
                        <span class="text-xs font-medium">Peta Digital (SHP)<br>Belum Tersedia</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

// 5. HALAMAN BERITA FULL
function renderBlog() {
    const newsData = (typeof state !== 'undefined' && state.news) ? state.news : [];
    // Filter Berita
    const newsQuery = (state.searchNewsQuery || '').toLowerCase();
    const filtered = newsData.filter(n => n.title.toLowerCase().includes(newsQuery));

    return `
    <div class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 py-16 text-center">
            <span class="text-[#003366] font-bold tracking-wider uppercase text-xs mb-2 block">Pusat Informasi</span>
            <h1 class="text-4xl font-extrabold text-slate-900 mb-4">Berita & Artikel</h1>
            <p class="text-slate-500 max-w-xl mx-auto mb-8">Kumpulan berita terkini mengenai kegiatan konservasi, kebijakan pemerintah, dan cerita dari lapangan.</p>
            
            <div class="relative w-full max-w-md mx-auto">
                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input 
                    type="text" 
                    placeholder="Cari artikel berita..." 
                    class="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-200 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none shadow-sm"
                    value="${state.searchNewsQuery||''}" 
                    oninput="handleSearchNews(event)"
                >
            </div>
        </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${filtered.length > 0 ? filtered.map(post => `
            <div onclick="viewPost(${post.id})" class="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full">
                <div class="h-56 overflow-hidden relative">
                    <img src="${post.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='https://placehold.co/600x400?text=News'">
                    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-[#003366] shadow uppercase tracking-wide">
                        ${post.category}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
                        <i data-lucide="calendar" class="w-3 h-3"></i> ${post.date}
                        <span>•</span>
                        <span>${post.author || 'Admin'}</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#003366] transition-colors line-clamp-2 leading-snug">${post.title}</h3>
                    <p class="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">${post.content}</p>
                    <div class="pt-4 border-t border-slate-50 flex items-center text-[#003366] text-sm font-bold mt-auto group-hover:gap-2 transition-all">
                        Baca Selengkapnya <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                    </div>
                </div>
            </div>`).join('') 
            : '<div class="col-span-3 text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">Tidak ada berita yang cocok dengan pencarian Anda.</div>'}
        </div>
    </div>`;
}

function renderPostDetail() {
    const post = state.news.find(p => p.id === state.selectedId);
    if (!post) return `<div class="p-20 text-center">Berita tidak ditemukan</div>`;
    return `
    <div class="bg-white min-h-screen">
        <div class="h-[60vh] relative">
            <img src="${post.image}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="max-w-4xl px-4 text-center text-white">
                    <span class="bg-blue-600/90 text-xs font-bold px-4 py-1.5 rounded-full mb-6 inline-block uppercase tracking-wider shadow-lg">${post.category}</span>
                    <h1 class="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md">${post.title}</h1>
                    <div class="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/90">
                        <span class="flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4"></i> ${post.date}</span>
                        <span class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> Ditulis oleh ${post.author || 'Admin KKP'}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="max-w-3xl mx-auto px-6 py-16 -mt-20 relative bg-white rounded-t-3xl shadow-2xl">
            <button onclick="navigate('blog')" class="mb-8 text-sm text-slate-500 hover:text-[#003366] flex items-center gap-2 transition-colors group font-bold">
                <div class="p-1 rounded-full bg-slate-100 group-hover:bg-blue-50 transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i></div>
                Kembali ke Berita
            </button>
            <div class="prose prose-lg text-slate-700 leading-relaxed text-justify first-letter:text-5xl first-letter:font-bold first-letter:text-[#003366] first-letter:mr-2 first-letter:float-left">
                ${post.content.split('\n').map(p => `<p class="mb-6">${p}</p>`).join('')}
            </div>
            <div class="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
                <span class="text-slate-500 text-sm font-bold">Bagikan artikel ini:</span>
                <div class="flex gap-3">
                    <button class="p-2.5 rounded-full bg-blue-50 text-[#003366] hover:bg-[#003366] hover:text-white transition-colors"><i data-lucide="facebook" class="w-4 h-4"></i></button>
                    <button class="p-2.5 rounded-full bg-blue-50 text-[#003366] hover:bg-[#003366] hover:text-white transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i></button>
                    <button class="p-2.5 rounded-full bg-blue-50 text-[#003366] hover:bg-[#003366] hover:text-white transition-colors"><i data-lucide="link" class="w-4 h-4"></i></button>
                </div>
            </div>
        </div>
    </div>`;
}

function renderContact() {
    return `
    <div class="bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-300">
        <!-- Header Kontak -->
        <div class="bg-[#003366] pt-32 pb-20 px-4 text-center text-white relative overflow-hidden">
            <div class="relative z-10 max-w-3xl mx-auto">
                <h1 class="text-3xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
                <p class="text-blue-100 text-lg">Punya pertanyaan seputar kawasan konservasi atau ingin melaporkan sesuatu? Tim kami siap membantu.</p>
            </div>
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div class="grid grid-cols-1 lg:grid-cols-2">
                    
                    <!-- Kolom Kiri: Info & Peta -->
                    <div class="p-8 md:p-12 bg-slate-50/50">
                        <h3 class="text-2xl font-bold text-slate-900 mb-6">Kantor Pusat</h3>
                        
                        <div class="space-y-6 mb-8">
                            <div class="flex items-start gap-4">
                                <div class="bg-white p-3 rounded-xl shadow-sm text-[#003366]"><i data-lucide="map-pin" class="w-6 h-6"></i></div>
                                <div><h4 class="font-bold text-slate-900">Alamat</h4><p class="text-slate-600 text-sm mt-1 leading-relaxed">Gedung Mina Bahari IV, Lt. 10<br>Jl. Medan Merdeka Timur No. 16<br>Jakarta Pusat, 10110</p></div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="bg-white p-3 rounded-xl shadow-sm text-[#003366]"><i data-lucide="phone" class="w-6 h-6"></i></div>
                                <div><h4 class="font-bold text-slate-900">Telepon & Fax</h4><p class="text-slate-600 text-sm mt-1">Telp: (021) 3519070 ext. 1234<br>Fax: (021) 3519075</p></div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="bg-white p-3 rounded-xl shadow-sm text-[#003366]"><i data-lucide="mail" class="w-6 h-6"></i></div>
                                <div><h4 class="font-bold text-slate-900">Email</h4><p class="text-slate-600 text-sm mt-1">humas.prl@kkp.go.id<br>pengaduan@kkp.go.id</p></div>
                            </div>
                        </div>

                        <!-- Embed Google Maps -->
                        <div class="w-full h-64 bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-200 relative">
                             <div class="absolute top-2 right-2 z-10 bg-white px-2 py-1 text-[10px] font-bold rounded shadow text-slate-500">Peta Lokasi</div>
                             <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.6664676527494!2d106.82963637583685!3d-6.175387060512803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2db8c5617%3A0x889df9672624537!2sKementerian%20Kelautan%20Dan%20Perikanan%20RI!5e0!3m2!1sid!2sid!4v1709623838541!5m2!1sid!2sid" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                        </div>
                    </div>

                    <!-- Kolom Kanan: Form Pesan -->
                    <div class="p-8 md:p-12">
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Kirim Pesan</h3>
                        <p class="text-slate-500 text-sm mb-8">Silakan isi formulir di bawah ini.</p>
                        
                        <form onsubmit="handleContactSubmit(event)" class="space-y-5">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                                <input type="text" placeholder="Masukkan nama Anda" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input type="email" placeholder="contoh@email.com" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Subjek</label>
                                <select class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all bg-slate-50/50">
                                    <option>Permohonan Data</option>
                                    <option>Laporan Masyarakat</option>
                                    <option>Kerjasama</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Pesan</label>
                                <textarea rows="4" placeholder="Tuliskan pesan Anda..." required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all bg-slate-50/50"></textarea>
                            </div>
                            <button type="submit" class="w-full bg-[#003366] text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                <i data-lucide="send" class="w-4 h-4"></i> Kirim Pesan
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `;
}

function renderLogin() {
    return `
    <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-in zoom-in duration-300">
            <div class="text-center mb-8">
                <div class="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#003366]">
                    <i data-lucide="lock" class="w-8 h-8"></i>
                </div>
                <h2 class="text-2xl font-bold text-[#003366]">Admin Login</h2>
                <p class="text-slate-500 text-sm mt-2">Akses khusus pengelolaan data SIP-KKD</p>
            </div>
            <form onsubmit="handleLogin(event)" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase">Username</label>
                    <div class="relative">
                        <i data-lucide="user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                        <input type="text" id="username" placeholder="admin" class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#003366] outline-none transition-all" required>
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase">Password</label>
                    <div class="relative">
                        <i data-lucide="key" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                        <input type="password" id="password" placeholder="••••••••" class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#003366] outline-none transition-all" required>
                    </div>
                </div>
                <button type="submit" class="w-full bg-[#003366] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors shadow-lg mt-2">Masuk Dashboard</button>
            </form>
            <button onclick="navigate('home')" class="w-full mt-6 text-sm text-center text-slate-400 hover:text-[#003366] transition-colors flex items-center justify-center gap-1">
                <i data-lucide="arrow-left" class="w-3 h-3"></i> Kembali ke Website
            </button>
        </div>
        <div class="mt-6 text-xs text-slate-400">Demo Access: admin / admin123</div>
    </div>`;
}

// 6. ADMIN DASHBOARD & MODALS
function renderDashboard() {
    return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">Dashboard Pengelolaan</h1>
                <div class="flex items-center gap-2 mt-2">
                    ${CONFIG.USE_API ? 
                        '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><i data-lucide="database" class="w-3 h-3"></i> DB Online</span>' : 
                        '<span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><i data-lucide="hard-drive" class="w-3 h-3"></i> Local Storage</span>'
                    }
                    <span class="text-xs text-slate-400">|</span>
                    <span class="text-xs text-slate-500">Selamat datang, Admin</span>
                </div>
            </div>
            <div class="flex gap-3">
                <button onclick="navigate('home')" class="px-4 py-2 text-sm font-bold text-[#003366] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Lihat Web</button>
                <button onclick="handleLogout()" class="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"><i data-lucide="log-out" class="w-4 h-4"></i> Keluar</button>
            </div>
        </div>
        
        <div class="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit mb-8 overflow-x-auto no-scrollbar">
            <button onclick="switchTab('locations')" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${state.dashboardTab==='locations'?'bg-white text-[#003366] shadow-sm':'text-slate-500 hover:text-slate-700'}">Data Lokasi</button>
            <button onclick="switchTab('news')" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${state.dashboardTab==='news'?'bg-white text-[#003366] shadow-sm':'text-slate-500 hover:text-slate-700'}">Berita</button>
            <button onclick="switchTab('gallery')" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${state.dashboardTab==='gallery'?'bg-white text-[#003366] shadow-sm':'text-slate-500 hover:text-slate-700'}">Galeri</button>
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
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300">
                <div class="p-4 flex items-center justify-between bg-slate-50 cursor-pointer hover:bg-slate-100" onclick="toggleProvAccordion(${prov.id})">
                    <div class="flex items-center gap-3">
                        ${prov.image ? `<img src="${prov.image}" class="w-10 h-10 rounded-full object-cover border border-slate-200">` : ''}
                        <div>
                            <span class="font-bold text-slate-800 block">${prov.name}</span>
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">${prov.kkds?.length||0} KKD</span>
                        </div>
                    </div>
                    <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-slate-400"></i>
                </div>
                ${isExpanded ? `
                <div class="p-4 border-t border-slate-200 bg-white animate-in slide-in-from-top-2 duration-200">
                    <div class="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-start">
                        <div>
                            <h5 class="text-xs font-bold text-[#003366] uppercase mb-1">Informasi Provinsi</h5>
                            <p class="text-sm text-slate-600">${prov.description}</p>
                        </div>
                        <button onclick="openProvModal(${prov.id})" class="text-xs flex items-center gap-1 bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-bold ml-4 whitespace-nowrap">
                            <i data-lucide="edit" class="w-3 h-3"></i> Edit Info
                        </button>
                    </div>
                    
                    <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                        <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Daftar Kawasan (KKD)</h4>
                        <button onclick="openKkdModal(${prov.id})" class="text-xs bg-[#003366] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-900">
                            <i data-lucide="plus" class="w-3 h-3"></i> Tambah KKD
                        </button>
                    </div>

                    ${prov.kkds && prov.kkds.length > 0 ? `
                        <div class="grid gap-3">
                            ${prov.kkds.map(kkd => `
                            <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                                <div class="flex gap-3 items-center">
                                    <img src="${kkd.image}" class="w-12 h-12 rounded object-cover bg-slate-200">
                                    <div>
                                        <p class="font-bold text-sm text-slate-900">${kkd.name}</p>
                                        <p class="text-xs text-slate-500">${kkd.type}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="openKkdModal(${prov.id}, ${kkd.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                    <button onclick="deleteKkd(${prov.id}, ${kkd.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </div>
                            </div>
                            `).join('')}
                        </div>
                    ` : `<p class="text-center text-sm text-slate-400 py-4">Belum ada data KKD.</p>`}
                </div>` : ''}
            </div>`;
        }).join('')}
    </div>`;
}

function renderDashboardNews() {
    return `
    <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg text-slate-800">Daftar Berita</h3>
        <button onclick="openNewsModal()" class="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900"><i data-lucide="plus" class="w-4 h-4"></i> Tulis Berita</button>
    </div>
    <div class="space-y-4">
        ${state.news.map(item => `
            <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-start shadow-sm">
                <img src="${item.image}" class="w-full md:w-24 h-24 object-cover rounded-lg bg-slate-100">
                <div class="flex-grow">
                    <span class="text-xs font-bold text-blue-600 uppercase">${item.category}</span>
                    <h4 class="font-bold text-slate-900 mb-1">${item.title}</h4>
                    <p class="text-xs text-slate-500 line-clamp-2">${item.content}</p>
                </div>
                <div class="flex gap-2 self-end md:self-center">
                    <button onclick="editNews(${item.id})" class="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteNews(${item.id})" class="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).join('')}
    </div>`;
}

function renderDashboardGallery() {
    return `
    <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg text-slate-800">Galeri Foto</h3>
        <button onclick="toggleModal(true)" class="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900"><i data-lucide="plus" class="w-4 h-4"></i> Upload Foto</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${state.gallery.map(item => `
            <div class="group relative rounded-xl overflow-hidden aspect-square border border-slate-200">
                <img src="${item.url}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                    <p class="font-bold text-sm mb-1">${item.caption}</p>
                    <p class="text-xs text-blue-200 mb-2"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${item.location||'-'}</p>
                    <button onclick="deletePhoto(${item.id})" class="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).join('')}
    </div>`;
}

// 7. MODALS
function renderProvModal() {
    return `<div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold text-slate-900">Edit Data Provinsi</h3><button onclick="closeProvModal()"><i data-lucide="x" class="w-6 h-6 text-slate-400"></i></button></div><form onsubmit="handleProvSubmit(event)" class="space-y-4"><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Provinsi</label><input type="text" id="provName" value="${state.provForm.name}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366] outline-none" required></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Foto Utama</label><input type="file" id="provImageFile" accept="image/*" class="w-full px-4 py-2 border rounded-lg text-sm"></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Singkat</label><textarea id="provDesc" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366] outline-none">${state.provForm.description}</textarea></div><div class="flex justify-end gap-2 pt-4"><button type="button" onclick="closeProvModal()" class="px-4 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button><button type="submit" class="px-4 py-2 bg-[#003366] text-white rounded-lg font-bold hover:bg-blue-900">Simpan</button></div></form></div></div>`;
}

function renderKkdModal() {
    const isEdit = state.editingKkdId !== null;
    return `<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10"><h3 class="text-xl font-bold text-slate-900">${isEdit?'Edit Data KKD':'Tambah KKD Baru'}</h3><button onclick="closeKkdModal()"><i data-lucide="x" class="w-6 h-6 text-slate-400"></i></button></div><form onsubmit="handleKkdSubmit(event)" class="p-6 space-y-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kawasan</label><input type="text" id="kkdName" value="${state.kkdForm.name}" class="w-full px-3 py-2 border rounded-lg" required></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Kawasan</label><select id="kkdType" class="w-full px-3 py-2 border rounded-lg bg-white"><option ${state.kkdForm.type==='Taman Pesisir (TP)'?'selected':''}>Taman Pesisir (TP)</option><option ${state.kkdForm.type==='Kawasan Konservasi Perairan (KKP)'?'selected':''}>Kawasan Konservasi Perairan (KKP)</option><option ${state.kkdForm.type==='Suaka Alam Perairan (SAP)'?'selected':''}>Suaka Alam Perairan (SAP)</option><option ${state.kkdForm.type==='Taman Wisata Perairan (TWP)'?'selected':''}>Taman Wisata Perairan (TWP)</option></select></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Luas Area</label><input type="text" id="kkdLuas" value="${state.kkdForm.luas}" placeholder="Contoh: 15.000 Hektar" class="w-full px-3 py-2 border rounded-lg" required></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">No. SK Penetapan</label><input type="text" id="kkdSk" value="${state.kkdForm.sk}" placeholder="Nomor SK..." class="w-full px-3 py-2 border rounded-lg"></div></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Gambar KKD</label><input type="file" id="kkdImageFile" accept="image/*" class="w-full px-4 py-2 border rounded-lg text-sm"></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Target Konservasi</label><input type="text" id="kkdTarget" value="${state.kkdForm.target}" placeholder="Contoh: Terumbu Karang, Penyu, Lamun" class="w-full px-3 py-2 border rounded-lg"></div><div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Profil</label><textarea id="kkdDesc" rows="3" class="w-full px-3 py-2 border rounded-lg">${state.kkdForm.description}</textarea></div><div class="bg-blue-50 p-4 rounded-xl border border-blue-100"><label class="block text-xs font-bold text-[#003366] uppercase mb-2">Data Zonasi</label><p class="text-[10px] text-slate-500 mb-2">Format: <strong>Nama Zona, Luas, Fungsi Utama</strong> (Satu zona per baris)</p><textarea id="kkdZonasi" rows="4" placeholder="Zona Inti, 2000 Ha, Perlindungan&#10;Zona Pemanfaatan, 5000 Ha, Wisata" class="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-900 outline-none">${state.kkdForm.zonasiText}</textarea></div><div class="flex justify-end gap-3 pt-4 border-t border-slate-100"><button type="button" onclick="closeKkdModal()" class="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button><button type="submit" class="px-5 py-2.5 text-sm font-bold text-white bg-[#003366] hover:bg-blue-900 rounded-lg">Simpan Data</button></div></form></div></div>`;
}

function renderNewsModal() {
    const isEdit = state.editingNewsId !== null;
    return `<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold">${isEdit?'Edit Berita':'Tulis Berita Baru'}</h3><button onclick="closeNewsModal()"><i data-lucide="x" class="w-6 h-6 text-slate-400"></i></button></div><form onsubmit="handleNewsSubmit(event)" class="space-y-4"><input type="text" id="newsTitle" value="${state.newsForm.title}" placeholder="Judul Artikel" class="w-full px-4 py-2 border rounded-lg" required><div class="grid grid-cols-2 gap-4"><select id="newsCategory" class="w-full px-4 py-2 border rounded-lg bg-white"><option ${state.newsForm.category==='Umum'?'selected':''}>Umum</option><option ${state.newsForm.category==='Konservasi'?'selected':''}>Konservasi</option><option ${state.newsForm.category==='Pemerintahan'?'selected':''}>Pemerintahan</option></select><div><input type="file" id="newsImageFile" accept="image/*" class="w-full px-4 py-2 border rounded-lg text-sm"></div></div><textarea id="newsContent" rows="5" placeholder="Isi berita..." class="w-full px-4 py-2 border rounded-lg" required>${state.newsForm.content}</textarea><div class="flex justify-end gap-2"><button type="button" onclick="closeNewsModal()" class="px-4 py-2 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg">Batal</button><button type="submit" class="px-4 py-2 bg-[#003366] text-white rounded-lg font-bold hover:bg-blue-900">Simpan</button></div></form></div></div>`;
}

function renderAddModal() {
    return `<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"><h3 class="text-xl font-bold mb-4">Upload Foto</h3><form onsubmit="handleAddPhoto(event)" class="space-y-4"><div><input type="file" id="galleryImageFile" accept="image/*" class="w-full px-4 py-2 border rounded-lg text-sm" required></div><input type="text" id="newCaption" placeholder="Keterangan Foto" class="w-full px-4 py-2 border rounded-lg" required><input type="text" id="newLocation" placeholder="Lokasi (Daerah KKD)" class="w-full px-4 py-2 border rounded-lg" required><div class="flex justify-end gap-2"><button type="button" onclick="toggleModal(false)" class="px-4 py-2 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg">Batal</button><button type="submit" class="px-4 py-2 bg-[#003366] text-white rounded-lg font-bold hover:bg-blue-900">Simpan</button></div></form></div></div>`;
}