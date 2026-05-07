// --- BAGIAN KIRIM ULASAN ---
const formUlasan = document.getElementById('form-ulasan');

if (formUlasan) {
    formUlasan.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nama = document.getElementById('input-nama').value;
        const pesan = document.getElementById('input-pesan').value;

        // Kirim ke tabel 'ulasan' di Supabase
        const { data, error } = await supabaseClient
            .from('ulasan')
            .insert([{ nama: nama, pesan: pesan }]);

        if (error) {
            alert("Waduh, gagal kirim: " + error.message);
        } else {
            alert("Berhasil! Ulasan kamu sudah terbit.");
            formUlasan.reset(); // Kosongkan form setelah kirim
            tampilkanUlasan();  // Refresh daftar ulasan
        }
    });
}

// --- BAGIAN TAMPILKAN ULASAN ---
async function tampilkanUlasan() {
    const { data: listUlasan, error } = await supabaseClient
        .from('ulasan')
        .select('*')
        .order('created_at', { ascending: false });

    const wadah = document.getElementById('daftar-ulasan-container');
    
    if (wadah) {
        if (listUlasan && listUlasan.length > 0) {
            wadah.innerHTML = ''; // Hapus tulisan "Memuat..."
            listUlasan.forEach(item => {
                wadah.innerHTML += `
                    <div class="mb-4 pb-3 border-bottom border-secondary">
                        <div class="d-flex align-items-center mb-2">
                            <img src="https://ui-avatars.com/api/?name=${item.nama}&background=FFC107&color=000" class="rounded-circle me-2" width="40">
                            <h6 class="m-0 fw-bold">${item.nama}</h6>
                        </div>
                        <p class="small text-light opacity-75 m-0">"${item.pesan}"</p>
                    </div>
                `;
            });
        } else {
            wadah.innerHTML = '<p class="text-secondary small">Belum ada ulasan. Jadilah yang pertama!</p>';
        }
    }
}

// Jalankan fungsi tampil saat web dibuka
tampilkanUlasan();