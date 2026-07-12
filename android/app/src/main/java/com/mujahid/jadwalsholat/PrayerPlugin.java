package com.mujahid.jadwalsholat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "PrayerPlugin")
public class PrayerPlugin extends Plugin {

    @PluginMethod
    public void savePrayer(PluginCall call) {

        String prayer = call.getString("prayer");
        Long triggerTime = call.getLong("triggerTime");

        if (prayer == null || triggerTime == null) {
            call.reject("Parameter prayer atau triggerTime tidak lengkap.");
            return;
        }

        try {

            PrayerStorage.savePrayer(
                    getContext(),
                    prayer,
                    triggerTime
            );

            AlarmScheduler.schedulePrayer(
                    getContext(),
                    prayer.hashCode(),
                    triggerTime,
                    prayer
            );

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("prayer", prayer);
            ret.put("triggerTime", triggerTime);

            call.resolve(ret);

        } catch (Exception e) {

            call.reject(e.getMessage());

        }

    }

}
