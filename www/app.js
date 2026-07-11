/* ==================================================
   Jadwal Sholat V4 Premium
   app.js - Bagian 1
================================================== */

const App = {
    latitude: null,
    longitude: null,
    city: "Mendeteksi lokasi...",
    timings: null,
    monthlyData: []
};

const API_METHOD = 11;

document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {

    try {

        await getLocation();

        await loadCity();

        await loadTodayPrayer();

        await loadMonthlyPrayer();

        updateQibla();

        initNotificationSetting();

        startClock();

        hideLoading();

    } catch (err) {

        console.error(err);

        alert("Gagal memuat data.");

    }

}

/* =====================================
   GPS
===================================== */

async function getLocation() {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {

            reject("Geolocation tidak didukung");

            return;

        }

        navigator.geolocation.getCurrentPosition(

            position => {

                App.latitude = position.coords.latitude;
                App.longitude = position.coords.longitude;

                const lokasi =
                    App.latitude.toFixed(5) +
                    ", " +
                    App.longitude.toFixed(5);

                const el = document.getElementById("location");

                if (el) {

                    el.textContent = lokasi;

                }

                resolve();

            },

            error => {

                reject(error);

            },

            {

                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0

            }

        );

    });

}

/* =====================================
   Nama Kota Otomatis
===================================== */

async function loadCity() {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
            `&lat=${App.latitude}` +
            `&lon=${App.longitude}`;

        const res = await fetch(url, {

            headers: {

                "Accept": "application/json"

            }

        });

        const json = await res.json();

        const city =
            json.address.city ||
            json.address.town ||
            json.address.village ||
            json.address.county ||
            "Lokasi Tidak Diketahui";

        App.city = city;

        const cityEl = document.getElementById("city");

        if (cityEl) {

            cityEl.textContent = city;

        }

        const locationEl = document.getElementById("location");

        if (locationEl) {

            locationEl.textContent = city;

        }

    } catch (e) {

        console.error(e);

    }

}

/* =====================================
   Loading
===================================== */

function hideLoading() {

    const loading =
        document.getElementById("loadingScreen");

    if (loading) {

        loading.style.display = "none";

    }

}

/* =====================================
   Jam
===================================== */

function startClock() {

    setInterval(updateCountdown, 1000);

}
/* ==================================================
   Jadwal Sholat V4 Premium
   app.js - Bagian 2
================================================== */

/* =====================================
   Jadwal Sholat Hari Ini
===================================== */

async function loadTodayPrayer() {

    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    const url =
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}` +
        `?latitude=${App.latitude}` +
        `&longitude=${App.longitude}` +
        `&method=${API_METHOD}`;

    const res = await fetch(url);

    if (!res.ok) {

        throw new Error("Gagal mengambil jadwal sholat.");

    }

    const json = await res.json();

    App.timings = json.data.timings;

    /* ==========================
       Tanggal
    ========================== */

    const tanggal =
        json.data.date.gregorian.date;

    const hijriah =
        json.data.date.hijri.day +
        " " +
        json.data.date.hijri.month.en +
        " " +
        json.data.date.hijri.year +
        " H";

    const tanggalEl =
        document.getElementById("tanggal");

    if (tanggalEl) {

        tanggalEl.textContent = tanggal;

    }

    const hijriahEl =
        document.getElementById("hijriah");

    if (hijriahEl) {

        hijriahEl.textContent = hijriah;

    }

    const tanggalInfo =
        document.getElementById("tanggalInfo");

    if (tanggalInfo) {

        tanggalInfo.textContent = tanggal;

    }

    const hijriahInfo =
        document.getElementById("hijriahInfo");

    if (hijriahInfo) {

        hijriahInfo.textContent = hijriah;

    }

    /* ==========================
       Jadwal Hari Ini
    ========================== */

    setTime("fajr", App.timings.Fajr);
    setTime("sunrise", App.timings.Sunrise);
    setTime("dhuhr", App.timings.Dhuhr);
    setTime("asr", App.timings.Asr);
    setTime("maghrib", App.timings.Maghrib);
    setTime("isha", App.timings.Isha);

}

/* =====================================
   Mengisi Jam Sholat
===================================== */

function setTime(id, value) {

    const el =
        document.getElementById(id);

    if (!el) return;

    el.textContent =
        value.substring(0, 5);

}
/* ==================================================
   Jadwal Sholat V4 Premium
   app.js - Bagian 3
================================================== */

/* =====================================
   Jadwal Bulanan
===================================== */

async function loadMonthlyPrayer() {

    const today = new Date();

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const url =
        `https://api.aladhan.com/v1/calendar/${year}/${month}` +
        `?latitude=${App.latitude}` +
        `&longitude=${App.longitude}` +
        `&method=${API_METHOD}`;

    const res = await fetch(url);

    if (!res.ok) {

        throw new Error("Gagal mengambil jadwal bulanan.");

    }

    const json = await res.json();

    App.monthlyData = json.data;

    const tbody =
        document.getElementById("monthlyBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    App.monthlyData.forEach(day => {

        const t = day.timings;

        tbody.insertAdjacentHTML("beforeend", `

<tr>

<td>${day.date.gregorian.day}</td>

<td>${t.Fajr.substring(0,5)}</td>

<td>${t.Dhuhr.substring(0,5)}</td>

<td>${t.Asr.substring(0,5)}</td>

<td>${t.Maghrib.substring(0,5)}</td>

<td>${t.Isha.substring(0,5)}</td>

</tr>

        `);

    });

}

