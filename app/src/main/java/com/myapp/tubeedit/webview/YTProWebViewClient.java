package com.myapp.tubeedit.webview;

import android.content.Intent;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.myapp.tubeedit.ForegroundService;
import com.myapp.tubeedit.MainActivity;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;
import android.util.Log;

public class YTProWebViewClient extends WebViewClient {
	
	private final MainActivity activity;
	private final YTProWebView web;
	
	public YTProWebViewClient(MainActivity activity, YTProWebView web) {
		this.activity = activity;
		this.web = web;
	}
	
	// SECURITY: the "Android" JavaScript bridge (addJavascriptInterface) is exposed to
	// every page this WebView loads, with no per-origin restriction (a known Android
	// WebView limitation). Without this check, any external site the user navigates to
	// (a link in a video description, a comment, an ad, a redirect) could call powerful
	// native methods like setProxy(), openDownloadedFile(), muxVideoAudio(), etc.
	// This allowlist keeps untrusted origins from ever loading inside this WebView.
	private static final String[] ALLOWED_HOSTS = {
		"youtube.com", "youtu.be", "ytimg.com", "googlevideo.com",
		"google.com", "gstatic.com", "googleapis.com", "googleusercontent.com",
		"ggpht.com", "gvt1.com", "gvt2.com", "gvt3.com"
	};

	private boolean isAllowedHost(String host) {
		if (host == null) return false;
		host = host.toLowerCase();
		for (String allowed : ALLOWED_HOSTS) {
			if (host.equals(allowed) || host.endsWith("." + allowed)) return true;
		}
		return false;
	}

	@Override
	public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
		String host = request.getUrl().getHost();

		if (isAllowedHost(host)) {
			return false; // trusted domain, let the WebView load it (and keep the JS bridge)
		}

