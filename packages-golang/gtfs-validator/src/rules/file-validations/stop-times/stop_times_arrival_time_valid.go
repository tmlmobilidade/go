package stoptimes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: arrival_time
  - Presence: Conditionally required
  - Type: Time

# Description

Checks that each supplied arrival_time is an H:MM:SS or HH:MM:SS service-day time, including hours beyond midnight.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesArrivalTimeValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "stop_times", "arrival_time", "The arrival_time field must be empty.", func(string) bool { return false })
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "stop_times", "arrival_time", "The arrival_time field must be an H:MM:SS or HH:MM:SS service-day time, including hours beyond midnight.", validators.ValidateTime)
}
