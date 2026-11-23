package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_lat
  - Presence: Required in GTFS v30
  - Type: Latitude

# Description

Requires the stop_lat column and a nonblank value on each row.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopLatExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "stops", "stop_lat", "The stop_lat field must be empty.", func(string) bool { return false })
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "stops", "stop_lat", true)
}
