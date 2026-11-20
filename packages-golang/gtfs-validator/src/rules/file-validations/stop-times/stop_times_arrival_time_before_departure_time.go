package stoptimes

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: arrival_time, departure_time
  - Presence: Conditionally Required
  - Type: Time

# Description

Arrival must be on or before departure at the same stop. Equal times are
valid. Rows with missing or malformed times are handled by the field checks.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesArrivalTimeBeforeDepartureTime(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stop_times table exists
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Report arrivals that are later than departures at the same stop
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"arrival_time", "departure_time"}, func(row int, values map[string]string) error {
		arrival, departure := values["arrival_time"], values["departure_time"]
		if order, valid := validators.CompareTimes(arrival, departure); valid && order > 0 {
			findings = append(findings, types.Finding{
				Description: "The arrival_time must be on or before the departure_time.",
				Message:     fmt.Sprintf("The arrival_time %q is after the departure_time %q.", arrival, departure),
				Severity:    config.Severity,
				FileName:    "stop_times.txt",
				Field:       "arrival_time",
				Rows:        []int{row},
			})
		}
		return nil
	})

	// 3. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
