package trips

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"strings"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: shape_id
  - Presence: Conditionally Required
  - Type: Foreign Key referencing shapes.shape_id

# Description

Identifies a geospatial shape describing the vehicle travel path for a trip.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in stop_times.txt.
  - Optional otherwise.

Validation: Each supplied shape_id must exist in shapes.shape_id.
Missing values are handled by trip_shape_id_exists.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripShapeIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the trips table exists
	exists, err := sqlutils.TableExists(ctx, db, "trips")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Check each supplied ID against its referenced tables
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"shape_id"}, func(row int, values map[string]string) error {
		value := values["shape_id"]
		if strings.TrimSpace(value) == "" {
			return nil
		}
		for _, table := range []string{"shapes"} {
			exists, err := sqlutils.TableExists(ctx, db, table)
			if err != nil {
				return err
			}
			if !exists {
				continue
			}
			exists, err = sqlutils.Exists(ctx, db, table, "shape_id", value)
			if err != nil {
				return err
			}
			if exists {
				return nil
			}
		}
		findings = append(findings, types.Finding{Description: "The shape_id references a missing shape_id.", Message: fmt.Sprintf("Unknown shape_id %q.", value), Severity: config.Severity, FileName: "trips.txt", Field: "shape_id", Rows: []int{row}})
		return nil
	})

	// 3. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
