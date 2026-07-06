package com.myapp.tubeedit.webview;

import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.net.Uri;
import android.provider.Settings;
import android.util.Rational;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebStorage;
import android.widget.Toast;
import java.io.File;
import android.Manifest;

import android.os.Build;
import android.os.Environment;
import androidx.webkit.ProxyConfig;
import androidx.webkit.ProxyController;
import androidx.webkit.WebViewFeature;

import com.myapp.tubeedit.ForegroundService;
import com.myapp.tubeedit.GeminiWrapper;
import com.myapp.tubeedit.MainActivity;
import com.myapp.tubeedit.R;
import com.myapp.tubeedit.utils.DownloadUtils;
import com.myapp.tubeedit.utils.MediaMuxerUtils;
import com.myapp.tubeedit.utils.SecurePrefs;

import org.json.JSONObject;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class WebAppInterface {
	private final MainActivity activity;
	private final YTProWebView web;
	private final AudioManager audioManager;

	// FIX #5: Single-thread executor for Gemini calls prevents concurrent
	// calls from overwriting each other's global callback references.
	private final ExecutorService geminiExecutor = Executors.newSingleThreadExecutor();
	
	private String icon = "";
	private String title = "";
	private String subtitle = "";
	private long duration;
	
	public WebAppInterface(MainActivity activity, YTProWebView web) {
		this.activity = activity;
		this.web = web;
		this.audioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
	}

	/**
	 * FIX #4 helper: Escapes characters that would break a JS template literal.
	 * Prevents XSS / template-injection when inserting arbitrary server responses
	 * into evaluateJavascript(`...`).
	 */
	private static String escapeForJsTemplateLiteral(String s) {
		if (s == null) return "";
		return s.replace("\\", "\\\\")   // backslash first
		        .replace("`", "\\`")      // backtick
		        .replace("${", "\\${");   // template expression opener
	}
	
	@JavascriptInterface
	public void showToast(String txt) {
		Toast.makeText(activity.getApplicationContext(), txt, Toast.LENGTH_SHORT).show();
	}
	
	@JavascriptInterface
	public void gohome(String x) {
		Intent startMain = new Intent(Intent.ACTION_MAIN);
		startMain.addCategory(Intent.CATEGORY_HOME);
		startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		activity.startActivity(startMain);
	}
	
	@JavascriptInterface
	public void downvid(String name, String url, String m) {
		DownloadUtils.downloadFile(activity, name, url, m);
	}
	
	@JavascriptInterface
	public void fullScreen(boolean value) {
		activity.portrait = value;
	}
	
	@JavascriptInterface
	public void oplink(String url) {
		Intent i = new Intent(Intent.ACTION_VIEW);
		i.setData(Uri.parse(url));
		activity.startActivity(i);
	}
	
	@JavascriptInterface
	public String getInfo() {
		try {
			PackageInfo info = activity.getPackageManager().getPackageInfo(activity.getPackageName(), PackageManager.GET_ACTIVITIES);
			return info.versionName;
		} catch (Exception e) {
			return "1.0";
		}
	}

	@JavascriptInterface
	public boolean isWebViewSupported() {
		return WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_ARRAY_BUFFER);
	}
	
	// FIX #2: hasStoragePermission() was returning INVERTED result.
	// Original: return (checkSelfPermission(...) == PERMISSION_DENIED || ...)
	// PERMISSION_DENIED = -1, so the expression was true when DENIED → JS got
	// told it HAS permission when it didn't and vice versa. Downloads broke silently.
	// Fixed: return true only when both permissions are GRANTED.
	//
	// Permission scope (aligned with manifest maxSdkVersion="28"):
	//   API 21-22:  runtime permission model not enforced — always granted
	//   API 23-28:  WRITE/READ runtime permissions required and checked here
	//   API 29   :  MediaStore used for downloads; NO runtime WRITE/READ needed
	//   API 30+  :  MediaStore only; WRITE_EXTERNAL_STORAGE removed entirely
	@JavascriptInterface
	public boolean hasStoragePermission() {
		// API 29+ (Android 10+): downloads go through MediaStore and do not
		// require WRITE_EXTERNAL_STORAGE / READ_EXTERNAL_STORAGE runtime permissions.
		// Checking for them on API 29 always fails (maxSdkVersion="28") and would
		// incorrectly block downloads.
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
			return true;
		}
		// API 23-28: check and request runtime permissions
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
			boolean writeDenied = activity.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
			        == PackageManager.PERMISSION_DENIED;
			boolean readDenied  = activity.checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE)
			        == PackageManager.PERMISSION_DENIED;
			if (writeDenied || readDenied) {
				activity.runOnUiThread(() ->
				        Toast.makeText(activity, R.string.grant_storage, Toast.LENGTH_SHORT).show());
				activity.requestPermissions(new String[]{
				        Manifest.permission.WRITE_EXTERNAL_STORAGE,
				        Manifest.permission.READ_EXTERNAL_STORAGE
				}, 1);
				return false;
			}
		}
		return true; // API ≤ 22 or permissions granted
	}
	
	@JavascriptInterface
	public void requestBinaryPort(String fileName) {
		activity.runOnUiThread(() -> {
			if (activity.streamManager != null) {
				activity.streamManager.openStreamForFile(fileName);
			}
		});
	}
	
	@JavascriptInterface
	public void muxVideoAudio(String videoFileName,String audioFileName,String outputFileName) {
		// SECURITY: strip any directory components from JS-supplied filenames.
		videoFileName = new java.io.File(videoFileName).getName();
		audioFileName = new java.io.File(audioFileName).getName();
		outputFileName = new java.io.File(outputFileName).getName();

		java.io.File downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS.concat("/YTPRO"));
		java.io.File video  = new java.io.File(downloads, videoFileName);
		java.io.File audio  = new java.io.File(downloads, audioFileName);
		
		java.io.File output = new java.io.File(downloads, outputFileName);
		
		MediaMuxerUtils.muxVideoAudio(activity.getApplicationContext(), video, audio, output, new MediaMuxerUtils.MuxCallback() {
			@Override
			public void onSuccess(File output) {
				Toast.makeText(activity, "Done: " + output.getName(), Toast.LENGTH_SHORT).show();
			}
			
			@Override
			public void onFailure(Exception e) {
				Toast.makeText(activity, "Failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
			}
		});
	}
	
	@JavascriptInterface
	public void setBgPlay(boolean bgplay) {
		activity.getSharedPreferences("YTPRO", Context.MODE_PRIVATE).edit().putBoolean("bgplay", bgplay).apply();
	}

	@JavascriptInterface
	public void setAutoPip(boolean enabled) {
		activity.getSharedPreferences("YTPRO", Context.MODE_PRIVATE).edit().putBoolean("autoPip", enabled).apply();
	}
	
	@JavascriptInterface
	public void bgStart(String iconn, String titlen, String subtitlen, long dura) {
		icon = iconn; title = titlen; subtitle = subtitlen; duration = dura;
		activity.isPlaying = true; activity.mediaSession = true;
		
		Intent intent = new Intent(activity.getApplicationContext(), ForegroundService.class);
		intent.putExtra("icon", icon); intent.putExtra("title", title);
		intent.putExtra("subtitle", subtitle); intent.putExtra("duration", duration);
		intent.putExtra("currentPosition", 0); intent.putExtra("action", "play");
		activity.startService(intent);
	}
	
	@JavascriptInterface
	public void bgUpdate(String iconn, String titlen, String subtitlen, long dura) {
		icon = iconn; title = titlen; subtitle = subtitlen; duration = dura;
		activity.isPlaying = true;
		sendUpdateBroadcast(0, "pause");
	}
	
	@JavascriptInterface
	public void bgStop() {
		activity.isPlaying = false; activity.mediaSession = false;
		activity.stopService(new Intent(activity.getApplicationContext(), ForegroundService.class));
	}
	
	@JavascriptInterface
	public void bgPause(long ct) {
		activity.isPlaying = false;
		sendUpdateBroadcast(ct, "pause");
	}
	
	@JavascriptInterface
	public void bgPlay(long ct) {
		activity.isPlaying = true;
		sendUpdateBroadcast(ct, "play");
	}
	
	@JavascriptInterface
	public void bgBuffer(long ct) {
		activity.isPlaying = true;
		sendUpdateBroadcast(ct, "buffer");
	}
	
	private void sendUpdateBroadcast(long ct, String action) {
		activity.sendBroadcast(new Intent("UPDATE_NOTIFICATION")
		.putExtra("icon", icon).putExtra("title", title)
		.putExtra("subtitle", subtitle).putExtra("duration", duration)
		.putExtra("currentPosition", ct).putExtra("action", action));
	}

	// FIX #4 + FIX #5: getSNlM0e now uses the dedicated geminiExecutor (single-thread)
	// so concurrent calls queue up instead of racing. The response is escaped via
	// escapeForJsTemplateLiteral() to prevent template-literal injection / XSS.
	@JavascriptInterface
	public void getSNlM0e(String cookies) {
		geminiExecutor.submit(() -> {
			String response = GeminiWrapper.getSNlM0e(cookies);
			// FIX #4: escape response so backticks/$ in it don't break the JS template literal
			String safe = escapeForJsTemplateLiteral(response);
			activity.runOnUiThread(() ->
			        web.evaluateJavascript("callbackSNlM0e.resolve(`" + safe + "`)", null));
		});
	}

	// FIX #4 + FIX #5: same executor + safer JSON insertion for GeminiClient.
	// GeminiClient passes a JSON object (not a template literal), so we validate
	// the JSONObject before passing it — if null, we resolve with null.
	@JavascriptInterface
	public void GeminiClient(String url, String headers, String body) {
		geminiExecutor.submit(() -> {
			JSONObject response = GeminiWrapper.getStream(url, headers, body);
			// FIX #4: safe JSON string — JSONObject.toString() is already valid JSON;
			// no template literal is used here so injection risk is minimal,
			// but we still guard against null to prevent "callbackGeminiClient.resolve(null)"
			// from breaking if the JS side doesn't expect it.
			String jsonStr = (response != null) ? response.toString() : "null";
			activity.runOnUiThread(() ->
			        web.evaluateJavascript("callbackGeminiClient.resolve(" + jsonStr + ")", null));
		});
	}

	// FIX #30: getAllCookies — added null/empty URL guard and null-safe return.
	// CookieManager.getCookie() is safe to call from any thread (Binder or main),
	// but it can return null for unknown URLs — guard added to prevent NPE on JS side.
	@JavascriptInterface
	public String getAllCookies(String url) {
		if (url == null || url.isEmpty()) return "";
		String cookies = CookieManager.getInstance().getCookie(url);
		return (cookies != null) ? cookies : "";
	}
	
	@JavascriptInterface
	public float getVolume() {
		int currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
		int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
		return (float) currentVolume / maxVolume;
	}
	
	@JavascriptInterface
	public void setVolume(float volume) {
		int max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
		audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, (int) (max * volume), 0);
	}
	
	@JavascriptInterface
	public float getBrightness() {
		try {
			return (Settings.System.getInt(activity.getContentResolver(), Settings.System.SCREEN_BRIGHTNESS) / 255f) * 100f;
		} catch (Settings.SettingNotFoundException e) {
			return 50f;
		}
	}
	
	@JavascriptInterface
	public void setBrightness(final float brightnessValue) {
		activity.runOnUiThread(() -> {
			float brightness = Math.max(0f, Math.min(brightnessValue, 1f));
			WindowManager.LayoutParams layout = activity.getWindow().getAttributes();
			layout.screenBrightness = brightness;
			activity.getWindow().setAttributes(layout);
		});
	}
	
	@JavascriptInterface
	public void pipvid(String mode) {
		if (android.os.Build.VERSION.SDK_INT >= 26) {
			try {
				PictureInPictureParams params = new PictureInPictureParams.Builder()
				.setAspectRatio(new Rational(mode.equals("portrait") ? 9 : 16, mode.equals("portrait") ? 16 : 9))
				.build();
				activity.enterPictureInPictureMode(params);
			} catch (Exception e) { e.printStackTrace(); }
		} else {
			Toast.makeText(activity, activity.getString(R.string.no_pip), Toast.LENGTH_SHORT).show();
		}
	}

	// ---- Privacy: clear cookies, cache, form/history data ----
	@JavascriptInterface
	public void clearBrowsingData() {
		activity.runOnUiThread(() -> {
			CookieManager cookieManager = CookieManager.getInstance();
			cookieManager.removeAllCookies(null);
			cookieManager.flush();
			web.clearCache(true);
			web.clearHistory();
			web.clearFormData();
			WebStorage.getInstance().deleteAllData();
			Toast.makeText(activity, "Cookies, cache & history cleared", Toast.LENGTH_SHORT).show();
		});
	}

	@JavascriptInterface
	public void setProxy(String host, String port, boolean enable) {
		if (!WebViewFeature.isFeatureSupported(WebViewFeature.PROXY_OVERRIDE)) {
			activity.runOnUiThread(() -> Toast.makeText(activity, "Proxy override not supported on this WebView version", Toast.LENGTH_SHORT).show());
			return;
		}
		Executor executor = Runnable::run;
		if (!enable || host == null || host.trim().isEmpty()) {
			ProxyController.getInstance().clearProxyOverride(executor, () -> {
				SecurePrefs.remove(activity, "proxy_host");
				SecurePrefs.remove(activity, "proxy_port");
				activity.runOnUiThread(() -> Toast.makeText(activity, "Proxy disabled", Toast.LENGTH_SHORT).show());
			});
			return;
		}
		String rule = host.trim() + ":" + port.trim();
		ProxyConfig proxyConfig = new ProxyConfig.Builder()
				.addProxyRule(rule)
				.build();
		ProxyController.getInstance().setProxyOverride(proxyConfig, executor, () -> {
			SecurePrefs.putString(activity, "proxy_host", host.trim());
			SecurePrefs.putString(activity, "proxy_port", port.trim());
			activity.runOnUiThread(() -> Toast.makeText(activity, "Proxy enabled: " + rule, Toast.LENGTH_SHORT).show());
		});
	}

	@JavascriptInterface
	public String getSavedProxy() {
		String host = SecurePrefs.getString(activity, "proxy_host", "");
		String port = SecurePrefs.getString(activity, "proxy_port", "");
		if (host.isEmpty()) return "";
		return host + ":" + port;
	}

	@JavascriptInterface
	public void setSecure(String key, String value) {
		SecurePrefs.putString(activity, key, value);
	}

	@JavascriptInterface
	public String getSecure(String key) {
		return SecurePrefs.getString(activity, key, "");
	}

	@JavascriptInterface
	public void openDownloadedFile(String filename) {
		activity.runOnUiThread(() -> {
			try {
				String safeName = new java.io.File(filename).getName();

				java.io.File root = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
				java.io.File ytproSub = new java.io.File(root, "YTPRO");

				java.io.File target = new java.io.File(ytproSub, safeName);
				if (!target.exists()) {
					target = new java.io.File(root, safeName);
				}
				if (!target.exists()) {
					Toast.makeText(activity, "File not found: " + safeName, Toast.LENGTH_SHORT).show();
					return;
				}

				Uri uri = androidx.core.content.FileProvider.getUriForFile(
						activity, "com.myapp.tubeedit.fileprovider", target);

				String mime = guessMimeType(filename);

				Intent intent = new Intent(Intent.ACTION_VIEW);
				intent.setDataAndType(uri, mime);
				intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
				intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

				activity.startActivity(Intent.createChooser(intent, "Open with"));
			} catch (Exception e) {
				Toast.makeText(activity, "Could not open file: " + e.getMessage(), Toast.LENGTH_SHORT).show();
			}
		});
	}

	private String guessMimeType(String filename) {
		String lower = filename.toLowerCase();
		if (lower.endsWith(".mp4")) return "video/mp4";
		if (lower.endsWith(".webm")) return "video/webm";
		if (lower.endsWith(".m4a")) return "audio/mp4";
		if (lower.endsWith(".weba")) return "audio/webm";
		if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
		if (lower.endsWith(".png")) return "image/png";
		return "*/*";
	}

	@JavascriptInterface
	public void extractAudioOnly(String audioFileName, String outputFileName) {
		audioFileName = new java.io.File(audioFileName).getName();
		outputFileName = new java.io.File(outputFileName).getName();

		java.io.File downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS.concat("/YTPRO"));
		java.io.File audio = new java.io.File(downloads, audioFileName);
		java.io.File output = new java.io.File(downloads, outputFileName);

		MediaMuxerUtils.extractAudioOnly(activity.getApplicationContext(), audio, output, new MediaMuxerUtils.MuxCallback() {
			@Override
			public void onSuccess(File output) {
				Toast.makeText(activity, "Audio saved: " + output.getName(), Toast.LENGTH_SHORT).show();
			}

			@Override
			public void onFailure(Exception e) {
				Toast.makeText(activity, "Audio extraction failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
			}
		});
	}
}
