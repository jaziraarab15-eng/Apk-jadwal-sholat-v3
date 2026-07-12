package com.mujahid.jadwalsholat;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AlarmScheduler {

    public static void scheduleAll(Context context) {

        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        if (alarmManager == null) return;

        Intent intent = new Intent(context, PrayerAlarmReceiver.class);

        PendingIntent pendingIntent =
                PendingIntent.getBroadcast(
                        context,
                        1000,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT |
                        PendingIntent.FLAG_IMMUTABLE
                );

        long triggerTime = System.currentTimeMillis() + 60 * 1000;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {

            alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
            );

        } else {

            alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
            );

        }

    }

}
public static void schedulePrayer(
        Context context,
        int requestCode,
        long triggerTime,
        String prayerName
) {

    AlarmManager alarmManager =
            (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

    if (alarmManager == null) return;

    Intent intent =
            new Intent(context, PrayerAlarmReceiver.class);

    intent.putExtra("prayer", prayerName);

    PendingIntent pendingIntent =
            PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT |
                    PendingIntent.FLAG_IMMUTABLE
            );

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {

        alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
        );

    } else {

        alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
        );

    }

}
public static void saveSchedule(
        Context context,
        String prayer,
        long triggerTime
) {

    PrayerStorage.savePrayer(
            context,
            prayer,
            triggerTime
    );

}
