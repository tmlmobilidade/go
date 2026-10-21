# Operation GTFS STePP

`operation-gtfs-stepp-v1` automatically finds Operation plans for an agency and date range and converts them into one STePP feed.
It reads only the matching plans' `operation_gtfs_normalized` attachments; it does
not query Offer. The Core extractions worker archives and uploads the output.

In Operation → Plans, choose **Export STePP**, an agency and an inclusive date
range. All plans with a normalized attachment whose active dates overlap the range
are included automatically. The worker checks `plans.read` for the agency and
resolves the matching plans again when the extraction runs. The extraction
properties contain only `agency_id`, `start_date`, and `end_date`.

Each plan is clipped to the intersection of its active dates and the requested
range. `calendar.txt` weekdays and `calendar_dates.txt` additions/removals determine
which trips run. Only those trips and their referenced routes, shapes, stops and
services are exported. Source times, distances, coordinates and stop sequences
are preserved. Services are written as explicit operating dates plus a matching
weekly calendar.

The output contains `agency.txt`, `calendar.txt`, `calendar_dates.txt`,
`routes.txt`, `routes_stepp.txt`, `shapes.txt`, `stop_times.txt`, `stops.txt`, and
`trips.txt`. Holidays are intentionally skipped: no `calendar_stepp.txt` is emitted
and no holiday collection is queried.

## Merging and metadata

- A single plan keeps its identifiers. For multiple plans, trip, service, shape
  and nonempty block IDs use `plan_<encoded plan ID>:<encoded source ID>` to keep
  references separate even when source IDs repeat.
- Agency, route and stop IDs stay unchanged. Identical exported rows are shared.
  For each route or stop, the latest plan supplies `route_long_name`,
  `route_short_name`, and `stop_name`. Latest means greatest original `active_from`,
  then `created_at`, then plan ID for deterministic ties, regardless of processing
  order or clipped export dates. One final row per public ID is written after all
  plans have been merged. Differences in other fields still fail with diagnostics.
- Existing `routes_stepp.txt` rows are preserved once per used route, including
  their circular flag. These rows have no standard pattern key, so all rows for
  a used route are retained. Missing extension fields fall back to `routes.txt`,
  then the first/last active stop names. Without a source extension, circularity
  is computed for each active shape/headsign from its trips' ordered endpoints.
- Missing `path_type` defaults to `1` (base path). A missing contract uses the same
  agency-code mapping as Offer (`41`–`44`); other agencies use an empty value.
- Existing binary directions and accessibility flags are preserved. Missing
  directions follow the first headsign/shape reference per route; missing bike
  and wheelchair flags use `0` (unspecified).

Temporary source ZIPs are removed after each plan and never enter the output ZIP.

## Logs

Each run lists the extraction ID, requested agency/dates, included plan IDs,
active and clipped date ranges, and normalized attachment IDs. Per-plan logs
report download/unzip durations, source filenames, CSV record counts, selected
and skipped trips, and the exported row counts. A failed plan identifies the
processing stage.

Conflicting agency, route or stop definitions report the file and public ID,
both plan IDs and export ranges, and every differing field with both values.
Values are JSON-quoted so empty strings and special characters are visible.
The same details are available in structured log attributes. Name changes log
both values and the winning plan instead of stopping the extraction. Route and
stop provenance advances to the latest plan even when its names are identical.
Other conflicting fields still stop the extraction. Signed download URLs are
not logged.

## Validation

Run `npm run build`, `npm test`, and `npm exec eslint src` from this package.
Fixtures cover calendar exceptions, range boundaries, source-field preservation,
merged references, latest-plan names in either processing order, deterministic
ties, conflicting non-name fields and missing referenced data.
