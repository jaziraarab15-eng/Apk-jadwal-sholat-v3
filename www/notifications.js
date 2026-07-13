/* ==================================================
   Jadwal Sholat V5 Premium
   notifications.js - Bagian 1
================================================== */

const NotificationManager = {

    initialized: false,

    async init() {

        if (this.initialized) return;

        this.initialized = true;

        try {

            if (!window.Capacitor) {

                console.log("Capacitor tidak tersedia.");

                return;

            }

            const { LocalNotifications } =
                Capacitor.Plugins;

            const permission =
                await LocalNotifications.requestPermissions();

            if (permission.display !== "granted") {

                console.log("Izin notifikasi ditolak.");

                return;

            }

            await LocalNotifications.createChannel({

                id: "adzan",

                name: "Notifikasi Adzan",

                description: "Pengingat waktu sholat",

                importance: 5,

                visibility: 1,

                vibration: true,

                lights: true

            });

            console.log("Channel notifikasi siap.");

        } catch (e) {

            console.error(e);

        }

    }

};
/* ==================================================
   Jadwal Sholat V5 Premium
   notifications.js - Bagian 2
================================================== */

/* =====================================
   Jadwalkan Notifikasi Sholat
===================================== */

NotificationManager.schedulePrayerNotifications =
async function (timings) {

    console.log("schedulePrayerNotifications dipanggil");
    console.log(timings);

    if (!window.Capacitor) return;

    const { LocalNotifications } =
        Capacitor.Plugins;

    try {

        /* Hapus jadwal lama */

        const pending =
            await LocalNotifications.getPending();

        if (pending.notifications.length > 0) {

            await LocalNotifications.cancel({
                notifications: pending.notifications
            });

        }

        const today = new Date();

        const prayers = [

            { id: 1, title: "🕌 Waktu Subuh", time: timings.Fajr },
            { id: 2, title: "☀️ Waktu Zuhur", time: timings.Dhuhr },
            { id: 3, title: "🌇 Waktu Ashar", time: timings.Asr },
            { id: 4, title: "🌆 Waktu Maghrib", time: timings.Maghrib },
            { id: 5, title: "🌙 Waktu Isya", time: timings.Isha }

        ];

        const notifications = [];

        prayers.forEach(prayer => {

            const parts =
                prayer.time.substring(0, 5).split(":");

            const date = new Date(today);

            date.setHours(parseInt(parts[0]));
            date.setMinutes(parseInt(parts[1]));
            date.setSeconds(0);

            /* Jika sudah lewat, jadwalkan besok */

            if (date <= new Date()) {

                date.setDate(date.getDate() + 1);

            }

            notifications.push({

                id: prayer.id,

                title: prayer.title,

                body: "Telah masuk waktu sholat.",

                schedule: {

                    at: date,

                    allowWhileIdle: true

                },

                                channelId: "adzan"

            });

        });

        console.log("Akan menjadwalkan:", notifications);

        await LocalNotifications.schedule({
            notifications: notifications
        });

        const pendingAfter =
            await LocalNotifications.getPending();

        console.log(
            "Pending:",
            pendingAfter.notifications
        );

        console.log(
            "Notifikasi sholat berhasil dijadwalkan."
        );

    } catch (err) {

        console.error(err);

    }

};
/* ==================================================
   Jadwal Sholat V5 Premium
   notifications.js - Bagian 3
================================================== */

/* =====================================
   Penjadwalan Ulang Otomatis
===================================== */

NotificationManager.startAutoRefresh = function () {

    /* Cek setiap 5 menit */

    setInterval(async () => {

        try {

            const now = new Date();

            /* Jam 00:01 */

            if (
                now.getHours() === 0 &&
                now.getMinutes() === 1
            ) {

                console.log(
                    "Memperbarui jadwal notifikasi..."
                );

                if (
                    typeof loadTodayPrayer === "function"
                ) {

                    await loadTodayPrayer();

                }

                if (
                    App &&
                    App.timings
                ) {

                    await NotificationManager
                        .schedulePrayerNotifications(
                            App.timings
                        );

                }

            }

        } catch (e) {

            console.error(e);

        }

    }, 300000);

};

