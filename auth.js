console.log("File auth.js berhasil dimuat!");

// 1. ISI DENGAN DATA DARI SUPABASE KAMU (Project Settings > API)
const SUPABASE_URL = 'https://yrxjapqbdmkyjcepodbl.supabase.co'; // Ganti dengan URL kamu
const SUPABASE_KEY = 'sb_publishable_H-DcuiBuFd_reOG77oQ5Jg_Pa-01F4J'; // Ganti dengan Anon Key kamu

// 2. DEFINISIKAN supabaseClient DI SINI
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// --- BAGIAN LOGIN (PROSES MASUK) ---
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data: user, error } = await supabaseClient
            .from('user')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !user) {
            alert("Email atau Password salah!");
            return;
        }

        if (user) {
    localStorage.setItem('userNama', user.nama);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userRole', user.role); // TAMBAHKAN INI

    alert("Selamat datang, " + user.nama);
    
    // Opsional: Jika dia admin, langsung arahkan ke admin.html
    if (user.role === 'admin') {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }
      } // Penutup if (user)
    } catch (err) { // Tambahkan penutup try dan blok catch
        console.error(err);
        alert("Terjadi kesalahan saat login.");
    }
} // Penutup fungsi handleLogin

// --- BAGIAN REGISTER (PROSES DAFTAR) ---
async function handleRegister() {
    const nama = document.getElementById('regNama').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const whatsapp = document.getElementById('regWA').value;
    const alamat = document.getElementById('regAlamat').value;

    try {
        const { error } = await supabaseClient
            .from('user') // Pastikan kamu punya tabel 'users' di Supabase
            .insert([{ 
                nama: nama, 
                email: email, 
                password: password, // Catatan: Sebaiknya gunakan Auth bawaan Supabase untuk keamanan
                whatsapp: whatsapp, 
                alamat: alamat 
            }]);

        if (error) throw error;

        alert("Pendaftaran Berhasil! Silakan Login.");
        window.location.href = "login.html"; // Arahkan ke halaman login
    } catch (err) {
        alert("Gagal Daftar: " + err.message);
    }
}


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

// Fungsi ini dijalankan setiap kali halaman di-refresh
window.onload = function() {
    const authMenu = document.getElementById('authMenu');
    const loggedInUser = localStorage.getItem('userNama'); 
    const userRole = localStorage.getItem('userRole'); // Ambil role

    if (loggedInUser && authMenu) {
        // Cek jika admin, tambahkan menu Admin Panel
        let adminLink = "";
        if (userRole === 'admin') {
            adminLink = `<li><a class="dropdown-item fw-bold text-warning" href="admin.html">Admin Panel</a></li>`;
        }

        authMenu.innerHTML = `
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle user-name" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: #FFA500; font-weight: bold;">
                    <i class="bi bi-person-circle"></i> Halo, ${loggedInUser}
                </a>
                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" aria-labelledby="navbarDropdown">
                    ${adminLink} 
                    <li><a class="dropdown-item" href="riwayat.html">Riwayat Pesanan</a></li>
                    <li><hr class="dropdown-divider border-secondary"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </div>
        `;
    }
};

// Fungsi Logout untuk menghapus sesi dan mengalihkan halaman
function logout() {
    // 1. Hapus data sesi dari browser
    localStorage.removeItem('userNama');
    localStorage.removeItem('userEmail');

    // 2. Tampilkan pesan perpisahan (opsional agar lebih ramah)
    alert("Anda telah berhasil keluar.");

    // 3. ALIKAN KE HALAMAN LOGIN
    window.location.href = "login.html";
}


// Jalankan saat web dibuka
tampilkanUlasan();

// --- BAGIAN BUAT PESANAN (CREATE BOOKING) ---
async function buatPesanan() {
    // 1. Ambil data dari form booking.html
    const pemesan = localStorage.getItem('userNama'); // Ambil dari sesi login
    const mobil = document.getElementById('pilihMobil').value;
    const durasi = document.getElementById('durasiSewa').value;
    
    // Pastikan fungsi hitungHarga() tersedia untuk mendapatkan total
    const total = hitungHarga(); 

    // Validasi sederhana agar tidak ada data kosong
    if (!mobil || !durasi || durasi <= 0) {
        alert("Harap pilih mobil dan isi durasi sewa dengan benar!");
        return;
    }

    // Ambil tombol agar bisa diberi efek loading
    const btnPesan = document.querySelector('.btn-pesan');
    btnPesan.innerText = "Memproses Pesanan...";
    btnPesan.disabled = true;

    try {
        // 2. Kirim data ke tabel 'pesanan' di Supabase
        const { error } = await supabaseClient
            .from('pesanan') // Nama tabel yang baru saja kita buat
            .insert([{ 
                nama_pemesan: pemesan, 
                mobil: mobil, 
                durasi: parseInt(durasi), 
                total_harga: total,
                status: "Menunggu Konfirmasi"
            }]);

        if (error) throw error;

        // 3. Jika berhasil
        alert("Pesanan Berhasil Dikirim! Kami akan segera menghubungi Anda.");
        window.location.href = "index.html"; // Kembali ke beranda
    } catch (err) {
        alert("Gagal membuat pesanan: " + err.message);
        console.error(err);
    } finally {
        btnPesan.innerText = "KONFIRMASI PESANAN";
        btnPesan.disabled = false;
    }
}

// --- BAGIAN AMBIL RIWAYAT PESANAN (READ BY USER) ---
async function ambilRiwayatPesanan(namaUser) {
    try {
        const { data: listPesanan, error } = await supabaseClient
            .from('pesanan')
            .select('*')
            .eq('nama_pemesan', namaUser) // Filter: Hanya ambil pesanan milik user ini
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tabel = document.getElementById('tabelRiwayat');
        if (listPesanan && listPesanan.length > 0) {
            tabel.innerHTML = '';
            listPesanan.forEach(item => {
                // Tentukan warna badge berdasarkan status
                const badgeClass = item.status === 'Menunggu Konfirmasi' ? 'badge-pending' : 'badge-success';
                
                tabel.innerHTML += `
                    <tr>
                        <td>${item.mobil}</td>
                        <td>${item.durasi} Jam</td>
                        <td>Rp ${item.total_harga.toLocaleString('id-ID')}</td>
                        <td><span class="badge ${badgeClass}">${item.status}</span></td>
                    </tr>
                `;
            });
        } else {
            tabel.innerHTML = '<tr><td colspan="4" class="text-center text-secondary">Belum ada riwayat pesanan.</td></tr>';
        }
    } catch (err) {
        console.error("Gagal mengambil riwayat:", err.message);
    }
}