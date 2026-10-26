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

- All plans keep their original agency, route, stop, trip, service, shape and block
  IDs. No plan prefix or URL encoding is added.
- Repeated IDs use the latest plan's complete definition. Latest means greatest
  original `active_from`, then `created_at`, then plan ID for deterministic ties,
  regardless of processing order or clipped export dates. Stop times are selected
  as a complete group per trip, shape points as a complete group per shape, and
  STePP extension rows as a complete group per route. Older trailing rows cannot
  survive a shorter replacement. The selected trip schedule and geometry apply
  to all exported dates referencing those IDs.
- Service dates from disjoint plan ranges are combined under the original service
  ID. In overlapping ranges, the latest plan's calendar wins, including removed
  operating dates. One calendar row and one addition per operating date are
  generated for each referenced service. `calendar_dates.txt` is sorted by date
  ascending across all services, then by service ID for dates shared by services.
- Existing `routes_stepp.txt` rows from the selected plan are preserved once per
  used route, including their circular flag. Missing extension fields fall back
  to `routes.txt`, then the first/last active stop names. Without a source
  extension, circularity is computed for each active shape/headsign from its
  trips' ordered endpoints.
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

Changed definitions report the file, original ID, both plan IDs, differing fields
and the winning plan in structured log attributes. The latest plan wins even
when its values match an earlier plan, preventing an intermediate plan from
reverting them. Signed download URLs are not logged.

Large stop-time, shape and route-extension groups are staged on disk while plans
are processed. Only winning groups enter the final CSVs; staging files are
removed before the worker creates the ZIP.

## Validation

Run `npm run build`, `npm test`, and `npm exec eslint src` from this package.
Fixtures cover calendar exceptions, range boundaries, source-field preservation,
original IDs across months, merged references and dates, overlapping calendar
removals, complete group replacement in either processing order, deterministic
ties, latest metadata and missing referenced data.
