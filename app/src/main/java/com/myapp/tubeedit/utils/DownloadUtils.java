package com.myapp.tubeedit.utils;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.widget.Toast;

import com.myapp.tubeedit.R;

public class DownloadUtils {

    public static void downloadFile(Activity activity, String filename, String url, String mtype) {
        if (Build.VERSION.SDK_INT > 22 && Build.VERSION.SDK_INT < Build.VERSION_CODES.R &&
            activity.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED) {
            
            activity.runOnUiThread(() -> Toast.makeText(activity, R.string.grant_storage, Toast.LENGTH_SHORT).show());
            activity.requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    Manifest.permission.READ_EXTERNAL_STORAGE}, 1);
            return;
        }
        
        try {
            // FIX #24: Previously URLEncoder.encode() was used, which produces %20-encoded names.
            // setDestinationInExternalPublicDir() expects a plain filesystem path, not a URL-encoded
            // string — so files were being saved with literal "%20" in their names.
            // Fix: sanitize only the characters that are actually forbidden on Android/FAT32 filesystems.
            String safeFileName = sanitizeFilename(filename);

            DownloadManager downloadManager = (DownloadManager) activity.getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            
            request.setTitle(filename)           // display title keeps the original (readable) name
                   .setDescription(filename)
                   .setMimeType(mtype)
                   .setAllowedOverMetered(true)
                   .setAllowedOverRoaming(true)
                   .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, safeFileName)
                   .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                   
            downloadManager.enqueue(request);
            Toast.makeText(activity, activity.getString(R.string.dl_started), Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            // FIX #21 (implicit): show the actual error so the user knows the download failed,
            // rather than silently swallowing it.
            Toast.makeText(activity, "Download failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * FIX #24 helper: Removes characters forbidden on Android/FAT32 filesystems.
     * Also strips leading/trailing dots and spaces that confuse file managers.
     * Characters forbidden: \ / : * ? " < > |
     */
    private static String sanitizeFilename(String name) {
        if (name == null || name.isEmpty()) return "download";
        // Replace all filesystem-forbidden characters with underscores
        String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
        // Replace control characters
        safe = safe.replaceAll("[\\x00-\\x1F\\x7F]", "_");
        // Strip leading/trailing spaces and dots (invisible/confusing on some FSes)
        safe = safe.replaceAll("^[. ]+|[. ]+$", "").trim();
        if (safe.isEmpty()) safe = "download";
        // Truncate to 200 chars to stay safely under filesystem limits
        if (safe.length() > 200) safe = safe.substring(0, 200);
        return safe;
    }
}
