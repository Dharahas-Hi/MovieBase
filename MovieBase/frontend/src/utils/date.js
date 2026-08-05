// Shared date helpers.
//
// `new Date("2024-06-15")` parses as UTC midnight, which renders the
// *previous* day in timezones west of UTC (e.g. US). These helpers parse a
// bare calendar date ("YYYY-MM-DD") as LOCAL midnight so the displayed
// month/day/year always matches the actual release date.

export function parseDate(dateStr) {
  if (!dateStr) return null;

  // Bare calendar date -> local midnight.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getYear(dateStr) {
  const d = parseDate(dateStr);
  return d ? d.getFullYear() : "";
}

// Format a date string as e.g. "Jun 15, 2024" using the local calendar date.
export function formatShortDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format a date string as e.g. "June 15, 2024" using the local calendar date.
export function formatLongDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// True when the date string falls on today's calendar date (local time).
// Used to flag movies that release (or re-release) today.
export function isToday(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// The user's IANA timezone, e.g. "Asia/Kolkata" or "America/New_York".
// Falls back to "" when Intl is unavailable.
export function getUserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

// The user's current UTC offset, e.g. "GMT+05:30" or "GMT-07:00".
export function timeZoneOffsetLabel(date = new Date()) {
  try {
    const tz = getUserTimeZone();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz || undefined,
      timeZoneName: "longOffset",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value || tz || "";
  } catch {
    return "";
  }
}

// Release date shown in the user's LOCAL timezone, e.g.
// "August 3, 2026, 12:00 AM GMT+05:30". Because TMDB only provides a
// calendar date (no time), the release moment is treated as local midnight
// and the user's offset is appended so it's unambiguous across timezones.
export function formatDateWithTimeZone(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  try {
    const datePart = d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const tz = timeZoneOffsetLabel(d);
    return tz ? `${datePart}, ${timePart} ${tz}` : datePart;
  } catch {
    return formatLongDate(dateStr);
  }
}
