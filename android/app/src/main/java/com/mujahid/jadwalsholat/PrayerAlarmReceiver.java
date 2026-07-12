package com.mujahid.jadwalsholat;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class PrayerAlarmReceiver extends BroadcastReceiver {

    private static final String CHANNEL_ID = "prayer_channel";

    @Override
    public void onReceive(Context context, Intent intent) {

        createNotificationChannel(context);

        String prayer = intent.getStringExtra("prayer");

if (prayer == null) {
    prayer = "Sholat";
}

NotificationCompat.Builder builder =
        new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("🕌 Waktu " + prayer)
                .setContentText("Saatnya melaksanakan sholat " + prayer + ".")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

        NotificationManagerCompat.from(context)
                .notify(1001, builder.build());
    }

    private void createNotificationChannel(Context context) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationChannel channel =
                    new NotificationChannel(
                            CHANNEL_ID,
                            "Jadwal Sholat",
                            NotificationManager.IMPORTANCE_HIGH
                    );

            channel.setDescription("Notifikasi waktu sholat");

            NotificationManager manager =
                    context.getSystemService(NotificationManager.class);

            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}
