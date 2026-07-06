package com.myapp.tubeedit.webview;

import android.Manifest;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.view.View;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;

import com.myapp.tubeedit.MainActivity;
import com.myapp.tubeedit.R;

public class YTProWebChromeClient extends WebChromeClient {
    private final MainActivity activity;
    private final YTProWebView web;
    
    private View mCustomView;
    private WebChromeClient.CustomViewCallback mCustomViewCallback;
    // FIX #26: mOriginalOrientation stores the orientation to RESTORE TO when exiting fullscreen.
    // Previously it was overwritten to PORTRAIT immediately after being set, so exit always went
    // back to portrait even if the app was in landscape before.
    private int mOriginalOrientation;
    private int mOriginalSystemUiVisibility;

    public YTProWebChromeClient(MainActivity activity, YTProWebView web) {
        this.activity = activity;
        this.web = web;
    }

    // FIX #27: getDefaultVideoPoster was using a hardcoded integer resource ID (2130837573).
    // If the resource table changes (e.g. adding/removing drawables, changing build tools),
    // that integer becomes wrong → wrong image or crash. Use the named R constant instead.
    @Override
    public Bitmap getDefaultVideoPoster() {
        try {
            return BitmapFactory.decodeResource(
                    activity.getApplicationContext().getResources(), R.mipmap.app_icon);
        } catch (Exception e) {
            return super.getDefaultVideoPoster();
        }
    }

    @Override
    public void onShowCustomView(View paramView, WebChromeClient.CustomViewCallback viewCallback) {
        // FIX #26 Step 1: Save the orientation we must RESTORE TO when the user exits fullscreen.
        // This is based on the current app/video state, not the fullscreen state.
        mOriginalOrientation = activity.portrait ?
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT :
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        if (activity.isPip) mOriginalOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            activity.getWindow().setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            WindowManager.LayoutParams params = activity.getWindow().getAttributes();
            params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            activity.getWindow().setAttributes(params);
        }

        if (mCustomView != null) {
            onHideCustomView();
            return;
        }

        mCustomView = paramView;
        mOriginalSystemUiVisibility = activity.getWindow().getDecorView().getSystemUiVisibility();

        // FIX #26 Step 2: Determine fullscreen orientation (landscape for videos, portrait for Shorts)
        // and apply it WITHOUT overwriting mOriginalOrientation.
        int fullscreenOrientation = activity.portrait ?
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT :
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        activity.setRequestedOrientation(fullscreenOrientation);
        // FIX #26: The original code had this line here which overwrote mOriginalOrientation:
        //   mOriginalOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT;
        // That caused exit-fullscreen to ALWAYS go back to portrait. Line removed.

        mCustomViewCallback = viewCallback;
        ((FrameLayout) activity.getWindow().getDecorView()).addView(mCustomView,
                new FrameLayout.LayoutParams(-1, -1));
        activity.getWindow().getDecorView().setSystemUiVisibility(3846);
    }

    @Override
    public void onHideCustomView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            WindowManager.LayoutParams params = activity.getWindow().getAttributes();
            params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT;
            activity.getWindow().setAttributes(params);
        }

        ((FrameLayout) activity.getWindow().getDecorView()).removeView(mCustomView);
        mCustomView = null;
        activity.getWindow().getDecorView().setSystemUiVisibility(mOriginalSystemUiVisibility);

        // FIX #26 Step 3: Restore to the CORRECT saved orientation (portrait or landscape),
        // not always portrait as was the bug.
        activity.setRequestedOrientation(mOriginalOrientation);

        // Reset mOriginalOrientation for the next fullscreen entry.
        mOriginalOrientation = activity.portrait ?
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT :
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;

        mCustomViewCallback = null;
        web.clearFocus();
    }

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        if (Build.VERSION.SDK_INT > 22 && request.getOrigin().toString().contains("youtube.com")) {
            if (activity.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_DENIED) {
                activity.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 101);
            } else {
                request.grant(request.getResources());
            }
        }
    }
}
