
/**
 * Utility for storing/retrieving string values in localStorage with an expiration period.
 */
export function setExpiringItem(key: string, value: any, hours: number) {
  const expiresAt = Date.now() + hours * 60 * 60 * 1000;
  const payload = JSON.stringify({ value, expiresAt });
  localStorage.setItem(key, payload);
}

export function getExpiringItem<T = any>(key: string): T | null {
  const data = localStorage.getItem(key);
  if (!data) return null;

  try {
    const { value, expiresAt } = JSON.parse(data);
    if (typeof expiresAt === "number" && Date.now() > expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return value as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function removeExpiringItem(key: string) {
  localStorage.removeItem(key);
}
