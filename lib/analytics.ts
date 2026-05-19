/** GA4 Measurement ID (e.g. G-XXXXXXXXXX); false when unset or placeholder */
export function getGaMeasurementId(): string | undefined {
  const id =
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() ||
    process.env.GOOGLE_ANALYTICS_ID?.trim() ||
    '';
  if (!id || id.toLowerCase().includes('your-analytics')) return undefined;
  if (!/^G-[A-Z0-9]+$/i.test(id)) return undefined;
  return id;
}
