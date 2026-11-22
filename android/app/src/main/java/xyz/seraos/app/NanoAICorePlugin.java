package xyz.seraos.app;

import android.content.pm.PackageManager;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.ai.edge.aicore.Content;
import com.google.ai.edge.aicore.DownloadConfig;
import com.google.ai.edge.aicore.GenerateContentResponse;
import com.google.ai.edge.aicore.GenerationConfig;
import com.google.ai.edge.aicore.GenerativeModel;
import com.google.ai.edge.aicore.java.GenerativeModelFutures;

import java.util.concurrent.TimeUnit;

/**
 * Capacitor native bridge to Android AICore (on-device Gemini Nano).
 * Allows SERA NanoMind to execute prompts offline on supported Android devices
 * and transparently report unavailability on unsupported devices so the JS router
 * falls back to Firebase Cloud.
 */
@CapacitorPlugin(name = "NanoAICore")
public class NanoAICorePlugin extends Plugin {

    private static final String AICORE_PACKAGE = "com.google.android.aicore";
    private static final int MIN_AICORE_SDK = 31;

    @SuppressWarnings("deprecation")
    private boolean isAiCorePackageInstalled() {
        if (Build.VERSION.SDK_INT < MIN_AICORE_SDK || getContext() == null) {
            return false;
        }
        try {
            PackageManager pm = getContext().getPackageManager();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getPackageInfo(AICORE_PACKAGE, PackageManager.PackageInfoFlags.of(0));
            } else {
                pm.getPackageInfo(AICORE_PACKAGE, 0);
            }
            return true;
        } catch (PackageManager.NameNotFoundException | SecurityException e) {
            return false;
        }
    }

    @PluginMethod
    public void checkStatus(PluginCall call) {
        JSObject ret = new JSObject();
        boolean installed = isAiCorePackageInstalled();
        String deviceModel = Build.MANUFACTURER + " " + Build.MODEL;

        ret.put("aicoreInstalled", installed);
        ret.put("sdkInt", Build.VERSION.SDK_INT);
        ret.put("deviceModel", deviceModel);

        if (Build.VERSION.SDK_INT < MIN_AICORE_SDK) {
            ret.put("detail", "Android SDK " + Build.VERSION.SDK_INT + " is below API 31 required by AICore.");
        } else if (installed) {
            ret.put("detail", "Android AICore system service detected on " + deviceModel + ".");
        } else {
            ret.put("detail", "Android AICore is not installed on " + deviceModel + "; using Firebase Cloud fallback.");
        }

        call.resolve(ret);
    }

    @PluginMethod
    public void generatePrompt(PluginCall call) {
        String prompt = call.getString("prompt", "");
        if (prompt == null || prompt.trim().isEmpty()) {
            JSObject ret = new JSObject();
            ret.put("available", false);
            ret.put("error", "Prompt text is required.");
            call.resolve(ret);
            return;
        }

        if (!isAiCorePackageInstalled()) {
            JSObject ret = new JSObject();
            ret.put("available", false);
            ret.put("error", "Android AICore system service is not available on this device.");
            call.resolve(ret);
            return;
        }

        new Thread(() -> {
            GenerativeModel model = null;
            JSObject ret = new JSObject();
            try {
                GenerationConfig.Builder configBuilder = new GenerationConfig.Builder();
                configBuilder.setContext(getContext().getApplicationContext());
                configBuilder.setTemperature(0.2f);
                configBuilder.setTopK(16);
                configBuilder.setMaxOutputTokens(1024);
                GenerationConfig config = configBuilder.build();

                DownloadConfig downloadConfig = new DownloadConfig();
                model = new GenerativeModel(config, downloadConfig);

                GenerativeModelFutures futures = GenerativeModelFutures.from(model);
                Content content = new Content.Builder().addText(prompt).build();
                GenerateContentResponse response = futures.generateContent(content).get(20, TimeUnit.SECONDS);

                String text = response != null ? response.getText() : null;
                if (text != null && !text.trim().isEmpty()) {
                    ret.put("available", true);
                    ret.put("text", text.trim());
                } else {
                    ret.put("available", false);
                    ret.put("error", "Android AICore returned an empty response.");
                }
            } catch (Exception e) {
                ret.put("available", false);
                ret.put("error", e.getMessage() != null ? e.getMessage() : e.toString());
            } finally {
                if (model != null) {
                    try {
                        model.close();
                    } catch (Exception ignored) {
                    }
                }
            }
            call.resolve(ret);
        }).start();
    }
}
