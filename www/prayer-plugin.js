const { registerPlugin } = Capacitor;

const PrayerPlugin = registerPlugin("PrayerPlugin");

window.PrayerPlugin = {
    async savePrayer(data) {
        return await PrayerPlugin.savePrayer(data);
    }
};
