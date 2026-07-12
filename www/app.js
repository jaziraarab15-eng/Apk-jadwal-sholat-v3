/* ==================================================
   Jadwal Sholat V5 Full
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

document.addEventListener("DOMContentLoaded", init);

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

/* ==================================================
   GPS
================================================== */

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

/* ==================================================
   Nama Kota Otomatis
================================================== */

async function loadCity() {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${App.latitude}&lon=${App.longitude}`;

        const res = await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        const json = await res.json();

        App.city =
            json.address.city ||
            json.address.town ||
            json.address.village ||
            json.address.county ||
            "Lokasi Tidak Diketahui";

        const city =
            document.getElementById("city");

        if (city) {

            city.textContent = App.city;

        }

        const location =
            document.getElementById("location");

        if (location) {

            location.textContent = App.city;

        }

    } catch (e) {

        console.error(e);

    }

}

/* ==================================================
   Loading
================================================== */

function hideLoading() {

    const loading =
        document.getElementById("loadingScreen");

    if (loading) {

        loading.style.display = "none";

    }

}

/* ==================================================
   Jam
================================================== */

function startClock() {

    updateCountdown();

    setInterval(updateCountdown, 1000);

}
/* ==================================================
   Jadwal Sholat V5 Full
   app.js - Bagian 2
================================================== */

/* ==================================================
   Jadwal Sholat Hari Ini
================================================== */

async function loadTodayPrayer() {

    const today = new Date();

    const day =
        String(today.getDate()).padStart(2,"0");

    const month =
        String(today.getMonth()+1).padStart(2,"0");

    const year =
        today.getFullYear();

    const url =
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}` +
        `?latitude=${App.latitude}` +
        `&longitude=${App.longitude}` +
        `&method=${API_METHOD}`;

    const res = await fetch(url);

    if(!res.ok){

        throw new Error("Gagal mengambil jadwal.");

    }

    const json = await res.json();

    App.timings = json.data.timings;
await NotificationManager.schedulePrayerNotifications(App.timings);

    /* ==========================
       Tanggal Masehi
    ========================== */

    const tanggal =
        document.getElementById("tanggal");

    if(tanggal){

        tanggal.textContent =
    json.data.date.gregorian.date;

    }

    /* ==========================
       Tanggal Hijriah
    ========================== */

    const hijriah =
        document.getElementById("hijriah");

    if(hijriah){

        hijriah.textContent =
            json.data.date.hijri.day +
            " " +
            json.data.date.hijri.month.en +
            " " +
            json.data.date.hijri.year +
            " H";

    }

    /* ==========================
       Jadwal Hari Ini
    ========================== */

    setTime("fajr",App.timings.Fajr);
    setTime("sunrise",App.timings.Sunrise);
    setTime("dhuhr",App.timings.Dhuhr);
    setTime("asr",App.timings.Asr);
    setTime("maghrib",App.timings.Maghrib);
    setTime("isha",App.timings.Isha);

/* Timestamp Jadwal Sholat */

const waktuSubuh = prayerTimeToTimestamp(App.timings.Fajr);
const waktuZuhur = prayerTimeToTimestamp(App.timings.Dhuhr);
const waktuAshar = prayerTimeToTimestamp(App.timings.Asr);
const waktuMaghrib = prayerTimeToTimestamp(App.timings.Maghrib);
const waktuIsya = prayerTimeToTimestamp(App.timings.Isha);

/* Jadwalkan Notifikasi */

if (window.NotificationManager) {

    await NotificationManager.init();

    await NotificationManager.schedulePrayerNotifications(App.timings);

}

/* ==========================
   Simpan Alarm Native Android
========================== */
if (window.PrayerPlugin) {
    await PrayerPlugin.savePrayer({
        prayer: "Subuh",
        triggerTime: waktuSubuh
    });

    await PrayerPlugin.savePrayer({
        prayer: "Zuhur",
        triggerTime: waktuZuhur
    });

    await PrayerPlugin.savePrayer({
        prayer: "Ashar",
        triggerTime: waktuAshar
    });

    await PrayerPlugin.savePrayer({
        prayer: "Maghrib",
        triggerTime: waktuMaghrib
    });

    await PrayerPlugin.savePrayer({
        prayer: "Isya",
        triggerTime: waktuIsya
    });

    console.log("Alarm native berhasil dijadwalkan.");
}

    /* =========================
       Background Otomatis
    ========================== */

    updateBackground();

}

