// --- CONTROLLER LOGIC ---

// Navigation & Auth
function navigate(viewName) {
    state.view = viewName;
    state.mobileMenuOpen = false;
    render(); 
    window.scrollTo(0,0);
}

function toggleMobileMenu() {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    render();
}

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === 'admin123') {
        state.isLoggedIn = true;
        navigate('dashboard');
    } else {
        alert('Gagal Login! Coba: admin / admin123');
    }
}

function handleLogout() {
    if(confirm('Keluar dari Admin?')) {
        state.isLoggedIn = false;
        navigate('home');
    }
}

function switchTab(tabName) {
    state.dashboardTab = tabName;
    render();
}

// View Details Helpers
function viewProvince(id) { state.selectedId = id; navigate('province-detail'); }
function viewKkd(id) { state.selectedId = id; navigate('kkd-detail'); }
function viewPost(id) { state.selectedId = id; navigate('post-detail'); }

// CRUD: Province
function toggleProvAccordion(id) {
    state.expandedProvId = state.expandedProvId === id ? null : id;
    render();
}
function openProvModal(id) {
    state.editingProvId = id;
    state.provForm = { ...state.provinces.find(p => p.id === id) };
    state.showProvModal = true;
    render();
}
function closeProvModal() {
    state.showProvModal = false;
    render();
}
async function handleProvSubmit(e) {
    e.preventDefault();
    const file = document.getElementById('provImageFile').files[0];
    if (file) state.provForm.image = await readFile(file);
    
    state.provForm.name = document.getElementById('provName').value;
    state.provForm.description = document.getElementById('provDesc').value;
    
    state.provinces = state.provinces.map(p => p.id === state.editingProvId ? { ...p, ...state.provForm } : p);
    
    await saveState();
    closeProvModal();
    render();
}

// CRUD: KKD
function openKkdModal(provId, kkdId = null) {
    state.selectedProvIdForKkd = provId;
    state.editingKkdId = kkdId;
    
    if (kkdId) {
        const kkd = state.provinces.find(p => p.id === provId).kkds.find(k => k.id === kkdId);
        let zText = '';
        if (kkd.zonasi) zText = kkd.zonasi.map(z => `${z.zona},${z.luas},${z.fungsi}`).join('\n');
        state.kkdForm = { ...kkd, zonasiText: zText };
    } else {
        state.kkdForm = { name: '', type: '', luas: '', sk: '', target: '', image: '', description: '', zonasiText: '' };
    }
    state.showKkdModal = true;
    render();
}
function closeKkdModal() {
    state.showKkdModal = false;
    render();
}
async function handleKkdSubmit(e) {
    e.preventDefault();
    const file = document.getElementById('kkdImageFile').files[0];
    if (file) state.kkdForm.image = await readFile(file);
    
    const zRaw = document.getElementById('kkdZonasi').value;
    const zArr = zRaw.split('\n').map(l => {
        const p = l.split(',');
        return { zona: p[0] || '', luas: p[1] || '', fungsi: p[2] || '' };
    });

    const newData = {
        ...state.kkdForm,
        name: document.getElementById('kkdName').value,
        type: document.getElementById('kkdType').value,
        luas: document.getElementById('kkdLuas').value,
        sk: document.getElementById('kkdSk').value,
        description: document.getElementById('kkdDesc').value,
        zonasi: zArr
    };

    state.provinces = state.provinces.map(p => {
        if (p.id === state.selectedProvIdForKkd) {
            let k = [...(p.kkds || [])];
            if (state.editingKkdId) {
                k = k.map(i => i.id === state.editingKkdId ? { ...i, ...newData } : i);
            } else {
                k.push({ id: Date.now(), ...newData });
            }
            return { ...p, kkds: k };
        }
        return p;
    });

    await saveState();
    closeKkdModal();
    render();
}
function deleteKkd(pid, kid) {
    if (confirm('Hapus Data KKD ini?')) {
        state.provinces = state.provinces.map(p => p.id === pid ? { ...p, kkds: p.kkds.filter(k => k.id !== kid) } : p);
        saveState();
        render();
    }
}

// CRUD: News
function openNewsModal() { state.showNewsModal = true; state.editingNewsId = null; state.newsForm = { title: '', category: 'Umum', content: '' }; render(); }
function closeNewsModal() { state.showNewsModal = false; render(); }
function editNews(id) { state.editingNewsId = id; state.newsForm = { ...state.news.find(n => n.id === id) }; state.showNewsModal = true; render(); }
async function handleNewsSubmit(e) {
    e.preventDefault();
    const file = document.getElementById('newsImageFile').files[0];
    if (file) state.newsForm.image = await readFile(file);
    
    const newData = {
        ...state.newsForm,
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        date: new Date().toLocaleDateString('id-ID')
    };

    if (state.editingNewsId) state.news = state.news.map(n => n.id === state.editingNewsId ? { ...n, ...newData } : n);
    else state.news.unshift({ id: Date.now(), ...newData });

    await saveState();
    closeNewsModal();
    render();
}
function deleteNews(id) { if (confirm('Hapus Berita?')) { state.news = state.news.filter(n => n.id !== id); saveState(); render(); } }

// CRUD: Gallery
function toggleModal(show) { state.showAddModal = show; render(); }
async function handleAddPhoto(e) {
    e.preventDefault();
    const file = document.getElementById('galleryImageFile').files[0];
    if (!file) return alert("Pilih foto dulu!");
    const img = await readFile(file);
    state.gallery.unshift({ id: Date.now(), url: img, caption: document.getElementById('newCaption').value, date: new Date().toLocaleDateString() });
    await saveState();
    toggleModal(false);
}
function deletePhoto(id) { if (confirm('Hapus Foto?')) { state.gallery = state.gallery.filter(g => g.id !== id); saveState(); render(); } }

// --- SEARCH HANDLERS ---
function handleSearchLocation(e) {
    state.searchLocationQuery = e.target.value;
    render(); // Re-render otomatis saat mengetik
}

function handleSearchNews(e) {
    state.searchNewsQuery = e.target.value;
    render(); // Re-render otomatis saat mengetik
}
// Contact Form
function handleContactSubmit(e) { e.preventDefault(); alert("Pesan Terkirim!"); e.target.reset(); }