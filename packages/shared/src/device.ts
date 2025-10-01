let cachedId: string | null = null;

export function getDeviceUserId(): string {
  if (cachedId) return cachedId;
  if (typeof window === 'undefined') return 'server';
  const key = 'jetset_device_user_id';
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  cachedId = v;
  return v;
} 