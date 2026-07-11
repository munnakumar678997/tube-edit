package com.myapp.tubeedit.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.myapp.tubeedit.webview.YTProWebView;

public class MediaCommandReceiver extends BroadcastReceiver {
    private final YTProWebView web;

    public MediaCommandReceiver(YTProWebView web) {
        this.web = web;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getExtras() == null) return;
        
        String action = intent.getExtras().getString("actionname");
        if (action == null) return;
        Log.e("Action MainActivity", action);

        switch (action) {
            case "PLAY_ACTION":
                web.evaluateJavascript("playVideo();", null);
                break;
            case "PAUSE_ACTION":
                web.evaluateJavascript("pauseVideo();", null);
                break;
            case "NEXT_ACTION":
                web.evaluateJavascript("playNext();", null);
                break;
            case "PREV_ACTION":
                web.evaluateJavascript("playPrev();", null);
                break;
            case "SEEKTO":
                String pos = intent.getExtras().getString("pos", "0");
                // Only allow digits/decimal point — this value gets interpolated into a
                // JS string, so anything else could be a JS-injection attempt.
                if (pos == null || !pos.matches("[0-9.]+")) return;
                web.evaluateJavascript("seekTo('" + pos + "');", null);
                break;
        }
    }
}