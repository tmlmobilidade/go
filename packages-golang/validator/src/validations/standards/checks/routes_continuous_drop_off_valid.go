package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
)

/*
# Attributes

  - File: [routes.txt], [trips.txt], [stop_times.txt]
  - Field: [continuous_drop_off, route_id]
  - Presence: Conditionally Forbidden, Required
  - Type: Enum, Unique ID

# Description

  - continuous_drop_off: Route-wide continuous alighting policy: 0 allowed, 1 or empty unavailable, 2 arrangement by
    phone or 3 arrangement with the driver. Individual stop_times.txt records can override this policy.
  - route_id: Identifies a route within the dataset.

Validation: Checks that continuous_drop_off represents an integer from 0 to 3. If any stop time of a trip on this
route has either pickup/drop-off window populated, only 1 or an empty value is accepted. The lookup requires
routes.txt, trips.txt and stop_times.txt; configured value lists are not applied. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard routes].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard routes]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RoutesContinuousDropOffValid(ctx *contextTypes.ValidationContext) error {
	ready, err := context.RequireTables(ctx, "routes", "trips", "stop_times")
	if err != nil || !ready {
		return err
	}
	if context.ShouldIgnore(ctx) {
		return nil
	}
	routesWithWindows, err := standardutils.RoutesWithWindows(ctx)
	if err != nil {
		return err
	}
	return context.ForEachRow(ctx, "routes", []string{"continuous_drop_off", "route_id"}, func(row *contextTypes.ValidationContext) error {
		values, err := queries.Fields(row.Source, "continuous_drop_off", "route_id")
		if err != nil {
			return err
		}
		value := values["continuous_drop_off"]
		if value == "" {
			return nil
		}
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 0 || parsed > 3 {
			context.AddMessage(row, context.GetTranslatedMessage(row, "invalid", value))
			return nil
		}
		if parsed != 1 && routesWithWindows[values["route_id"]] {
			context.AddMessage(row, context.GetTranslatedMessage(row, "forbidden_with_window"))
		}
		return nil
	})
}
