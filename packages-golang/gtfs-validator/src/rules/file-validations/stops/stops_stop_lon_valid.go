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
  - Field: stop_lon
  - Presence: Required in GTFS v30
  - Type: Longitude

# Description

Checks that each supplied stop_lon is a longitude between -180 and 180 degrees.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopLonValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "stops", "stop_lon")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "stops", "stop_lon", "The stop_lon field must be a longitude between -180 and 180 degrees.", func(value string) bool {
		return validators.ValidateDecimal(value, -180, 180)
	})
}
