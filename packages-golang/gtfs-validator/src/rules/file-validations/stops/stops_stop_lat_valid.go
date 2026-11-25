package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_lat
  - Presence: Required in GTFS v30
  - Type: Latitude

# Description

Checks that each supplied stop_lat is a latitude between -90 and 90 degrees.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopLatValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "stops", "stop_lat")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "stops", "stop_lat", "The stop_lat field must be a latitude between -90 and 90 degrees.", func(value string) bool {
		return validators.ValidateDecimal(value, -90, 90)
	})
}
