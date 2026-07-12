(function () {

    if (window.PrayerPlugin) {
        return;
    }

    window.PrayerPlugin = {

        async savePrayer(data) {

            if (!window.Capacitor ||
                !window.Capacitor.Plugins ||
                !window.Capacitor.Plugins.PrayerPlugin) {

                console.warn("PrayerPlugin native belum tersedia.");
                return;
            }

            return await window.Capacitor.Plugins.PrayerPlugin.savePrayer(data);

        },

        async getPrayer(prayer) {

            if (!window.Capacitor ||
                !window.Capacitor.Plugins ||
                !window.Capacitor.Plugins.PrayerPlugin) {

                console.warn("PrayerPlugin native belum tersedia.");
                return null;
            }

            return await window.Capacitor.Plugins.PrayerPlugin.getPrayer({
                prayer: prayer
            });

        }

    };

})();
