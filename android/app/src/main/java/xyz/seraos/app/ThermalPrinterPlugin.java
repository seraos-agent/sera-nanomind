package xyz.seraos.app;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Base64;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * ThermalPrinterPlugin - Native Android Bluetooth Classic (SPP) ESC/POS printing bridge
 * for Capacitor 8 without fragile third-party plugin dependencies.
 */
@CapacitorPlugin(
    name = "ThermalPrinter",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN
            }
        )
    }
)
public class ThermalPrinterPlugin extends Plugin {

    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private final ExecutorService printExecutor = Executors.newSingleThreadExecutor();

    private BluetoothAdapter getBluetoothAdapter() {
        BluetoothManager manager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (manager != null && manager.getAdapter() != null) {
            return manager.getAdapter();
        }
        return BluetoothAdapter.getDefaultAdapter();
    }

    private boolean hasBluetoothConnectPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        BluetoothAdapter adapter = getBluetoothAdapter();
        JSObject ret = new JSObject();
        ret.put("supported", adapter != null);
        ret.put("enabled", adapter != null && adapter.isEnabled());
        ret.put("hasPermission", hasBluetoothConnectPermission());
        call.resolve(ret);
    }

    @PluginMethod
    public void listPairedPrinters(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !hasBluetoothConnectPermission()) {
            requestPermissionForAlias("bluetooth", call, "handleBluetoothPermissionForList");
            return;
        }
        resolvePairedPrinters(call);
    }

    @PermissionCallback
    private void handleBluetoothPermissionForList(PluginCall call) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED || hasBluetoothConnectPermission()) {
            resolvePairedPrinters(call);
        } else {
            call.reject("Bluetooth permission is required to list paired thermal printers.");
        }
    }

    private void resolvePairedPrinters(PluginCall call) {
        BluetoothAdapter adapter = getBluetoothAdapter();
        if (adapter == null) {
            call.reject("Bluetooth hardware is unavailable on this device.");
            return;
        }
        if (!adapter.isEnabled()) {
            call.reject("Bluetooth is turned off. Please enable Bluetooth in device settings.");
            return;
        }

        try {
            Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
            JSArray list = new JSArray();
            if (bondedDevices != null) {
                for (BluetoothDevice device : bondedDevices) {
                    JSObject item = new JSObject();
                    String name = device.getName();
                    item.put("name", (name != null && !name.isEmpty()) ? name : "Bluetooth Device");
                    item.put("address", device.getAddress());
                    item.put("bonded", true);
                    list.put(item);
                }
            }
            JSObject result = new JSObject();
            result.put("printers", list);
            call.resolve(result);
        } catch (SecurityException se) {
            call.reject("Bluetooth access denied: " + se.getMessage());
        }
    }

    @PluginMethod
    public void printRawBytes(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !hasBluetoothConnectPermission()) {
            requestPermissionForAlias("bluetooth", call, "handleBluetoothPermissionForPrint");
            return;
        }
        executePrint(call);
    }

    @PermissionCallback
    private void handleBluetoothPermissionForPrint(PluginCall call) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED || hasBluetoothConnectPermission()) {
            executePrint(call);
        } else {
            call.reject("Bluetooth permission denied.");
        }
    }

    private void executePrint(PluginCall call) {
        final String address = call.getString("address");
        final String dataBase64 = call.getString("dataBase64");

        if (address == null || address.trim().isEmpty()) {
            call.reject("Printer Bluetooth address is required.");
            return;
        }
        if (dataBase64 == null || dataBase64.trim().isEmpty()) {
            call.reject("Receipt payload dataBase64 is required.");
            return;
        }

        final BluetoothAdapter adapter = getBluetoothAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            call.reject("Bluetooth is unavailable or disabled.");
            return;
        }

        final byte[] rawBytes;
        try {
            rawBytes = Base64.decode(dataBase64, Base64.DEFAULT);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid Base64 print payload.");
            return;
        }

        printExecutor.execute(() -> {
            BluetoothSocket socket = null;
            OutputStream outputStream = null;
            try {
                try {
                    adapter.cancelDiscovery();
                } catch (SecurityException ignored) {}

                BluetoothDevice device = adapter.getRemoteDevice(address.trim());
                socket = openSppSocketWithFallback(device);
                outputStream = socket.getOutputStream();

                // Stream ESC/POS payload in conservative chunks to prevent buffer overflow on budget printer chips
                final int chunkSize = 1024;
                for (int offset = 0; offset < rawBytes.length; offset += chunkSize) {
                    int length = Math.min(chunkSize, rawBytes.length - offset);
                    outputStream.write(rawBytes, offset, length);
                    outputStream.flush();
                    Thread.sleep(25);
                }

                // Allow printer UART/BT radio buffer to drain completely before closing RFCOMM socket
                Thread.sleep(300);
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to print to Bluetooth device: " + e.getMessage());
            } finally {
                if (outputStream != null) {
                    try {
                        outputStream.close();
                    } catch (IOException ignored) {}
                }
                if (socket != null) {
                    try {
                        socket.close();
                    } catch (IOException ignored) {}
                }
            }
        });
    }

    private BluetoothSocket openSppSocketWithFallback(BluetoothDevice device) throws IOException, SecurityException {
        try {
            BluetoothSocket secureSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            secureSocket.connect();
            return secureSocket;
        } catch (IOException primaryErr) {
            try {
                BluetoothSocket insecureSocket = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
                insecureSocket.connect();
                return insecureSocket;
            } catch (IOException secondaryErr) {
                try {
                    // Reflection RFCOMM channel 1 fallback for legacy embedded thermal printers
                    Method m = device.getClass().getMethod("createRfcommSocket", int.class);
                    BluetoothSocket legacySocket = (BluetoothSocket) m.invoke(device, 1);
                    legacySocket.connect();
                    return legacySocket;
                } catch (Exception legacyErr) {
                    throw primaryErr;
                }
            }
        }
    }
}
