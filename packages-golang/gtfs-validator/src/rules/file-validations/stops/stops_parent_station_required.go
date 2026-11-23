package stops

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: parent_station
  - Presence: Conditionally required
  - Type: Foreign ID

# Description

A nonblank parent_station is required for location types 2, 3, and 4.
The check skips location types that cannot be parsed as integers.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsParentStationRequired(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stops table exists
	exists, err := sqlutils.TableExists(ctx, db, "stops")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Report rows that violate the location type restriction
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stops", []string{"location_type", "parent_station"}, func(row int, values map[string]string) error {
		locationType, err := strconv.Atoi(strings.TrimSpace(values["location_type"]))
		if err != nil {
			return nil
		}
		value := values["parent_station"]
		present := strings.TrimSpace(value) != ""
		if locationType >= 2 && locationType <= 4 && !present {
			findings = append(findings, types.Finding{
				Description: "A parent_station is required for location types 2, 3, and 4.",
				Message:     fmt.Sprintf("The parent_station is missing for location_type %d.", locationType),
				Severity:    config.Severity,
				FileName:    "stops.txt",
				Field:       "parent_station",
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
