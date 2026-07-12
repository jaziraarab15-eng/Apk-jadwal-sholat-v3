/* ==================================================
   Jadwal Sholat V5 Premium
   runner.js
================================================== */

addEventListener("runner", async () => {

    console.log("Background Runner berjalan.");

    try {

        if (typeof loadTodayPrayer === "function") {

            await loadTodayPrayer();

        }

        if (
            typeof NotificationManager !== "undefined" &&
            App &&
            App.timings
        ) {

            await NotificationManager
                .schedulePrayerNotifications(
                    App.timings
                );

        }

    } catch (e) {

        console.error(e);

    }

});
