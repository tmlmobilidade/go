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
  - Field: route_id
  - Presence: Required
  - Type: Foreign Key referencing routes.route_id

# Description

Identifies a route.

Validation: Requires the route_id column and nonblank values.
At forbidden severity, rejects supplied values.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripRouteIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, tripsTable, "route_id", "The route_id field must be empty.", func(string) bool { return false })
	}

	// 2. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, tripsTable, "route_id", true)
}
