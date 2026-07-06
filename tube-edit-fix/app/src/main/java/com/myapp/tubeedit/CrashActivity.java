package com.myapp.tubeedit;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.ScrollView;
import android.widget.TextView;

public class CrashActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String trace = getIntent().getStringExtra("trace");
        if (trace == null) trace = "Unknown crash (no stack trace captured)";

        TextView tv = new TextView(this);
        tv.setText("Tube Edit crashed. Please screenshot this and send it back:\n\n" + trace);
        tv.setTextColor(Color.WHITE);
        tv.setTextIsSelectable(true);
        tv.setPadding(24, 48, 24, 48);
        tv.setTextSize(12);

        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.BLACK);
        scroll.addView(tv);

        setContentView(scroll);
    }
}
