/**
 * Scheduler adapter seam.
 *
 * Routines are stored in Postgres (`routines` table) with a cron expression,
 * timezone and a precomputed `next_run_at`. Actual firing is done by ANY
 * external ticker that calls POST /api/jobs/execute-routine with the
 * CRON_SECRET bearer token — so scheduled work never depends on a user's
 * browser being open.
 *
 * The default "database polling" strategy needs no per-routine registration:
 * the tick endpoint scans for `enabled = true AND next_run_at <= now()`.
 * If you move to a push-based scheduler (Inngest, Trigger.dev, QStash,
 * Cloud Scheduler), implement this interface and call it from the routine
 * mutations so external schedules stay in sync.
 */

import type { Routine } from "@/lib/types";

export interface SchedulerAdapter {
  id: string;
  /** Called when a routine is created/updated/enabled. */
  schedule(routine: Routine): Promise<void>;
  /** Called when a routine is disabled or deleted. */
  unschedule(routineId: string): Promise<void>;
}

/** Default: nothing to register — the tick endpoint polls the database. */
export const databasePollingScheduler: SchedulerAdapter = {
  id: "database-polling",
  async schedule() {},
  async unschedule() {},
};

export function getSchedulerAdapter(): SchedulerAdapter {
  return databasePollingScheduler;
}
