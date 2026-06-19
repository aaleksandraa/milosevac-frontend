export const openCookieSettingsEvent = "milosevac:open-cookie-settings";
export const cookieConsentUpdatedEvent = "milosevac:cookie-consent-updated";
export const cookieConsentKey = "milosevac_cookie_consent_v2";

export function openCookieSettings() {
  window.dispatchEvent(new Event(openCookieSettingsEvent));
}
