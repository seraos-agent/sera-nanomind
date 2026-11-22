import { THEME } from "../../theme";
import { EmailLoginGateway } from "../auth/EmailLoginGateway";
import { LaunchCodeGateway } from "../auth/LaunchCodeGateway";
import { isNativeMobile } from "../../utils/platform";

interface AuthGatewaysProps {
  mode: "light" | "dark";
  isLaunchCodeVerified: boolean;
  socket: any;
  onVerifyLaunchCode: () => void;
  onBypass: () => void;
  onAuthenticated: (payload: { token: string; userId: string; email: string }) => void;
}

export function AuthGateways({
  mode,
  isLaunchCodeVerified,
  socket,
  onVerifyLaunchCode,
  onBypass,
  onAuthenticated,
}: AuthGatewaysProps) {
  const showDevBypass =
    typeof window !== 'undefined' &&
    !isNativeMobile() &&
    (window.location.port === '5173' || window.location.port === '5174');

  const bypassButton = showDevBypass ? (
    <button
      onClick={() => {
        onBypass();
        if (socket) {
          socket.emit("auth:login", {});
        }
      }}
      style={{
        position: "fixed", bottom: 20, right: 20, background: "#ef4444", color: "#fff",
        border: "none", padding: "10px 20px", borderRadius: 12, cursor: "pointer",
        fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        fontFamily: "Inter, sans-serif"
      }}
    >
      🚧 Bypass Auth (Dev)
    </button>
  ) : null;

  if (!isLaunchCodeVerified) {
    return (
      <div style={{ backgroundColor: mode === "light" ? "#f3f4f6" : "#000", minHeight: "100vh", position: "relative" }}>
        <LaunchCodeGateway theme={THEME[mode]} onVerify={onVerifyLaunchCode} />
        {bypassButton}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: mode === "light" ? "#f3f4f6" : "#000", minHeight: "100vh", position: "relative" }}>
      <EmailLoginGateway theme={THEME[mode]} onAuthenticated={onAuthenticated} />
      {bypassButton}
    </div>
  );
}
