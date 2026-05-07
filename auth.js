// --- BAGIAN TAMPILKAN ULASAN (READ) ---
async function tampilkanUlasan() {
    try {
        const { data: listUlasan, error } = await supabaseClient
            .from('ulasan')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const wadah = document.getElementById('daftar-ulasan-container');
        if (wadah) {
            if (listUlasan && listUlasan.length > 0) {
                wadah.innerHTML = '';
                listUlasan.forEach(item => {
                    wadah.innerHTML += `
                        <div class="mb-4 pb-3 border-bottom border-secondary">
                            <div class="d-flex align-items-center mb-2">
                                <img src="https://ui-avatars.com/api/?name=${item.nama}&background=FFC107&color=000" class="rounded-circle me-2" width="40">
                                <h6 class="m-0 fw-bold text-white">${item.nama}</h6>
                            </div>
                            <p class="small text-light opacity-75 m-0">"${item.pesan}"</p>
                        </div>
                    `;
                });
            } else {
                wadah.innerHTML = '<p class="text-secondary small">Belum ada ulasan.</p>';
            }
        }
    } catch (err) {
        console.error("Error saat ambil data:", err.message);
    }
}

// --- BAGIAN KIRIM ULASAN (CREATE) ---
const formUlasan = document.getElementById('form-ulasan');

if (formUlasan) {
    formUlasan.addEventListener('submit', async (e) => {
        e.preventDefault(); // Menghentikan refresh halaman
        
        const btnKirim = e.target.querySelector('button');
        const nama = document.getElementById('input-nama').value;
        const pesan = document.getElementById('input-pesan').value;

        // Beri tanda sedang memproses
        btnKirim.innerText = "Mengirim...";
        btnKirim.disabled = true;

        try {
            const { error } = await supabaseClient
                .from('ulasan')
                .insert([{ nama: nama, pesan: pesan }]);

            if (error) throw error;

            alert("Berhasil! Ulasan kamu sudah terbit.");
            formUlasan.reset();
            tampilkanUlasan(); // Update daftar tanpa refresh total
        } catch (err) {
            alert("Gagal kirim: " + err.message);
            console.error(err);
        } finally {
            btnKirim.innerText = "Kirim Ulasan";
            btnKirim.disabled = false;
        }
    });
}

// Jalankan saat web dibuka
tampilkanUlasan();