import { CronExpressionParser } from "cron-parser";

/** Next fire time for a 5-field cron expression in the given IANA timezone. */
export function computeNextRun(
  cron: string,
  timezone: string,
  from: Date = new Date()
): Date | null {
  try {
    const interval = CronExpressionParser.parse(cron, {
      tz: timezone || "UTC",
      currentDate: from,
    });
    return interval.next().toDate();
  } catch {
    return null;
  }
}

export function isValidCron(cron: string): boolean {
  try {
    CronExpressionParser.parse(cron);
    return true;
  } catch {
    return false;
  }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Human-readable description for common cron shapes; falls back to the raw expression. */
export function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;
  const [min, hour, dom, , dow] = parts;
  const time =
    /^\d+$/.test(min) && /^\d+$/.test(hour)
      ? `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`
      : null;
  if (!time) return cron;
  if (dom === "*" && dow === "*") return `Daily at ${time}`;
  if (dom === "*" && dow === "1-5") return `Weekdays at ${time}`;
  if (dom === "*" && /^\d$/.test(dow))
    return `${WEEKDAYS[Number(dow) % 7]} at ${time}`;
  if (dom === "*" && /^\d(,\d)+$/.test(dow))
    return `${dow
      .split(",")
      .map((d) => WEEKDAYS[Number(d) % 7])
      .join(", ")} at ${time}`;
  if (/^\d+$/.test(dom) && dow === "*") return `Monthly on day ${dom} at ${time}`;
  return cron;
}

export const CRON_PRESETS = [
  { label: "Every weekday at 8:00", value: "0 8 * * 1-5" },
  { label: "Daily at 9:00", value: "0 9 * * *" },
  { label: "Every Monday at 7:00", value: "0 7 * * 1" },
  { label: "Every Friday at 16:00", value: "0 16 * * 5" },
  { label: "First of the month at 9:00", value: "0 9 1 * *" },
  { label: "Every hour", value: "0 * * * *" },
];
