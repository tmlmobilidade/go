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
  - Field: service_id
  - Presence: Required
  - Type: Foreign Key referencing calendar.service_id or calendar_dates.service_id

# Description

Identifies a service.

Validation: Requires the service_id column and nonblank values.
At forbidden severity, rejects supplied values.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripServiceIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, tripsTable, "service_id")
	}

	// 2. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, tripsTable, "service_id", true)
}
