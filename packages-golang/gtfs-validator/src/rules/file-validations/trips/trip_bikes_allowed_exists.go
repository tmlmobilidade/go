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
- Field: bikes_allowed
- Presence: Optional
- Type: Enum

# Description

Indicates whether bikes are allowed.

Valid options are:

  - 0 or empty - No bike information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one bicycle.
  - 2 - No bicycles are allowed on this trip.

Validation: Requires the bikes_allowed column and nonblank values when configured at error severity.
At forbidden severity, rejects supplied values.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripBikesAllowedExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, tripsTable, "bikes_allowed", "The bikes_allowed field must be empty.", func(string) bool { return false })
	}
	return fields.CheckPresence(ctx, db, config, tripsTable, "bikes_allowed", false)
}
