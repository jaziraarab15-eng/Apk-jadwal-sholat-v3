package com.mujahid.jadwalsholat;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {

    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {

        if (intent == null) {
            return;
        }

        String action = intent.getAction();

        Log.d(TAG, "Broadcast diterima: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {

            Log.d(TAG, "Boot selesai, menjadwalkan ulang alarm.");

            AlarmScheduler.scheduleAll(context);
String[] prayers = {
        "Subuh",
        "Zuhur",
        "Ashar",
        "Maghrib",
        "Isya"
};

for (String prayer : prayers) {

    long time =
            PrayerStorage.getPrayer(
                    context,
                    prayer
            );

    if (time > System.currentTimeMillis()) {

        AlarmScheduler.schedulePrayer(
                context,
                prayer.hashCode(),
                time,
                prayer
        );

    }

}

        }

    }
}
