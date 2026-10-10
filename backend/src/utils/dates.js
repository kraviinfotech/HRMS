export function startOfLocalDay(date = new Date()) {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  return local;
}

export function endOfLocalDay(date = new Date()) {
  const local = startOfLocalDay(date);
  local.setHours(23, 59, 59, 999);
  return local;
}

export function toMonthKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 7);
}

export function minutesBetween(start, end) {
  return Math.max(Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000), 0);
}
