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
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a trip.

Validation: Requires the trip_id column and nonblank values.
At forbidden severity, rejects supplied values.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, tripsTable, "trip_id", "The trip_id field must be empty.", func(string) bool { return false })
	}

	// 2. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, tripsTable, "trip_id", true)
}
