// --- KONFIGURASI ---
const CONFIG = {
    USE_API: true, // Pastikan ini true untuk connect ke Node.js/PostgreSQL
    API_URL: 'http://localhost:3000/api',
    STORAGE_KEY: 'qwerty123'
};

// --- HELPER FUNCTIONS ---
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}