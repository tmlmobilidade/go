package trips

import (
	"context"
	"database/sql"
	"fmt"
	"maps"
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a trip.

Validation: Reports duplicate nonblank trip_id values with all of their source rows.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripIDUnique(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	rowsByID := make(map[string][]int)
	err := fields.ForEachValue(ctx, db, tripsTable, "trip_id", func(row int, value string) {
		rowsByID[value] = append(rowsByID[value], row)
	})
	if err != nil {
		return false, nil, err
	}

	var findings []types.Finding
	for _, id := range slices.Sorted(maps.Keys(rowsByID)) {
		rows := rowsByID[id]
		if len(rows) > 1 {
			findings = append(findings, types.Finding{
				Description: "The trip_id field contains duplicate IDs.",
				Severity:    config.Severity,
				Message:     fmt.Sprintf("Trip ID %q is used on multiple rows.", id),
				FileName:    tripsFile,
				Field:       "trip_id",
				Rows:        rows,
			})
		}
	}
	return len(findings) == 0, findings, nil
}