		if (request.isForMainFrame()) {
			// Untrusted destination for a full page navigation: open in the user's
			// normal browser instead, where our native JS bridge does not exist.
			try {
				Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
				intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				activity.startActivity(intent);
			} catch (Exception ignored) {}
		}
		// Untrusted subframe (e.g. an ad iframe): just block it, don't open a browser for it.
		return true;
	}

	@Override
	public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
		String url = request.getUrl().toString();

		if (url.contains("accounts.google.com") ||
		    url.contains("myaccount.google.com") ||
		    url.contains("accounts.youtube.com") ||
		    url.contains("google.com/signin") ||
		    url.contains("google.com/oauth") ||
		    url.contains("googleapis.com/oauth") ||
		    url.contains("/signin") ||
		    url.contains("SetSID")) {
			return super.shouldInterceptRequest(view, request);
		}

		// FIX #31: Only intercept GET (and HEAD) requests for the main frame.
		// Previously POST requests were also intercepted but the request body was never
		// forwarded (WebResourceRequest does not expose the body — Android limitation).
		// This caused YouTube POST requests to fail silently. Now only GET main-frame
		// requests are intercepted; all other methods pass through normally.
		if (request.isForMainFrame()
		        && "GET".equalsIgnoreCase(request.getMethod())
		        && (url.contains("m.youtube.com") || url.contains("www.youtube.com"))) {
			try {
				URL newUrl = new URL(url);
				HttpsURLConnection connection = (HttpsURLConnection) newUrl.openConnection();
				connection.setRequestMethod("GET"); // always GET per fix #31

				for (Map.Entry<String, String> header : request.getRequestHeaders().entrySet()) {
					if (!header.getKey().equalsIgnoreCase("Accept-Encoding")) {
						connection.setRequestProperty(header.getKey(), header.getValue());
					}
				}

				String cookies = android.webkit.CookieManager.getInstance().getCookie(url);
				if (cookies != null) connection.setRequestProperty("Cookie", cookies);

				connection.setConnectTimeout(15000);
				connection.setReadTimeout(15000);
				connection.connect();

				int responseCode = connection.getResponseCode();

				Map<String, String> safeHeaders = new HashMap<>();
				for (Map.Entry<String, List<String>> entry : connection.getHeaderFields().entrySet()) {
					if (entry.getKey() != null) {
						String headerName = entry.getKey().toLowerCase();
						// Strip CSP headers so our injected scripts are not blocked
						if (!headerName.equals("content-security-policy") &&
						    !headerName.equals("content-security-policy-report-only")) {
							safeHeaders.put(entry.getKey(), String.join(", ", entry.getValue()));
						}
					}
				}

				// Read the response body
				InputStream rawStream;
				try {
					rawStream = connection.getInputStream();
				} catch (Exception e) {
					// For 4xx/5xx, getInputStream() throws; use getErrorStream() instead
					rawStream = connection.getErrorStream();
				}

				if (rawStream == null) {
					return super.shouldInterceptRequest(view, request);
				}

				BufferedReader reader = new BufferedReader(new InputStreamReader(rawStream));
				StringBuilder html = new StringBuilder();
				String line;
				while ((line = reader.readLine()) != null) {
					if (line.toLowerCase().contains("content-security-policy")) {
						line = line.replaceAll("<meta[^>]*http-equiv=[\"']?Content-Security-Policy[\"']?[^>]*>", "");
					}
					html.append(line).append("\n");
				}

				InputStream modifiedHtmlStream = new ByteArrayInputStream(html.toString().getBytes("UTF-8"));

				// FIX #31 (secondary): pass the real HTTP status code; do NOT hardcode "OK"
				// for error responses. The status text "OK" was always wrong for 4xx/5xx.
				String reasonPhrase = getReasonPhrase(responseCode);
				return new WebResourceResponse("text/html", "utf-8", responseCode, reasonPhrase, safeHeaders, modifiedHtmlStream);

			} catch (Exception e) {
				Log.e("YTPRO_WVC", "Main frame intercept failed: " + e.getMessage());
				return super.shouldInterceptRequest(view, request);
			}
		}


		if (url.startsWith("https://www.google.com/js/") ||
		    url.startsWith("https://www.google.com/recaptcha/") ||
		    url.startsWith("https://www.google.com/js/th/")) {

			try {
				HttpsURLConnection conn = (HttpsURLConnection) new URL(url).openConnection();
				conn.setRequestProperty("User-Agent", request.getRequestHeaders().get("User-Agent"));
				conn.setRequestProperty("Referer", "https://www.youtube.com/");
				conn.setInstanceFollowRedirects(true);
				conn.setConnectTimeout(10000);
				conn.setReadTimeout(10000);
				conn.connect();

				String mimeType = conn.getContentType();
				String encoding = conn.getContentEncoding();
				if (encoding == null) encoding = "utf-8";
				if (mimeType == null) mimeType = "application/javascript";

				Map<String, String> headers = new HashMap<>();
				headers.put("Access-Control-Allow-Origin", "*");
				headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
				headers.put("Access-Control-Allow-Headers", "*");
				headers.put("Cross-Origin-Resource-Policy", "cross-origin");

				return new WebResourceResponse(
				        mimeType, encoding,
				        conn.getResponseCode(), getReasonPhrase(conn.getResponseCode()),
				        headers, conn.getInputStream()
				);

			} catch (Exception e) {
				Log.e("YTPRO_WVC", "Google JS fetch failed: " + e.getMessage());
			}
		}


		if (url.contains("youtube.com/ytpro_cdn/npm/ytpro")) {
			try {
				String assetName;
				if (url.contains("/bgplay.js")) assetName = "bgplay.js";
				else if (url.contains("/innertube.js")) assetName = "innertube.js";
				else assetName = "script.js";

				Map<String, String> headers = new HashMap<>();
				headers.put("Access-Control-Allow-Origin", "*");
				headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
				headers.put("Access-Control-Allow-Headers", "*");
				headers.put("Content-Type", "application/javascript");
				headers.put("Cross-Origin-Resource-Policy", "cross-origin");

				if (request.getMethod().equals("OPTIONS")) {
					return new WebResourceResponse("text/plain", "UTF-8", 204, "No Content", headers, null);
				}

				InputStream assetStream = activity.getAssets().open(assetName);
				return new WebResourceResponse("application/javascript", "utf-8", 200, "OK", headers, assetStream);
			} catch (Exception e) {
				Log.e("YTPRO_WVC", "Local asset load failed: " + e.getMessage());
			}
		}

		if (url.contains("youtube.com/ytpro_cdn/")) {
			String modifiedUrl = url;
			if (url.contains("youtube.com/ytpro_cdn/esm"))
				modifiedUrl = url.replace("youtube.com/ytpro_cdn/esm", "esm.sh");
			else if (url.contains("youtube.com/ytpro_cdn/npm"))
				modifiedUrl = url.replace("youtube.com/ytpro_cdn", "cdn.jsdelivr.net");

			try {
				URL newUrl = new URL(modifiedUrl);
				HttpsURLConnection connection = (HttpsURLConnection) newUrl.openConnection();
				connection.setUseCaches(false);
				connection.setDefaultUseCaches(false);
				connection.addRequestProperty("Cache-Control", "no-cache, no-store, must-revalidate");
				connection.addRequestProperty("Pragma", "no-cache");
				connection.addRequestProperty("Expires", "0");
				connection.setRequestProperty("User-Agent", "YTPRO");
				connection.setRequestProperty("Accept", "**");
				connection.setConnectTimeout(10000);
				connection.setReadTimeout(10000);
				connection.setRequestMethod("GET");
				connection.connect();

				String mimeType = connection.getContentType() != null ? connection.getContentType() : "application/javascript";
				String encoding = connection.getContentEncoding() != null ? connection.getContentEncoding() : "utf-8";
				if (encoding == null) encoding = "utf-8";

				String contentType = connection.getContentType();
				if (contentType == null) contentType = "application/javascript";

				Map<String, String> headers = new HashMap<>();
				headers.put("Access-Control-Allow-Origin", "*");
				headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
				headers.put("Access-Control-Allow-Headers", "*");
				headers.put("Content-Type", contentType);
				headers.put("Access-Control-Allow-Credentials", "true");
				headers.put("Cross-Origin-Resource-Policy", "cross-origin");

				if (request.getMethod().equals("OPTIONS")) {
					return new WebResourceResponse("text/plain", "UTF-8", 204, "No Content", headers, null);
				}

				int rc = connection.getResponseCode();
				return new WebResourceResponse(mimeType, encoding, rc, getReasonPhrase(rc), headers, connection.getInputStream());
			} catch (Exception e) {
				return super.shouldInterceptRequest(view, request);
			}
		}

		return super.shouldInterceptRequest(view, request);
	}

	/** Returns a human-readable HTTP reason phrase for common status codes. */
	private static String getReasonPhrase(int code) {
		switch (code) {
			case 200: return "OK";
			case 201: return "Created";
			case 204: return "No Content";
			case 301: return "Moved Permanently";
			case 302: return "Found";
			case 304: return "Not Modified";
			case 400: return "Bad Request";
			case 401: return "Unauthorized";
			case 403: return "Forbidden";
			case 404: return "Not Found";
			case 429: return "Too Many Requests";
			case 500: return "Internal Server Error";
			case 502: return "Bad Gateway";
			case 503: return "Service Unavailable";
			default:  return code >= 400 ? "Error" : "OK";
		}
	}

	@Override
	public void onPageFinished(WebView view, String url) {
		web.evaluateJavascript(
		        "if (window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {" +
		        "window.trustedTypes.createPolicy('default', {" +
		        "createHTML: (string) => string," +
		        "createScriptURL: string => string," +
		        "createScript: string => string," +
		        "});}", null);

		web.evaluateJavascript(
		        "(function () { var script = document.createElement('script'); " +
		        "script.src='https://youtube.com/ytpro_cdn/npm/ytpro@latest'; " +
		        "document.body.appendChild(script); })()", null);
		web.evaluateJavascript(
		        "(function () { var script = document.createElement('script'); " +
		        "script.src='https://youtube.com/ytpro_cdn/npm/ytpro@latest/bgplay.js'; " +
		        "document.body.appendChild(script); })()", null);
		web.evaluateJavascript(
		        "(function () { var script = document.createElement('script'); " +
		        "script.type='module'; " +
		        "script.src='https://youtube.com/ytpro_cdn/npm/ytpro@latest/innertube.js'; " +
		        "document.body.appendChild(script); })()", null);

		if (!url.contains("youtube.com/watch") && !url.contains("youtube.com/shorts") && activity.isPlaying) {
			activity.isPlaying = false;
			activity.mediaSession = false;
			activity.stopService(new Intent(activity.getApplicationContext(), ForegroundService.class));
		}
		super.onPageFinished(view, url);
	}
}
