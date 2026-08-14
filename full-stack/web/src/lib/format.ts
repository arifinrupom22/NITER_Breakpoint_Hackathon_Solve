export function fmtClock(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fmtTime12(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${period}`;
}

export function cls(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

export const ocTone: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

export const trafficTone: Record<string, string> = {
  'On Time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Slight Delay': 'bg-amber-50 text-amber-700 border-amber-200',
  Delayed: 'bg-orange-50 text-orange-700 border-orange-200',
  'Heavy Traffic': 'bg-red-50 text-red-700 border-red-200',
  'Very Heavy Traffic': 'bg-red-100 text-red-800 border-red-300',
};
