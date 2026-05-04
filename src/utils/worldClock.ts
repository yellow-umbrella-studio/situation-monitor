export interface CityTime {
  label: string;
  timezone: string;
  time: string;
}

const CITIES = [
  { label: 'NYC', timezone: 'America/New_York' },
  { label: 'LDN', timezone: 'Europe/London' },
  { label: 'MSK', timezone: 'Europe/Moscow' },
  { label: 'TLV', timezone: 'Asia/Jerusalem' },
  { label: 'BJG', timezone: 'Asia/Shanghai' },
];

export function getWorldClock(): CityTime[] {
  const now = new Date();
  return CITIES.map(({ label, timezone }) => ({
    label,
    timezone,
    time: now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }));
}
