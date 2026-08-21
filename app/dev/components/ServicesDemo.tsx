/**
 * ⚠️ **THIS FILE IS DEAD — DELETE IT.** It is emptied rather than removed because the
 * agent sandbox cannot delete files inside the mounted folder; leaving the old contents
 * in place would have left `tsc` failing on props that no longer exist.
 *
 * It was the `/dev/components` harness for `ServiceNumerals` + `ServicePanel`: a slider
 * driving a `progress` value so both could be reviewed mid-transition, at 2.4, which
 * scrolling never lets you sit at for long.
 *
 * Both of its subjects are gone (13 Aug):
 *
 * - `ServiceNumerals` — the reel's numerals, then the service glyphs at numeral size.
 *   Removed when each card gained its own image; the harness was the only importer left.
 * - `ServicePanel` — the phone's Services card. Superseded when the mobile section was
 *   rebuilt to match desktop, so `ServiceCard` in its `stacked` layout renders both.
 *
 * `ServiceCard` is now reviewed directly on `/dev/components`, in both layouts and at
 * three `distance` values, with no slider — it has no continuous motion of its own.
 *
 * **Delete alongside this file:** `app/dev/components/ServicesDemo.tsx`,
 * `components/ServicePanel.tsx`, `components/ServiceNumerals.tsx`.
 */

export {};
