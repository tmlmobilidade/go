package trips

import (
	"context"
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_headsign
  - Presence: Optional
  - Type: Text

# Description

Text that appears on signage identifying the trip's destination to riders.
This field is recommended for all services with headsign text displayed on the vehicle which may be used to distinguish amongst trips in a route.

If the headsign changes during a trip, values for `trip_headsign` may be overridden by defining values in `stop_times.stop_headsign` for specific `stop_time`s along the trip.

Validation: Requires the trip_headsign column and nonblank values when configured at error severity.
At forbidden severity, rejects supplied values.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripHeadsignExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, tripsTable, "trip_headsign")
	}

	// 2. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, tripsTable, "trip_headsign", false)
}
