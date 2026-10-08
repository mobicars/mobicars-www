function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Local calendar date, `YYYY-MM-DD`. Does not use UTC. */
export function formatRentCarSoftDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local date and time, `YYYY-MM-DD HH:mm`. Does not use UTC. */
export function formatRentCarSoftDateTime(date: Date): string {
  return `${formatRentCarSoftDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
