package com.mujahid.jadwalsholat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "PrayerPlugin")
public class PrayerPlugin extends Plugin {

    @PluginMethod
    public void savePrayer(PluginCall call) {

        String prayer =
                call.getString("prayer");

        Long trigger =
                call.getLong("triggerTime");

        if (prayer == null || trigger == null) {

            call.reject("Parameter tidak lengkap.");

            return;

        }

        PrayerStorage.savePrayer(
                getContext(),
                prayer,
                trigger
        );

        call.resolve();

    }

}
