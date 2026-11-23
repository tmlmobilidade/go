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
  - Field: stop_timezone
  - Presence: Optional
  - Type: Timezone

# Description

Checks that each supplied stop_timezone is a valid IANA time zone.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopTimezoneValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "stops", "stop_timezone", "The stop_timezone field must be empty.", func(string) bool { return false })
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "stops", "stop_timezone", "The stop_timezone field must be a valid IANA time zone.", validators.ValidateTimezone)
}