/* =====================================
   Refresh Jadwal Otomatis
===================================== */

function refreshPrayerData() {

    setInterval(async () => {

        try {

            await loadTodayPrayer();

        } catch (err) {

            console.error(err);

        }

    }, 60000);

}
/* ==================================================
   Jadwal Sholat V4 Premium
   app.js - Bagian 4
================================================== */


/* =====================================
   Countdown Sholat Berikutnya
===================================== */

function updateCountdown() {

    if (!App.timings) return;

    const prayers = [

        ["Subuh", App.timings.Fajr],
        ["Zuhur", App.timings.Dhuhr],
        ["Ashar", App.timings.Asr],
        ["Maghrib", App.timings.Maghrib],
        ["Isya", App.timings.Isha]

    ];

    const now = new Date();

    let nextName = "Subuh";
    let nextTime = null;

    for (const prayer of prayers) {

        const time = prayer[1].substring(0,5);

        const parts = time.split(":");

        const target = new Date();

        target.setHours(parseInt(parts[0]));
        target.setMinutes(parseInt(parts[1]));
        target.setSeconds(0);

        if (target > now) {

            nextName = prayer[0];
            nextTime = target;

            break;

        }

    }

    if (!nextTime) {

        nextName = "Subuh";

        const parts =
            App.timings.Fajr.substring(0,5).split(":");

        nextTime = new Date();

        nextTime.setDate(nextTime.getDate() + 1);

        nextTime.setHours(parseInt(parts[0]));
        nextTime.setMinutes(parseInt(parts[1]));
        nextTime.setSeconds(0);

    }

    const diff = nextTime - now;

    const hours =
        Math.floor(diff / 3600000);

    const minutes =
        Math.floor((diff % 3600000) / 60000);

    const seconds =
        Math.floor((diff % 60000) / 1000);

    const nextNameEl =
        document.getElementById("nextName");

    if (nextNameEl) {

        nextNameEl.textContent = nextName;

    }

    const countdownEl =
        document.getElementById("countdown");

    if (countdownEl) {

        countdownEl.textContent =
            String(hours).padStart(2,"0") + ":" +
            String(minutes).padStart(2,"0") + ":" +
            String(seconds).padStart(2,"0");

    }

}

/* =====================================
   Jalankan Countdown
===================================== */

setInterval(() => {

    updateCountdown();

}, 1000);
/* ==================================================
   Jadwal Sholat V4 Premium
   app.js - Bagian 5
================================================== */

/* =====================================
   Arah Kiblat
===================================== */

function updateQibla() {

    if (App.latitude == null || App.longitude == null) return;

    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const lat1 = App.latitude * Math.PI / 180;
    const lon1 = App.longitude * Math.PI / 180;

    const lat2 = kaabaLat * Math.PI / 180;
    const lon2 = kaabaLon * Math.PI / 180;

    const y = Math.sin(lon2 - lon1);

    const x =
        Math.cos(lat1) * Math.tan(lat2) -
        Math.sin(lat1) * Math.cos(lon2 - lon1);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;

    bearing = (bearing + 360) % 360;

    const qibla =
        document.getElementById("qiblatDirection");

    if (qibla) {

        qibla.textContent =
            bearing.toFixed(1) + "°";

    }

}

/* =====================================
   Notifikasi
===================================== */

function initNotificationSetting() {

    const toggle =
        document.getElementById("notifToggle");

    if (!toggle) return;

    const saved =
        localStorage.getItem("adzan_notification");

    toggle.checked = saved === "true";

    toggle.addEventListener("change", () => {

        localStorage.setItem(
            "adzan_notification",
            toggle.checked
        );

    });

}

/* =====================================
   Inisialisasi Tambahan
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {

        updateQibla();

        initNotificationSetting();

        refreshPrayerData();

    }, 1000);

});

/* =====================================
   Selesai
===================================== */

console.log("Jadwal Sholat V4 Premium berhasil dimuat.");
