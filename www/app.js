/* ==================================================
   Jadwal Sholat V3
   app.js - Bagian 1
================================================== */

const App = {
    latitude: null,
    longitude: null,
    city: "",
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
        await loadTodayPrayer();
        await loadMonthlyPrayer();

        startClock();

        hideLoading();
   } catch (err) {
    console.error(err);
    alert("Gagal memuat data:\n\n" + (err.message || err));
}

async function getLocation() {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject("Geolocation tidak didukung.");
            return;
        }

        navigator.geolocation.getCurrentPosition(

            position => {

                App.latitude = position.coords.latitude;
                App.longitude = position.coords.longitude;

                document.getElementById("location").textContent =
                    App.latitude.toFixed(5) +
                    ", " +
                    App.longitude.toFixed(5);

                resolve();

            },

            error => reject(error),

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    });

}

function hideLoading(){

    const loading = document.getElementById("loadingScreen");

    if(loading){

        loading.style.display="none";

    }

}

function startClock(){

    setInterval(updateCountdown,1000);

}
/* ==================================================
   Mengambil Jadwal Sholat Hari Ini
================================================== */

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

    document.getElementById("tanggal").textContent =
        json.data.date.gregorian.date;

    document.getElementById("hijriah").textContent =
        json.data.date.hijri.day +
        " " +
        json.data.date.hijri.month.en +
        " " +
        json.data.date.hijri.year +
        " H";

    setTime("fajr", App.timings.Fajr);
    setTime("sunrise", App.timings.Sunrise);
    setTime("dhuhr", App.timings.Dhuhr);
    setTime("asr", App.timings.Asr);
    setTime("maghrib", App.timings.Maghrib);
    setTime("isha", App.timings.Isha);

}

function setTime(id, value) {

    const el = document.getElementById(id);

    if (!el) return;

    el.textContent = value.substring(0, 5);

}
/* ==================================================
   Jadwal Bulanan
================================================== */

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

    const tbody = document.getElementById("monthlyBody");

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

/* ==================================================
   Countdown Sholat Berikutnya
================================================== */

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

        const parts = prayer[1].substring(0,5).split(":");

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

        const parts = App.timings.Fajr.substring(0,5).split(":");

        nextTime = new Date();

        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setHours(parseInt(parts[0]));
        nextTime.setMinutes(parseInt(parts[1]));
        nextTime.setSeconds(0);

    }

    const diff = nextTime - now;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById("nextName").textContent = nextName;

    document.getElementById("countdown").textContent =
        String(h).padStart(2, "0") + ":" +
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");

}
/* ==================================================
   Jadwal Sholat V3
   app.js - Bagian 4
================================================== */

/* ==============================
   Arah Kiblat
============================== */

function updateQibla() {

    if (App.latitude == null || App.longitude == null) return;

    // Koordinat Ka'bah
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

    document.getElementById("qiblatDirection").textContent =
        bearing.toFixed(1) + "° dari Utara";
}

/* ==============================
   Notifikasi Adzan
============================== */

function initNotificationSetting() {

    const toggle = document.getElementById("notifToggle");

    if (!toggle) return;

    const saved = localStorage.getItem("adzan_notification");

    toggle.checked = saved === "true";

    toggle.addEventListener("change", () => {

        localStorage.setItem(
            "adzan_notification",
            toggle.checked
        );

    });

}

/* ==============================
   Inisialisasi Tambahan
============================== */

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {

        updateQibla();

        initNotificationSetting();

    }, 1000);

});
