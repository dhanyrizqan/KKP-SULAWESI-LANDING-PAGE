// --- API SERVICE ---
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