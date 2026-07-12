const PrayerPlugin = {

    async savePrayer(data) {

        if (!window.Capacitor) {
            throw new Error("Capacitor tidak tersedia.");
        }

        return await Capacitor.Plugins.PrayerPlugin.savePrayer(data);

    }

};

window.PrayerPlugin = PrayerPlugin;
