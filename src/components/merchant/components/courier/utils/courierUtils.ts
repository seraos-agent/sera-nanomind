export function formatIndonesianPhone(phone?: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length >= 10 && digits.length <= 13) {
    if (digits.length === 10) {
      return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
    } else if (digits.length === 11) {
      return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
    } else if (digits.length === 12) {
      return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      return digits.replace(/(\d{4})(\d{4})(\d{5})/, "$1-$2-$3");
    }
  }
  return phone;
}
