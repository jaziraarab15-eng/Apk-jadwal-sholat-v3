package com.mujahid.jadwalsholat;

import android.content.Context;
import android.content.SharedPreferences;

public class PrayerStorage {

    private static final String PREF = "prayer_schedule";

    public static void savePrayer(
            Context context,
            String prayer,
            long time
    ) {

        SharedPreferences pref =
                context.getSharedPreferences(
                        PREF,
                        Context.MODE_PRIVATE
                );

        pref.edit()
                .putLong(prayer, time)
                .apply();

    }

    public static long getPrayer(
            Context context,
            String prayer
    ) {

        SharedPreferences pref =
                context.getSharedPreferences(
                        PREF,
                        Context.MODE_PRIVATE
                );

        return pref.getLong(prayer, 0);

    }

}
