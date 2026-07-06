package com.myapp.tubeedit.utils;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import java.io.IOException;
import java.security.GeneralSecurityException;

/**
 * Wrapper around EncryptedSharedPreferences (AES-256) for any sensitive
 * values the app needs to persist locally (proxy config, future API keys, etc).
 * Falls back to regular SharedPreferences if the secure keystore is unavailable
 * (e.g. corrupted keystore on some OEM ROMs) so the app never crashes.
 */
public class SecurePrefs {

    private static final String FILE_NAME = "tube_edit_secure_prefs";
    private static SharedPreferences instance;

    public static synchronized SharedPreferences get(Context context) {
        if (instance != null) return instance;
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();

            instance = EncryptedSharedPreferences.create(
                    context,
                    FILE_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            // Fallback: plain prefs (still sandboxed to our app) so we never crash.
            instance = context.getSharedPreferences(FILE_NAME + "_fallback", Context.MODE_PRIVATE);
        }
        return instance;
    }

    public static void putString(Context context, String key, String value) {
        get(context).edit().putString(key, value).apply();
    }

    public static String getString(Context context, String key, String defaultValue) {
        return get(context).getString(key, defaultValue);
    }

    public static void remove(Context context, String key) {
        get(context).edit().remove(key).apply();
    }
}
