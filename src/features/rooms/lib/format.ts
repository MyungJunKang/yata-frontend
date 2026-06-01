export function formatDepartAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, "0");
  const period = hour < 12 ? "오전" : "오후";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${display}:${minute}`;
}
