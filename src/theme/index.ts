import { Clock } from "lucide-react";

export const THEME = {
  light: {
    isDark: false,
    bg: "#F3F4F6",
    surface: "#FFFFFF",
    surface2: "#F8F9FA",
    border: "#E5E7EB",
    ink: "#191C1F",
    inkSoft: "#686F78",
    inkFaint: "#A4AAB2",
    accent: "#3452E0",
    accentHover: "#2A41B8",
    accentSoft: "#E7EAFB",
    accentInk: "#FFFFFF",
    status: "#0E9C87",
    statusSoft: "#DFF3EF",
    bubbleUser: "#EAECEE",
    bubbleUserInk: "#191C1F",
    shellShadow: "0 1px 2px rgba(16,24,32,0.04), 0 16px 40px rgba(16,24,32,0.10)",
    chatInputBg: "#FFFFFF",
    chatInputBorder: "#E5E7EB",
  },
  dark: {
    isDark: true,
    bg: "#000000",
    surface: "#000000",
    surface2: "#18181B",
    border: "#27272A",
    ink: "#E4E4E7",
    inkSoft: "#9CA3AF",
    inkFaint: "#52525B",
    accent: "#6E85FF",
    accentHover: "#8B9EFF",
    accentSoft: "#182042",
    accentInk: "#000000",
    status: "#2DD4BF",
    statusSoft: "#0F2E28",
    bubbleUser: "#1E1E22",
    bubbleUserInk: "#F4F4F5",
    shellShadow: "none",
    chatInputBg: "#18181B",
    chatInputBorder: "#2E2E33",
  },
};

export type ThemeType = typeof THEME.light;

export const CONNECTORS = [
  { id: "automations", name: "Active Intents", icon: Clock },
];

export const SUGGESTIONS = [
  "Cek sisa kuota AI saya",
  "Cari produk di Marketplace",
  "Bantu koordinasi order Mitra Store",
  "Hubungkan ke WhatsApp & Telegram",
];

export const FONT_LINK_ID = "chatui-fonts";
