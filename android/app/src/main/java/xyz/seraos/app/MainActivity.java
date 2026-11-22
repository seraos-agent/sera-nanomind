package xyz.seraos.app;

import android.Manifest;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {

    private static final int REQUEST_WRITE_STORAGE = 1019;
    private String pendingBase64;
    private String pendingFilename;

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_WRITE_STORAGE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingBase64 != null) {
                    performSaveImage(pendingBase64, pendingFilename);
                    pendingBase64 = null;
                    pendingFilename = null;
                }
            } else {
                Toast.makeText(this, "Izin penyimpanan dibutuhkan untuk mendownload gambar ke Galeri", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        registerPlugin(SystemBarsPlugin.class);
        registerPlugin(ThermalPrinterPlugin.class);
        registerPlugin(NanoAICorePlugin.class);
        super.onCreate(savedInstanceState);

        // Keep system bars light (#FFFFFF with dark icons) during launch/splash
        applySystemBars(false, "#FFFFFF");

        setupNativeWebViewInsets();
        setupBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        setupNativeWebViewInsets();
        setupBridge();
    }

    private void setupNativeWebViewInsets() {
        runOnUiThread(() -> {
            try {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    View webView = getBridge().getWebView();
                    ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
                        Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                        ViewGroup.LayoutParams rawLp = v.getLayoutParams();
                        if (rawLp instanceof ViewGroup.MarginLayoutParams) {
                            ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) rawLp;
                            if (mlp.topMargin != insets.top || mlp.bottomMargin != insets.bottom) {
                                mlp.topMargin = insets.top;
                                mlp.bottomMargin = insets.bottom;
                                v.setLayoutParams(mlp);
                            }
                        }
                        return windowInsets;
                    });
                    ViewCompat.requestApplyInsets(webView);
                }
            } catch (Exception ignored) {}
        });
    }

    private void setupBridge() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                AndroidBridge bridge = new AndroidBridge();
                getBridge().getWebView().addJavascriptInterface(bridge, "AndroidSystemBars");
                getBridge().getWebView().addJavascriptInterface(bridge, "AndroidBridge");
            }
        } catch (Exception ignored) {}
    }

    public void applySystemBars(boolean isDark, String hexColor) {
        runOnUiThread(() -> {
            try {
                Window window = getWindow();
                if (window == null) return;

                int color = Color.parseColor(hexColor);

                // Option B: Decor does not fit system windows so system bars paint solid behind them,
                // while webView margins are strictly inset via setOnApplyWindowInsetsListener.
                WindowCompat.setDecorFitsSystemWindows(window, false);

                // Option B: Set solid background on window and root decor
                window.setBackgroundDrawable(new ColorDrawable(color));
                View decorView = window.getDecorView();
                if (decorView != null) {
                    decorView.setBackgroundColor(color);
                }

                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
                window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);

                // Set solid colors for Status Bar and Navigation Bar
                window.setStatusBarColor(color);
                window.setNavigationBarColor(color);

                // Subtle hairline divider for navigation bar
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    int dividerColor = Color.parseColor(isDark ? "#282C34" : "#E5E7EB");
                    window.setNavigationBarDividerColor(dividerColor);
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    window.setStatusBarContrastEnforced(false);
                    window.setNavigationBarContrastEnforced(false);
                }

                WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, decorView != null ? decorView : window.getDecorView());
                if (insetsController != null) {
                    // setAppearanceLightStatusBars:
                    // true = dark text/icons (for light backgrounds like #FFFFFF)
                    // false = light text/icons (for dark backgrounds like #121417)
                    insetsController.setAppearanceLightStatusBars(!isDark);
                    insetsController.setAppearanceLightNavigationBars(!isDark);
                }

                // Request insets update on webview to enforce margins
                if (getBridge() != null && getBridge().getWebView() != null) {
                    ViewCompat.requestApplyInsets(getBridge().getWebView());
                }
            } catch (Exception ignored) {}
        });
    }

    public void performSaveImage(String base64Data, String filename) {
        new Thread(() -> {
            try {
                if (base64Data == null || base64Data.trim().isEmpty()) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gagal: Data gambar kosong", Toast.LENGTH_SHORT).show());
                    return;
                }

                String mimeType = "image/png";
                String ext = ".png";
                String lowerHeader = base64Data.length() > 64 ? base64Data.substring(0, 64).toLowerCase() : base64Data.toLowerCase();
                if (lowerHeader.contains("image/jpeg") || lowerHeader.contains("image/jpg")) {
                    mimeType = "image/jpeg";
                    ext = ".jpg";
                } else if (lowerHeader.contains("image/webp")) {
                    mimeType = "image/webp";
                    ext = ".webp";
                }

                String cleanBase64 = base64Data;
                if (cleanBase64.contains(",")) {
                    cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                }
                byte[] imageBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                if (imageBytes == null || imageBytes.length == 0) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gagal: Format gambar tidak valid", Toast.LENGTH_SHORT).show());
                    return;
                }

                // Fallback magic-byte detection if data URL header did not specify MIME type
                if (imageBytes.length >= 12) {
                    if ((imageBytes[0] & 0xFF) == 0xFF && (imageBytes[1] & 0xFF) == 0xD8 && (imageBytes[2] & 0xFF) == 0xFF) {
                        mimeType = "image/jpeg";
                        ext = ".jpg";
                    } else if (imageBytes[0] == 'R' && imageBytes[1] == 'I' && imageBytes[2] == 'F' && imageBytes[3] == 'F'
                            && imageBytes[8] == 'W' && imageBytes[9] == 'E' && imageBytes[10] == 'B' && imageBytes[11] == 'P') {
                        mimeType = "image/webp";
                        ext = ".webp";
                    }
                }

                String baseName = (filename != null && !filename.trim().isEmpty())
                    ? filename.trim().replaceAll("\\.(png|jpg|jpeg|webp)$", "")
                    : ("SERA_" + System.currentTimeMillis());
                String name = baseName + ext;
                long nowSec = System.currentTimeMillis() / 1000L;
                long nowMs = System.currentTimeMillis();

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Images.Media.DISPLAY_NAME, name);
                    values.put(MediaStore.Images.Media.MIME_TYPE, mimeType);
                    values.put(MediaStore.Images.Media.DATE_ADDED, nowSec);
                    values.put(MediaStore.Images.Media.DATE_TAKEN, nowMs);
                    values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Sera");
                    values.put(MediaStore.Images.Media.IS_PENDING, 1);

                    Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                            if (out != null) {
                                out.write(imageBytes);
                                out.flush();
                            }
                        }

                        values.clear();
                        values.put(MediaStore.Images.Media.IS_PENDING, 0);
                        getContentResolver().update(uri, values, null, null);
                        getContentResolver().notifyChange(uri, null);

                        // Trigger MediaScanner on resolved _DATA path so OEM Galleries index immediately
                        String filePath = null;
                        try (Cursor cursor = getContentResolver().query(uri, new String[]{MediaStore.Images.Media.DATA}, null, null, null)) {
                            if (cursor != null && cursor.moveToFirst()) {
                                int idx = cursor.getColumnIndex(MediaStore.Images.Media.DATA);
                                if (idx >= 0) filePath = cursor.getString(idx);
                            }
                        } catch (Exception ignored) {}
                        if (filePath != null && !filePath.isEmpty()) {
                            MediaScannerConnection.scanFile(MainActivity.this, new String[]{filePath}, new String[]{mimeType}, null);
                        }

                        runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gambar berhasil disimpan ke Galeri", Toast.LENGTH_SHORT).show());
                    } else {
                        runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gagal menyimpan gambar", Toast.LENGTH_SHORT).show());
                    }
                } else {
                    File picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
                    File seraDir = new File(picturesDir, "Sera");
                    if (!seraDir.exists() && !seraDir.mkdirs()) {
                        runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gagal membuat folder Galeri", Toast.LENGTH_SHORT).show());
                        return;
                    }
                    File outFile = new File(seraDir, name);
                    try (FileOutputStream fos = new FileOutputStream(outFile)) {
                        fos.write(imageBytes);
                        fos.flush();
                    }
                    MediaScannerConnection.scanFile(MainActivity.this, new String[]{outFile.getAbsolutePath()}, new String[]{mimeType}, null);
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gambar berhasil disimpan ke Galeri", Toast.LENGTH_SHORT).show());
                }
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Gagal menyimpan: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }).start();
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void setSystemBars(boolean isDark, String hexColor) {
            applySystemBars(isDark, hexColor);
        }

        @JavascriptInterface
        public void saveImageToGallery(String base64Data, String filename) {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                        pendingBase64 = base64Data;
                        pendingFilename = filename;
                        ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQUEST_WRITE_STORAGE);
                        return;
                    }
                }
                performSaveImage(base64Data, filename);
            });
        }
    }

    @CapacitorPlugin(name = "SystemBars")
    public static class SystemBarsPlugin extends Plugin {

        @PluginMethod
        public void setStyle(PluginCall call) {
            Boolean isDark = call.getBoolean("isDark", false);
            String color = call.getString("color", isDark != null && isDark ? "#121417" : "#FFFFFF");

            MainActivity activity = (MainActivity) getActivity();
            if (activity != null) {
                activity.applySystemBars(isDark != null && isDark, color);
            }
            call.resolve();
        }

        @PluginMethod
        public void getInsets(PluginCall call) {
            // In Option B, WebView layout margins already handle hardware system bars insets physically.
            // Therefore, web content within the WebView should have 0 safe-area padding.
            JSObject ret = new JSObject();
            ret.put("top", 0);
            ret.put("bottom", 0);
            call.resolve(ret);
        }
    }
}
