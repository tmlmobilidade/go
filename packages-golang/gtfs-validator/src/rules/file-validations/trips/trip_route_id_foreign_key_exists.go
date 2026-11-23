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
  - Field: route_id
  - Presence: Required
  - Type: Foreign Key referencing routes.route_id

# Description

Identifies a route.

Validation: Each supplied route_id must exist in routes.route_id.
Missing values are handled by trip_route_id_exists.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripRouteIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the trips table exists
	exists, err := sqlutils.TableExists(ctx, db, "trips")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Check each supplied ID against its referenced tables
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"route_id"}, func(row int, values map[string]string) error {
		value := values["route_id"]
		if strings.TrimSpace(value) == "" {
			return nil
		}
		for _, table := range []string{"routes"} {
			exists, err := sqlutils.TableExists(ctx, db, table)
			if err != nil {
				return err
			}
			if !exists {
				continue
			}
			exists, err = sqlutils.Exists(ctx, db, table, "route_id", value)
			if err != nil {
				return err
			}
			if exists {
				return nil
			}
		}
		findings = append(findings, types.Finding{Description: "The route_id references a missing route_id.", Message: fmt.Sprintf("Unknown route_id %q.", value), Severity: config.Severity, FileName: "trips.txt", Field: "route_id", Rows: []int{row}})
		return nil
	})

	// 3. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
