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

        // SIMPAN SESI LOGIN (Ini yang membuat nama muncul di Navbar)
        localStorage.setItem('userNama', user.nama);
        localStorage.setItem('userEmail', user.email);

        alert("Selamat datang kembali, " + user.nama);
        window.location.href = "index.html"; // Kembali ke halaman utama
    } catch (err) {
        alert("Terjadi kesalahan: " + err.message);
    }
}

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

    if (loggedInUser && authMenu) {
        // Tampilan saat sudah login (Halo Nama + Dropdown/Logout)
        authMenu.innerHTML = `
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle user-name" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle"></i> Halo, ${loggedInUser}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </div>
        `;
    }
};

// Fungsi Logout untuk menghapus sesi
function logout() {
    localStorage.removeItem('userNama');
    localStorage.removeItem('userEmail');
    window.location.reload(); // Refresh halaman agar menu kembali ke "Login"
}

// Jalankan saat web dibuka
tampilkanUlasan();