/* ==================================================
   Mengisi Jam Sholat
================================================== */

function setTime(id,value){

    const el =
        document.getElementById(id);

    if(!el) return;

    el.textContent =
        value.substring(0,5);

}

/* =====================================
   Jam -> Timestamp
===================================== */

function prayerTimeToTimestamp(timeString) {

    const now = new Date();

    const parts = timeString.substring(0, 5).split(":");

    const date = new Date();

    date.setFullYear(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    date.setHours(parseInt(parts[0]));
    date.setMinutes(parseInt(parts[1]));
    date.setSeconds(0);
    date.setMilliseconds(0);

    if (date.getTime() < now.getTime()) {
        date.setDate(date.getDate() + 1);
    }

    return date.getTime();

}

/* ==================================================
   Background Otomatis
================================================== */

function updateBackground(){

    if(!App.timings) return;

    const body = document.body;

    body.classList.remove(
        "bg-subuh",
        "bg-siang",
        "bg-maghrib",
        "bg-malam"
    );

    const now = new Date();

    const current =
        now.getHours()*60 + now.getMinutes();

    function toMinutes(time){

        const p =
            time.substring(0,5).split(":");

        return parseInt(p[0])*60 +
               parseInt(p[1]);

    }

    const fajr =
        toMinutes(App.timings.Fajr);

    const dhuhr =
        toMinutes(App.timings.Dhuhr);

    const maghrib =
        toMinutes(App.timings.Maghrib);

    const isha =
        toMinutes(App.timings.Isha);

    if(current >= fajr && current < dhuhr){

        body.classList.add("bg-subuh");

    }
    else if(current >= dhuhr && current < maghrib){

        body.classList.add("bg-siang");

    }
    else if(current >= maghrib && current < isha){

        body.classList.add("bg-maghrib");

    }
    else{

        body.classList.add("bg-malam");

    }

}
/* ==================================================
   Jadwal Sholat V5 Full
   app.js - Bagian 3
================================================== */

/* ==================================================
   Jadwal Bulanan
================================================== */

async function loadMonthlyPrayer(){

    const today = new Date();

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const url =
        `https://api.aladhan.com/v1/calendar/${year}/${month}` +
        `?latitude=${App.latitude}` +
        `&longitude=${App.longitude}` +
        `&method=${API_METHOD}`;

    const res = await fetch(url);

    if(!res.ok){

        throw new Error("Gagal mengambil jadwal bulanan.");

    }

    const json = await res.json();

    App.monthlyData = json.data;

    const tbody =
        document.getElementById("monthlyBody");

    if(!tbody) return;

    tbody.innerHTML = "";

    App.monthlyData.forEach(day => {

        const t = day.timings;

        tbody.insertAdjacentHTML("beforeend",`

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
   Refresh Data Otomatis
================================================== */

function refreshPrayerData(){

    setInterval(async()=>{

        try{

            await loadTodayPrayer();

            await loadMonthlyPrayer();

        }catch(err){

            console.error(err);

        }

    },60000);

}

/* ==================================================
   Refresh Saat Ganti Hari
================================================== */

function autoRefreshMidnight(){

    setInterval(async()=>{

        const now = new Date();

        if(
            now.getHours() === 0 &&
            now.getMinutes() === 0
        ){

            try{

                await loadTodayPrayer();

                await loadMonthlyPrayer();

            }catch(err){

                console.error(err);

            }

        }

    },60000);

}
/* ==================================================
   Jadwal Sholat V5 Full
   app.js - Bagian 4
================================================== */

/* ==================================================
   Countdown Sholat Berikutnya
================================================== */

function updateCountdown(){

    if(!App.timings) return;

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

    for(const prayer of prayers){

        const time =
            prayer[1].substring(0,5);

        const part =
            time.split(":");

        const target =
            new Date();

        target.setHours(
            parseInt(part[0])
        );

        target.setMinutes(
            parseInt(part[1])
        );

        target.setSeconds(0);

        if(target > now){

            nextName = prayer[0];

            nextTime = target;

            break;

        }

    }

    if(!nextTime){

        const part =
            App.timings.Fajr
            .substring(0,5)
            .split(":");

        nextTime =
            new Date();

        nextTime.setDate(
            nextTime.getDate()+1
        );

        nextTime.setHours(
            parseInt(part[0])
        );

        nextTime.setMinutes(
            parseInt(part[1])
        );

        nextTime.setSeconds(0);

        nextName = "Subuh";

    }

    const diff =
        nextTime-now;

    const h =
        Math.floor(diff/3600000);

    const m =
        Math.floor(
            (diff%3600000)/60000
        );

    const s =
        Math.floor(
            (diff%60000)/1000
        );

    const nextNameEl =
        document.getElementById("nextName");

    if(nextNameEl){

        nextNameEl.textContent =
            nextName;

    }

    const countdownEl =
        document.getElementById("countdown");

    if(countdownEl){

        countdownEl.textContent =
            String(h).padStart(2,"0") +
            ":" +
            String(m).padStart(2,"0") +
            ":" +
            String(s).padStart(2,"0");

    }

}

/* ==================================================
   Arah Kiblat
================================================== */

function updateQibla(){

    if(
        App.latitude==null ||
        App.longitude==null
    ) return;

    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const lat1 =
        App.latitude*Math.PI/180;

    const lon1 =
        App.longitude*Math.PI/180;

    const lat2 =
        kaabaLat*Math.PI/180;

    const lon2 =
        kaabaLon*Math.PI/180;

    const y =
        Math.sin(lon2-lon1);

    const x =
        Math.cos(lat1)*
        Math.tan(lat2)-
        Math.sin(lat1)*
        Math.cos(lon2-lon1);

    let bearing =
        Math.atan2(y,x)*
        180/Math.PI;

    bearing =
        (bearing+360)%360;

    const qibla =
        document.getElementById(
            "qiblatDirection"
        );

    if(qibla){

        qibla.textContent =
            bearing.toFixed(1)+"°";

    }

}

/* ==================================================
   Notifikasi Adzan
================================================== */

function initNotificationSetting(){

    const toggle =
        document.getElementById(
            "notifToggle"
        );

    if(!toggle) return;

    const saved =
        localStorage.getItem(
            "adzan_notification"
        );

    toggle.checked =
        saved==="true";

    toggle.addEventListener(
        "change",
        ()=>{

            localStorage.setItem(
                "adzan_notification",
                toggle.checked
            );

        }
    );

}
/* ==================================================
   Jadwal Sholat V5 Full
   app.js - Bagian 5
================================================== */

/* ==================================================
   Inisialisasi Tambahan
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {

        updateQibla();

        initNotificationSetting();

        refreshPrayerData();

        autoRefreshMidnight();

        updateBackground();

    }, 1000);

});

/* ==================================================
   Update Background Berkala
================================================== */

setInterval(() => {

    updateBackground();

}, 60000);

/* ==================================================
   Refresh Kiblat
================================================== */

setInterval(() => {

    updateQibla();

}, 5000);

/* ==================================================
   Refresh Countdown
================================================== */

setInterval(() => {

    updateCountdown();

}, 1000);

/* ==================================================
   Refresh Kota
================================================== */

setInterval(async () => {

    try{

        await loadCity();

    }catch(e){

        console.error(e);

    }

}, 1800000);

/* ==================================================
   Refresh Jadwal Setiap 6 Jam
================================================== */

setInterval(async () => {

    try{

        await loadTodayPrayer();

        await loadMonthlyPrayer();

    }catch(e){

        console.error(e);

    }

}, 21600000);

/* ==================================================
   Log
================================================== */

console.log("===================================");

console.log("🕌 Jadwal Sholat V5 Full");

console.log("Background otomatis aktif");

console.log("Nama kota otomatis aktif");

console.log("Countdown aktif");

console.log("Jadwal bulanan aktif");

console.log("Kiblat aktif");

console.log("===================================");
