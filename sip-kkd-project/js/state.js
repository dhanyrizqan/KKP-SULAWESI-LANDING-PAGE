// --- STATE MANAGEMENT ---

const defaultState = {
    view: 'home',
    isLoggedIn: false,
    mobileMenuOpen: false,
    selectedId: null,
    dashboardTab: 'locations',
    
    // STATE PENCARIAN (BARU)
    searchLocationQuery: '',
    searchNewsQuery: '',

    // DATA WILAYAH (PROVINSI & KKD)
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

async function saveState() {
    const dbData = { provinces: state.provinces, gallery: state.gallery, news: state.news };
    await apiService.saveData(dbData);
}