/* =====================================
   Saat Notifikasi Ditekan
===================================== */

if (window.Capacitor) {

    const {
        LocalNotifications
    } = Capacitor.Plugins;

    LocalNotifications.addListener(

        "localNotificationActionPerformed",

        notification => {

            console.log(
                "Notifikasi dibuka",
                notification
            );

        }

    );

}

/* =====================================
   Mulai Notification Manager
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        if (
            window.NotificationManager
        ) {

            await NotificationManager.init();

            NotificationManager.startAutoRefresh();

        }

    }

);
/* ==================================================
   Jadwal Sholat V5 Premium
   notifications.js - Bagian 4
================================================== */

/* =====================================
   Pemutar Audio Adzan
===================================== */

NotificationManager.audio = null;

NotificationManager.playAdzan = function(prayerName) {

    try {

        if (this.audio) {

            this.audio.pause();
            this.audio.currentTime = 0;

        }

        let file = "audio/adzan.mp3";

        if (prayerName === "Subuh") {

            file = "audio/subuh.mp3";

        }

        this.audio = new Audio(file);

        this.audio.volume = 1.0;

        this.audio.play();

        console.log("Memutar adzan:", prayerName);

    } catch (e) {

        console.error(e);

    }

};

/* =====================================
   Getar
===================================== */

NotificationManager.vibrate = function() {

    if (navigator.vibrate) {

        navigator.vibrate([500,300,500,300,500]);

    }

};

/* =====================================
   Jalankan Saat Notifikasi Dibuka
===================================== */

if (window.Capacitor) {

    const {
        LocalNotifications
    } = Capacitor.Plugins;

    LocalNotifications.addListener(

        "localNotificationReceived",

        notification => {

            let prayer = "";

            if (notification.title.includes("Subuh"))
                prayer = "Subuh";
            else
                prayer = "Normal";

            NotificationManager.playAdzan(prayer);

            NotificationManager.vibrate();

        }

    );

}
/* ==================================================
   Jadwal Sholat V5 Premium
   notifications.js - Bagian 5
================================================== */

/* =====================================
   Pengaturan Suara & Getar
===================================== */

NotificationManager.settings = {

    sound: localStorage.getItem("notif_sound") !== "false",

    vibration: localStorage.getItem("notif_vibration") !== "false"

};

NotificationManager.setSound = function(enable){

    this.settings.sound = enable;

    localStorage.setItem("notif_sound", enable);

};

NotificationManager.setVibration = function(enable){

    this.settings.vibration = enable;

    localStorage.setItem("notif_vibration", enable);

};

/* =====================================
   Jalankan Alarm
===================================== */

NotificationManager.trigger = function(prayerName){

    if(this.settings.sound){

        this.playAdzan(prayerName);

    }

    if(this.settings.vibration){

        this.vibrate();

    }

};

/* =====================================
   Penjadwalan Ulang Harian
===================================== */

NotificationManager.scheduleNextDay = function(){

    const now = new Date();

    const next = new Date();

    next.setDate(now.getDate()+1);

    next.setHours(0);
    next.setMinutes(1);
    next.setSeconds(0);

    const delay = next.getTime() - now.getTime();

    setTimeout(async()=>{

        try{

            console.log("Memperbarui jadwal sholat harian...");

            if(typeof loadTodayPrayer==="function"){

                await loadTodayPrayer();

            }

            if(App.timings){

                await NotificationManager
                    .schedulePrayerNotifications(
                        App.timings
                    );

            }

        }catch(e){

            console.error(e);

        }

        NotificationManager.scheduleNextDay();

    },delay);

};

/* =====================================
   Mulai Service
===================================== */

document.addEventListener("DOMContentLoaded",async()=>{

    if(window.NotificationManager){

        await NotificationManager.init();

        NotificationManager.scheduleNextDay();

    }

});

console.log("Notification Manager V5 Premium aktif.");
