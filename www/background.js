/* ==================================================
   Jadwal Sholat V5 Premium
   background.js - Bagian 1
================================================== */

const BackgroundService = {

    started: false,

    async start() {

        if (this.started) return;

        this.started = true;

        console.log("Background Service aktif.");

        this.loop();

    },

    loop() {

        setInterval(async () => {

            try {

                if (!App || !App.timings) return;

                const now = new Date();

                const hm =
                    String(now.getHours()).padStart(2,"0") +
                    ":" +
                    String(now.getMinutes()).padStart(2,"0");

                const prayers = [

                    ["Subuh", App.timings.Fajr],
                    ["Zuhur", App.timings.Dhuhr],
                    ["Ashar", App.timings.Asr],
                    ["Maghrib", App.timings.Maghrib],
                    ["Isya", App.timings.Isha]

                ];

                prayers.forEach(prayer => {

                    const time =
                        prayer[1].substring(0,5);

                    if (hm === time) {

                        if (window.NotificationManager) {

                            NotificationManager.trigger(
                                prayer[0]
                            );

                        }

                    }

                });

            } catch(e) {

                console.error(e);

            }

        },60000);

    }

};

/* =====================================
   Jalankan Service
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        BackgroundService.start();

    }

);
