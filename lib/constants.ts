/** Central place for cross-site constants so a number/link never drifts out of sync. */
export const WHATSAPP_NUMBER_DISPLAY = "+1 437 707 8022";
export const WHATSAPP_NUMBER_E164 = "14377078022"; // wa.me needs digits only, no "+"
export const WHATSAPP_LINK = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER_E164}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const CONTACT_EMAIL = "onecorelabs7@gmail.com";
